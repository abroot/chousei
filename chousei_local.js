// usage: node chousei_local.js
const puppeteer = require('puppeteer');

async function automateChoseiSan() {
    // ブラウザをヘッドレスモードで起動
    console.log("launch")
    const browser = await puppeteer.launch();
    console.log("newPage")
    const page = await browser.newPage();

    console.log("goto")
    // 調整さんのページにアクセス
    await page.goto('https://chouseisan.com/s?h=519a02722c1f476f9fa239f38662dd6a', {
        // waitUntil: 'networkidle2'  // ネットワークアイドルを待つ
        waitUntil: 'domcontentloaded'  // DOM が完全に読み込まれ、構造が整った時点で待機を終了
    });

    // 「ふくだりゅうじbot」の回答を探す
    console.log("既存回答を確認");
    const existingAnswer = await page.evaluate(() => {
        const members = document.querySelectorAll('td[id^="member_"] a'); // IDが"member_"で始まる要素内のリンクを取得
        return Array.from(members).some(member => member.textContent.trim() === 'ふくだりゅうじbot');
    });

    // 既存回答の有無で分岐
    if (existingAnswer) {
        console.log("既に回答済みのためスキップ");
    } else {
        // 入力ボタン
        console.log("入力ボタン押す")
        await page.click('#add_btn');

        // 必要な入力フィールドを特定して操作
        console.log("フォーム入力")
        await page.type('#f_name', 'ふくだりゅうじbot');
        await page.type('.hitokoto-input', 'これはbotの入力');
        await page.click('#oax_0_0'); // まる
        // await page.click('#oax_0_1'); // さんかく
        // await page.click('#oax_0_2'); // ばつ

        // フォーム送信
        console.log("フォーム送信")
        await page.click('#memUpdBtn');

        // 結果を取得
        console.log("done確認")
        await page.waitForSelector('.input-done');  // 結果が表示される要素を待つ
    }

    // ブラウザを閉じる
    console.log("close")
    await browser.close();
}

automateChoseiSan();
