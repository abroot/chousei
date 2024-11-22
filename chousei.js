const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = process.env.PORT || 3000;

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
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: '/opt/render/.cache/puppeteer/chrome'
    });

    const page = await browser.newPage();
    console.log("Navigating to Chousei-san page...");
    await page.goto('https://chouseisan.com/s?h=519a02722c1f476f9fa239f38662dd6a', {
        waitUntil: 'domcontentloaded'
    });

    // 入力ボタンをクリック
    console.log("Clicking input button...");
    await page.click('#add_btn');

    // フォームに入力
    console.log("Filling out the form...");
    await page.type('#f_name', 'ふくだりゅうじbot');
    await page.type('.hitokoto-input', 'これはbotの入力');

    // 参加ステータスを「まる」に設定
    console.log("Selecting participation status...");
    await page.click('#oax_0_0');

    // フォーム送信
    console.log("Submitting the form...");
    await page.click('#memUpdBtn');

    // 結果が表示されるまで待機
    console.log("Waiting for confirmation...");
    await page.waitForSelector('.input-done');

    console.log("Automation completed. Closing browser...");
    await browser.close();
}

// サーバー起動
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
