const express = require('express');
const chromium = require("@sparticuz/chromium");
const puppeteer = require('puppeteer-core');

const app = express();
const port = process.env.PORT || 3000;
const PARTICIPANT = 'ふくだりゅうじbot';
const COMMENT = 'ふくだりゅうじbot';

// Webhook のリクエスト内容を解析するために body-parser を使用
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Webhook エンドポイント
app.post('/webhook', async (req, res) => {
    console.log("Webhook received. Request body:");
    console.log(req.body); // Webhook から送信された内容をログ出力

    try {
        await automateChoseiSan();
        res.status(200).send("Automation completed.");
    } catch (error) {
        console.error("Error during automation:", error);
        res.status(500).send("Automation failed.");
    }
});

// 自動入力関数
async function automateChoseiSan() {
    console.log("Launching Puppeteer...");
    const browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
    });

    const page = await browser.newPage();
    console.log("Navigating to Chousei-san page...");
    await page.goto('https://chouseisan.com/s?h=519a02722c1f476f9fa239f38662dd6a', {
        waitUntil: 'domcontentloaded'
    });

    // 既存の回答を探す
    console.log("Checking for existing answers");
    const existingAnswer = await page.evaluate((BOT_NAME) => {
        const members = document.querySelectorAll('td[id^="member_"] a'); // IDが"member_"で始まる要素内のリンクを取得
        return Array.from(members).some(member => member.textContent.trim() === BOT_NAME);
    });

    // 既存回答の有無で分岐
    if (existingAnswer) {
        console.log("Answer already exists, skipping");
    } else {
        // 入力ボタンをクリック
        console.log("Clicking input button...");
        await page.click('#add_btn');

        // フォームに入力
        console.log("Filling out the form...");
        await page.type('#f_name', BOT_NAME);
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
