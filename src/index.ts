import { Browser, Page, launch } from 'puppeteer';
import { WorkBook, readFile } from 'xlsx';
// import * as fs from 'fs';
import * as dotenv from 'dotenv';

/**
 * Create Browser instance
 *
 * @async
 *
 * @returns {Browser} Returns a Browser instance from puppeteer
 */
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
/**
 * Login to task URL
 *
 * @async
 *
 * @param {Page} browserPage Page object from Browser instance
 * @param {string} loginUrl Login page URL
 * @param {string} username Login username
 * @param {string} password Login password
 *
 * @returns {Page} Returns a ready to use Page object
 */
async function loginPage(
	browserPage: Page,
	loginUrl: string,
	username: string,
	password: string
): Promise<Page> {
	try {
		await browserPage.goto(loginUrl);

		await browserPage.waitFor('input[name=j_username]');
		await browserPage.type('input[name=j_username]', username);
		await browserPage.type('input[name=j_password]', password);

		await Promise.all([
			browserPage.waitForNavigation(),
			browserPage.$eval('form#form1', form =>
				(form as HTMLFormElement).submit()
			)
		]);
		await browserPage.waitFor('#alert-Flag-2');
		await browserPage.click('#alert-Flag-2');
		return browserPage;
	} catch (error) {
		throw new Error(error.message);
	}
}

async function runQueries(taskUrl: string, browserPage: Page) {
	try {
		await browserPage.goto(taskUrl);
		await browserPage.waitFor('#noba');
		await browserPage.type('#noba', '12/test');
		await browserPage.type('#tglba', '12-12-2018');
		await browserPage.type('#npwp', '03.097.152.7-219.000');
		await browserPage.click('#namaWP');
		await browserPage.$eval(
			'#alasan',
			select => ((select as HTMLSelectElement).value = '5')
		);
		await browserPage.type('#nipAr', '198910062014021002');
		await browserPage.click('#namaAr');
		await browserPage.waitForNavigation();
	} catch (error) {
		// tslint:disable-next-line:no-console
		// fs.appendFile('log/error.log', error.message, () => console.log('Error'));
		throw new Error(error.message);
	}
}

/**
 * Close Browser instance
 *
 * @async
 *
 * @param {Browser} browser Browser object from puppeteer
 */
async function closeBrowser(browser: Browser) {
	try {
		await browser.close();
	} catch (error) {
		throw new Error(error.message);
	}
}

async function runTasks(
	loginUrl: string,
	taskUrl: string,
	username: string,
	password: string
) {
	try {
		const browser: Browser = await openBrowser();
		const newPage: Page = await browser.newPage();
		await newPage.setViewport({ width: 1280, height: 720 });
		const readyPage: Page = await loginPage(
			newPage,
			loginUrl,
			username,
			password
		);

		await runQueries(taskUrl, readyPage);

		await closeBrowser(browser);
	} catch (error) {
		throw new Error(error.message);
	}
}

// Setup environment variables
dotenv.config();

const username: string = process.env.USERNAME as string;
const password: string = process.env.PASSWORD as string;

// Setup xlsx workbook
const workbook: WorkBook = readFile('data.xlsx');

runTasks(
	'https://ereg/login',
	'https://ereg/dashboard/prosespermohonan/penetapannejabatan/',
	username,
	password
);
