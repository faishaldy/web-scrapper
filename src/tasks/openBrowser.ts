import { Browser, launch } from 'puppeteer';

export default async function openBrowser(): Promise<Browser> {
	return await launch({
		args: ['--no-sandbox', '--start-maximized'],
		headless: false,
		ignoreHTTPSErrors: true
	});
}
