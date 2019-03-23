import { Page } from 'puppeteer';
import { WorkBook } from 'xlsx/types';
import { appendFile } from 'fs';

import getWorkbook from './getWorkbook';

import { TaskObject, SetupObject } from '../models';

export default async function runQueries(
	taskUrl: string,
	browserPage: Page,
	setupObject: SetupObject,
	workbook: WorkBook
): Promise<string | void> {
	try {
		let taskObject: TaskObject;

		await browserPage.goto(taskUrl, { timeout: 60000 });

		await browserPage.waitForSelector('#txtNoFormulir');
		await browserPage.type('#txtNoFormulir', setupObject.noFormulir);
		await browserPage.select('#ddlJenisTransaksi', setupObject.jenisTransaksi);
		await browserPage.type('#txtThnPajak', setupObject.tahunSPOP);
		await browserPage.type('#txtNop', setupObject.noObjekPajak);

		await browserPage.click('.button-next');

		for (let order = setupObject.start; order <= setupObject.end; order++) {
			taskObject = getWorkbook(workbook, order);
			await browserPage.$eval('#btnTambahWilayahAdm', (element: Element) => {
				(element as HTMLAnchorElement).click();
			});
			await browserPage.waitFor(300);
			await browserPage.type('#txtNmBangunan', taskObject.namaBangunan);
			await browserPage.waitFor(100);
			await browserPage.select(
				'#ddlJenisGunaBangunan',
				taskObject.jenisBangunan.toString()
			);
			await browserPage.waitFor(100);
			await browserPage.type(
				'#txtLuasBangunan',
				taskObject.luasBangunan.toString()
			);
			await browserPage.waitFor(300);
			await browserPage.click('#btnSimpanBangunanUmum');
			await browserPage.waitFor(300);
			await browserPage.click('button[data-bb-handler="confirm"]');
			await browserPage.waitFor(300);

			const date = new Date();
			await appendFile(
				'automation.log',
				`${date.toUTCString()} ${taskObject.namaBangunan}\n`,
				() => {
					console.log(`${date.toUTCString()} ${taskObject.namaBangunan}`);
				}
			);
		}
	} catch (error) {
		// eslint-disable-next-line
		console.log(error);
		await browserPage.waitFor(30000);
	}
}
