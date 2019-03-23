import { Browser } from 'puppeteer';

export default async function closeBrowser(browser: Browser): Promise<void> {
	await browser.close();
}
