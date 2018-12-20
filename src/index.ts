import { Browser, Page, launch } from 'puppeteer';
import { WorkBook, readFile } from 'xlsx';
import { appendFile } from 'fs';
import * as dotenv from 'dotenv';

interface ITaskObject {
	alasan: number;
	nipAr: string;
	noLap: string;
	npwp: string;
	order: number;
}

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
		await browserPage.waitFor(500);

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

async function runQueries(
	taskUrl: string,
	browserPage: Page,
	taskObject: ITaskObject
) {
	try {
		await browserPage.waitFor(200);
		await browserPage.goto(taskUrl);
		await browserPage.waitFor('#noba');
		await browserPage.type('#noba', taskObject.noLap);
		await browserPage.type('#tglba', '19-12-2018');
		await browserPage.type('#npwp', taskObject.npwp);
		await browserPage.click('#namaWP');
		await browserPage.waitFor(700);

		const statusWP = await browserPage.$eval(
			'#statusWP',
			input => (input as HTMLInputElement).value
		);

		await appendFile(
			'log/error.log',
			`${taskObject.order}\t${taskObject.npwp}\t${statusWP}\n`,
			() => {
				// tslint:disable-next-line:no-console
				console.log(`${taskObject.npwp} Status = ${statusWP}`);
			}
		);

		await browserPage.select('#alasan', taskObject.alasan.toString());
		await browserPage.type('#nipAr', taskObject.nipAr);
		await browserPage.click('#namaAr');
		await browserPage.waitFor(400);
		await browserPage.click('button[type=submit]');

		if (statusWP === 'Aktif') {
			await browserPage.waitFor(800);
			await browserPage.click('#print');
			await browserPage.waitFor(1000);
		}
	} catch (error) {
		// tslint:disable-next-line:no-console
		console.log(error.message);
		// throw new Error(error.message);
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
	password: string,
	workbook: WorkBook
) {
	try {
		const browser: Browser = await openBrowser();
		const newPage: Page = await browser.newPage();
		await newPage.setViewport({ width: 1366, height: 740 });
		const readyPage: Page = await loginPage(
			newPage,
			loginUrl,
			username,
			password
		);

		for (let order = 208; order <= 2000; order++) {
			const taskObject = getWorkbook(workbook, order);
			await runQueries(taskUrl, readyPage, taskObject);
		}

		await closeBrowser(browser);
	} catch (error) {
		throw new Error(error.message);
	}
}

function getWorkbook(workbook: WorkBook, order: number): ITaskObject {
	const worksheet = workbook.Sheets[workbook.SheetNames[0]];

	const npwp = worksheet['A' + order.toString()].v;
	const noLap = worksheet['C' + order.toString()].v;
	const nipAr = worksheet['H' + order.toString()].v;
	let alasan: number;

	switch (worksheet['E' + order.toString()].v) {
		case 'A':
			alasan = 1;
			break;
		case 'B':
			alasan = 2;
			break;
		case 'C':
			alasan = 3;
			break;
		case 'D':
			alasan = 4;
			break;
		case 'E':
			alasan = 5;
			break;
		default:
			alasan = 5;
			break;
	}

	return {
		alasan,
		nipAr,
		noLap,
		npwp,
		order
	};
}

// Setup environment variables
dotenv.config();

const username: string = process.env.IP as string;
const password: string = process.env.PASSWORD as string;

// Setup xlsx workbook
const workbook: WorkBook = readFile('data.xlsx');

runTasks(
	'https://ereg/login',
	'https://ereg/dashboard/prosespermohonan/penetapannejabatan/',
	username,
	password,
	workbook
);
