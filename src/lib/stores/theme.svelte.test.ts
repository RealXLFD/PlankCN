import { beforeEach, describe, expect, it, vi } from "vitest";

import { getThemeStore } from "./theme.svelte";

const storage = new Map<string, string>();

const localStorageMock = {
	getItem: vi.fn((key: string) => storage.get(key) ?? null),
	setItem: vi.fn((key: string, value: string) => {
		storage.set(key, value);
	}),
	removeItem: vi.fn((key: string) => {
		storage.delete(key);
	}),
	clear: vi.fn(() => {
		storage.clear();
	})
};

function createColorSchemeMatchMedia(prefersDark = false) {
	return vi.fn().mockImplementation((query: string) => ({
		matches: query.includes("prefers-color-scheme") ? prefersDark : false,
		media: query,
		onchange: null,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		addListener: vi.fn(),
		removeListener: vi.fn(),
		dispatchEvent: vi.fn()
	}));
}

const themeStore = getThemeStore();

beforeEach(() => {
	vi.restoreAllMocks();
	storage.clear();
	document.documentElement.className = "";
	document.documentElement.removeAttribute("data-theme");

	vi.stubGlobal("localStorage", localStorageMock);

	Object.defineProperty(window, "matchMedia", {
		configurable: true,
		writable: true,
		value: createColorSchemeMatchMedia(false)
	});

	themeStore.setTheme("zinc");
	themeStore.setMode("system");
});

describe("themeStore", () => {
	it("applies named themes with data-theme and persists the selection", () => {
		themeStore.setTheme("slate");

		expect(document.documentElement.getAttribute("data-theme")).toBe("slate");
		expect(window.localStorage.getItem("shadcn-startup-theme")).toBe("slate");

		themeStore.setTheme("zinc");

		expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
		expect(window.localStorage.getItem("shadcn-startup-theme")).toBe("zinc");
	});

	it("restores the saved theme and dark mode on init", () => {
		window.localStorage.setItem("shadcn-startup-theme", "stone");
		window.localStorage.setItem("shadcn-startup-mode", "dark");

		themeStore.init();

		expect(themeStore.theme).toBe("stone");
		expect(themeStore.mode).toBe("dark");
		expect(document.documentElement.getAttribute("data-theme")).toBe("stone");
		expect(document.documentElement.classList.contains("dark")).toBe(true);
	});
});
