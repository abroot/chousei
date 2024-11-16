const puppeteer = require('puppeteer');

async function checkPuppeteer() {
    console.log("launch")
    const browser = await puppeteer.launch();

    console.log("newPage")
    const page = await browser.newPage();

    console.log("goto")
    await page.goto('https://chouseisan.com/s?h=519a02722c1f476f9fa239f38662dd6a', {
        // waitUntil: 'networkidle2'  // ネットワークアイドルを待つ
        waitUntil: 'domcontentloaded'  // DOM が完全に読み込まれ、構造が整った時点で待機を終了
    });

    console.log("title")
    console.log(await page.title());

    console.log("close")
    await browser.close();
}

checkPuppeteer();
