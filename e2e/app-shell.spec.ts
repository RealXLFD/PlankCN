import { mkdirSync } from "node:fs";
import path from "node:path";

import { expect, test, type Page } from "@playwright/test";

const evidenceDir = path.resolve(".sisyphus/evidence");

async function gotoStableShell(page: Page) {
	await page.goto("/");
	await expect(page.getByTestId("app-shell")).toBeVisible();
	await page.reload();
	await expect(page.getByTestId("app-shell")).toBeVisible();
}

test.describe("app shell route", () => {
	test.use({ colorScheme: "light" });

	test.beforeEach(async ({ context, page }) => {
		mkdirSync(evidenceDir, { recursive: true });
		await context.clearCookies();
		await page.addInitScript(() => {
			window.localStorage.clear();
		});
	});

	test("renders the app shell with board interface", async ({ page }) => {
		await page.setViewportSize({ width: 1440, height: 960 });
		await gotoStableShell(page);

		await expect(page.getByTestId("app-shell")).toBeVisible();
		await expect(page.getByText("PlankCN")).toBeVisible();
		await expect(page.getByPlaceholder("搜索卡片...")).toBeVisible();
		await expect(page.getByRole("button", { name: "重置布局" })).toBeVisible();
		await expect(page.getByRole("button", { name: "清空看板" })).toBeVisible();
		await expect(page.getByRole("button", { name: "上传背景" })).toBeVisible();
		await expect(page.getByRole("button", { name: "设置" })).toBeVisible();

		await page.screenshot({
			fullPage: true,
			path: path.join(evidenceDir, "task-7-shell-desktop.png")
		});

		await page.getByRole("button", { name: "设置" }).click();
		await expect(page.getByText("面板模糊度")).toBeVisible();
		await expect(page.getByText("视图缩放")).toBeVisible();

		await page.screenshot({
			fullPage: true,
			path: path.join(evidenceDir, "task-7-shell-desktop-settings.png")
		});
	});

	test("theme toggle persists across reloads", async ({ browser, context, page }) => {
		await page.setViewportSize({ width: 1440, height: 960 });
		await gotoStableShell(page);

		await page.getByRole("button", { name: "切换亮暗模式" }).click();
		await expect(page.locator("html")).toHaveClass(/dark/);

		const persistedContext = await browser.newContext({
			storageState: await context.storageState()
		});
		const persistedPage = await persistedContext.newPage();
		await persistedPage.goto("/");
		await expect(persistedPage.getByTestId("app-shell")).toBeVisible();
		await expect(persistedPage.locator("html")).toHaveClass(/dark/);
		await persistedContext.close();

		await page.screenshot({
			fullPage: true,
			path: path.join(evidenceDir, "task-7-shell-desktop-dark.png")
		});
	});

	test("renders the mobile app shell without console noise", async ({ page }) => {
		const consoleMessages: string[] = [];
		const pageErrors: string[] = [];

		page.on("console", (message) => {
			if (message.type() === "warning" || message.type() === "error") {
				consoleMessages.push(`${message.type()}: ${message.text()}`);
			}
		});

		page.on("pageerror", (error) => {
			pageErrors.push(error.message);
		});

		await page.setViewportSize({ width: 390, height: 844 });
		await gotoStableShell(page);

		await expect(page.getByTestId("app-shell")).toBeVisible();
		await expect(page.getByText("PlankCN")).toBeVisible();

		await page.screenshot({
			fullPage: true,
			path: path.join(evidenceDir, "task-7-shell-mobile.png")
		});

		expect([...consoleMessages, ...pageErrors]).toEqual([]);
	});
});