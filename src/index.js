const puppeteer = require('puppeteer');
const fs = require('fs');
require('dotenv').config();

async function activateBrowser() {
	try {
		return await puppeteer.launch({
			args: ['--no-sandbox'],
			headless: true
		});
	} catch (error) {
		throw new Error(error.message);
	}
}

async function runQueries(queryUrl, queryPage) {
	try {
		await queryPage.goto(queryUrl);
		await queryPage.type('#ip', process.env.USERNAME);
		await queryPage.type('#password', process.env.PASSWORD);
		// await queryPage.type('#ip', '817932843');
		// await queryPage.type('#password', 'Aichan99');
		await Promise.all([
			queryPage.waitForNavigation(),
			queryPage.$eval('#loginform', form => form.submit())
		]);
		const data = await queryPage.evaluate(() => {
			const outerHTML = document.body.outerHTML;
			return outerHTML;
		});
		fs.appendFile('public/index.html', data, () => console.log('Succeed'));
	} catch (error) {
		throw new Error(error.message);
	}
}

async function closeBrowser(browser) {
	try {
		await browser.close();
	} catch (error) {
		throw new Error(error.message);
	}
}

async function runTasks(taskUrl) {
	try {
		const browser = await activateBrowser();
		const page = await browser.newPage();
		await page.setViewport({ width: 800, height: 480 });
		await runQueries(taskUrl, page);

		await closeBrowser(browser);
	} catch (error) {
		throw new Error(error.message);
	}
}

runTasks('https://mapping.pajak.go.id/v3/Account/Login');
