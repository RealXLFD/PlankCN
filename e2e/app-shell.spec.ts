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

	test("renders the desktop shell, toggles the sidebar, switches theme, and switches to dark mode", async ({
		browser,
		context,
		page
	}) => {
		await page.setViewportSize({ width: 1440, height: 960 });
		await gotoStableShell(page);

		await expect(page.getByTestId("app-shell")).toBeVisible();
		await expect(page.getByTestId("app-topbar")).toBeVisible();
		await expect(page.getByTestId("app-sidebar")).toBeVisible();
		await expect(page.getByTestId("main-view")).toBeVisible();

		const sidebarState = page
			.getByTestId("app-sidebar")
			.locator("xpath=ancestor::*[@data-slot='sidebar'][1]");
		const toggleSidebarButton = page.getByRole("button", { name: "Toggle sidebar" });

		await expect(sidebarState).toHaveAttribute("data-state", "expanded");
		await expect(sidebarState).toHaveAttribute("data-collapsible", "");

		await page.screenshot({
			fullPage: true,
			path: path.join(evidenceDir, "task-7-shell-desktop.png")
		});

		await expect
			.poll(
				async () => {
					await toggleSidebarButton.click();
					return await sidebarState.getAttribute("data-state");
				},
				{ intervals: [250, 500, 1000], timeout: 10000 }
			)
			.toBe("collapsed");
		await expect(sidebarState).toHaveAttribute("data-collapsible", "icon");

		await expect
			.poll(
				async () => {
					await toggleSidebarButton.click();
					return await sidebarState.getAttribute("data-state");
				},
				{ intervals: [250, 500, 1000], timeout: 10000 }
			)
			.toBe("expanded");
		await expect(sidebarState).toHaveAttribute("data-collapsible", "");

		await page.getByRole("button", { name: "切换主题" }).click();
		await page.getByRole("menuitemradio", { name: "Slate" }).click();
		await expect(page.locator("html")).toHaveAttribute("data-theme", "slate");
		await expect
			.poll(async () => await page.evaluate(() => window.localStorage.getItem("shadcn-startup-theme")))
			.toBe("slate");

		const persistedThemeContext = await browser.newContext({
			storageState: await context.storageState()
		});
		const persistedPage = await persistedThemeContext.newPage();
		await persistedPage.goto("/");
		await expect(persistedPage.getByTestId("app-shell")).toBeVisible();
		await expect(persistedPage.locator("html")).toHaveAttribute("data-theme", "slate");
		await persistedThemeContext.close();

		await expect
			.poll(
				async () => {
					await page.getByRole("button", { name: "切换亮暗模式" }).click();
					return (await page.locator("html").getAttribute("class")) ?? "";
				},
				{ intervals: [250, 500, 1000], timeout: 10000 }
			)
			.toMatch(/dark/);

		const persistedDarkContext = await browser.newContext({
			storageState: await context.storageState()
		});
		const persistedDarkPage = await persistedDarkContext.newPage();
		await persistedDarkPage.goto("/");
		await expect(persistedDarkPage.getByTestId("app-shell")).toBeVisible();
		await expect(persistedDarkPage.locator("html")).toHaveClass(/dark/);
		await persistedDarkContext.close();

		await page.screenshot({
			fullPage: true,
			path: path.join(evidenceDir, "task-7-shell-desktop-dark.png")
		});
	});

	test("renders the mobile shell drawer without console noise", async ({ page }) => {
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
		await expect(page.getByTestId("app-topbar")).toBeVisible();
		await expect(page.getByTestId("main-view")).toBeVisible();

		const toggleSidebarButton = page.getByRole("button", { name: "Toggle sidebar" });
		const mobileSidebar = page.locator('[data-testid="app-sidebar"][data-mobile="true"]');
		await expect
			.poll(
				async () => {
					await toggleSidebarButton.click();
					return await mobileSidebar.count();
				},
				{ intervals: [250, 500, 1000], timeout: 10000 }
			)
			.toBe(1);
		await expect(mobileSidebar).toBeVisible();
		await expect(mobileSidebar).toHaveAttribute("data-mobile", "true");

		await page.screenshot({
			fullPage: true,
			path: path.join(evidenceDir, "task-7-shell-mobile.png")
		});

		await page.keyboard.press("Escape");
		await expect(mobileSidebar).toBeHidden();

		expect([...consoleMessages, ...pageErrors]).toEqual([]);
	});
});
