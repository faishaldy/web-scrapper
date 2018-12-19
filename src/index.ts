import { Browser, Page, launch } from 'puppeteer';
import * as xlsx from 'xlsx';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

async function openBrowser(): Promise<Browser> {
	try {
		return await launch({
			args: ['--no-sandbox'],
			headless: false,
			ignoreHTTPSErrors: true
		});
	} catch (error) {
		throw new Error(error.message);
	}
}

// tslint:disable:no-shadowed-variable
async function loginPage(
	browserPage: Page,
	loginUrl: string,
	username: string,
	password: string
): Promise<Page> {
	try {
		await browserPage.goto(loginUrl);
		await browserPage.$$eval('input.form-control', input => {
			(input[0] as HTMLInputElement).value = username;
			(input[1] as HTMLInputElement).value = password;
		});
		// await browserPage.type('input.form-control', username);
		// await browserPage.type('input.form-control', password);
		await Promise.all([
			browserPage.waitForNavigation(),
			browserPage.$eval('form#form1', form =>
				(form as HTMLFormElement).submit()
			)
		]);
		return browserPage;
	} catch (error) {
		throw new Error(error.message);
	}
}

async function runQueries(taskUrl: string, browserPage: Page) {
	try {
		await browserPage.goto(taskUrl);
		xlsx.readFile('list.xlsx');
		await Promise.all([
			browserPage.waitForNavigation(),
			// @ts-ignore
			browserPage.$eval('#loginform', form =>
				(form as HTMLFormElement).submit()
			)
		]);
	} catch (error) {
		// tslint:disable-next-line:no-console
		fs.appendFile('log/error.log', error.message, () => console.log('Error'));
		// throw new Error(error.message);
	}
}

async function closeBrowser(browser: Browser) {
	try {
		await browser.close();
	} catch (error) {
		throw new Error(error.message);
	}
}

async function runTasks(taskUrl: string, username: string, password: string) {
	try {
		const browser: Browser = await openBrowser();
		const newPage: Page = await browser.newPage();
		await newPage.setViewport({ width: 800, height: 480 });
		const readyPage: Page = await loginPage(
			newPage,
			taskUrl,
			username,
			password
		);
		await runQueries(taskUrl, readyPage);

		await closeBrowser(browser);
	} catch (error) {
		throw new Error(error.message);
	}
}

const username: string = '817932843';
const password: string = 'Aichan99';
// const username: string = (process.env.username as string) || '817932843';
// const password: string = (process.env.password as string) || 'Aichan99';

runTasks('http://ereg/login', username, password);
