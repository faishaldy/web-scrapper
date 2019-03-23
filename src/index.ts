import { Browser, Page } from 'puppeteer';
import { WorkBook, readFile } from 'xlsx';

import closeBrowser from './tasks/closeBrowser';
import loginPage from './tasks/loginPage';
import openBrowser from './tasks/openBrowser';
import runQueries from './tasks/runQueries';

import setupConfigs from './config';
import { SetupObject } from './models';

async function runTasks(
	loginUrl: string,
	taskUrl: string,
	setupObject: SetupObject,
	workbook: WorkBook
): Promise<string | void> {
	try {
		const browser: Browser = await openBrowser();
		const [newPage]: Page[] = await browser.pages();
		await newPage.setViewport({ width: 1440, height: 900 });

		const readyPage: Page = await loginPage(
			newPage,
			loginUrl,
			setupObject.username,
			setupObject.password
		);

		await runQueries(taskUrl, readyPage, setupObject, workbook);

		await closeBrowser(browser);
	} catch (error) {
		// eslint-disable-next-line
		console.log(error);
	}
}

const workbook: WorkBook = readFile('workbook.xlsx');

runTasks(
	'https://pbb.sidjpnine.intranet.pajak.go.id',
	'https://pbb.sidjpnine.intranet.pajak.go.id/pendataan/lspopbangunanumumall',
	setupConfigs,
	workbook
);
