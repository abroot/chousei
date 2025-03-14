const express = require('express');
const chromium = require("@sparticuz/chromium");
const puppeteer = require('puppeteer-core');

const app = express();
const port = process.env.PORT || 3000;
const PARTICIPANT = process.env.PARTICIPANT || 'dafault';
const COMMENT = process.env.COMMENT || '';

// Webhook のリクエスト内容を解析するために body-parser を使用
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Webhook エンドポイント
app.post('/webhook', async (req, res) => {
    console.log("回答者: " + process.env.PARTICIPANT);
    console.log("コメント: " + process.env.COMMENT);
    console.log("Webhook received. Request body:");
    console.log(req.body); // Webhook から送信された内容をログ出力

    try {
        // URLのチェック関数を呼び出す
        const url = extractChouseiSanUrl(req.body);
        if (url) {
            await automateChoseiSan(url);
            res.status(200).send("Automation completed.");
        } else {
            console.log("chouseisan.com not found.");
            res.status(200).send("chouseisan.com not found.");
        }
    } catch (error) {
        console.error("Error during automation:", error);
        res.status(500).send("Automation failed.");
    }
});

// Chousei-san URLを抽出する関数
function extractChouseiSanUrl(body) {
    if (!body || !body.events || !body.events[0] || !body.events[0].message || !body.events[0].message.text) {
        return null; // 必要なデータがない場合はnullを返す
    }

    console.log("message: " + body.events[0].message.text);
    const text = body.events[0].message.text;
    const match = text.match(/https?:\/\/chouseisan\.com\/s\?h=[a-zA-Z0-9]+/); // 正規表現で指定のフォーマットを検索
    return match ? match[0] : null; // URLが見つかった場合は返す、見つからなければnull
}

// 自動入力関数
async function automateChoseiSan(url) {
    console.log("Launching Puppeteer...");
    const browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
    });

    const page = await browser.newPage();
    console.log(`Navigating to Chousei-san page: ${url}`);
    await page.goto(url, {
        waitUntil: 'domcontentloaded'
    });

    // 既存の回答を探す
    console.log("Checking for existing answers");
    const existingAnswer = await page.evaluate((participantName) => {
        const members = document.querySelectorAll('td[id^="member_"] a'); // IDが"member_"で始まる要素内のリンクを取得
        return Array.from(members).some(member => member.textContent.trim() === participantName);
    }, PARTICIPANT);

    // 既存回答の有無で分岐
    if (existingAnswer) {
        console.log("Answer already exists, skipping");
    } else {
        // 入力ボタンをクリック
        console.log("Clicking input button...");
        await page.click('#add_btn');

        // フォームに入力
        console.log("Filling out the form...");
        await page.type('#f_name', PARTICIPANT);
        await page.type('.hitokoto-input', COMMENT);

        // 参加ステータスを「まる」に設定
        console.log("Selecting participation status...");
        await page.click('#oax_0_0');

        // フォーム送信
        console.log("Submitting the form...");
        await page.click('#memUpdBtn');

        // 結果が表示されるまで待機
        console.log("Waiting for confirmation...");
        await page.waitForSelector('.input-done');
        console.log("Automation completed");
    }
    
    console.log("Closing browser...");
    await browser.close();
}

// サーバー起動
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
