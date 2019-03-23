import { Page } from 'puppeteer';

export default async function loginPage(
	browserPage: Page,
	loginUrl: string,
	username: string,
	password: string
): Promise<Page> {
	await browserPage.goto(loginUrl, { timeout: 60000 });

	await browserPage.waitFor('input[name=j_username]');
	await browserPage.type('input[name=j_username]', username);
	await browserPage.type('input[name=j_password]', password);

	await browserPage.waitForNavigation({ timeout: 120000 });

	return browserPage;
}
