export type ThemeName = 'zinc' | 'neutral' | 'stone' | 'slate' | 'gray';
export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedMode = Exclude<ThemeMode, 'system'>;

const THEME_KEY = 'trellocn-theme';
const MODE_KEY = 'trellocn-mode';

const THEMES = ['zinc', 'neutral', 'stone', 'slate', 'gray'] as const;
const MODES = ['light', 'dark', 'system'] as const;

let currentTheme = $state<ThemeName>('zinc');
let currentMode = $state<ThemeMode>('system');
let mediaQueryBound = false;

function isThemeName(value: string | null): value is ThemeName {
	return !!value && THEMES.includes(value as ThemeName);
}

function isThemeMode(value: string | null): value is ThemeMode {
	return !!value && MODES.includes(value as ThemeMode);
}

function getSystemMode(): ResolvedMode {
	if (typeof window === 'undefined') {
		return 'dark';
	}

	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveMode(mode: ThemeMode = currentMode): ResolvedMode {
	return mode === 'system' ? getSystemMode() : mode;
}

function applyTheme() {
	if (typeof document === 'undefined') {
		return;
	}

	const html = document.documentElement;

	if (currentTheme === 'zinc') {
		html.removeAttribute('data-theme');
	} else {
		html.setAttribute('data-theme', currentTheme);
	}

	html.classList.toggle('dark', resolveMode() === 'dark');
}

export function getThemeStore() {
	function init() {
		if (typeof window === 'undefined') {
			return;
		}

		const savedTheme = localStorage.getItem(THEME_KEY);
		const savedMode = localStorage.getItem(MODE_KEY);

		if (isThemeName(savedTheme)) {
			currentTheme = savedTheme;
		}

		if (isThemeMode(savedMode)) {
			currentMode = savedMode;
		}

		if (!mediaQueryBound) {
			const media = window.matchMedia('(prefers-color-scheme: dark)');
			media.addEventListener('change', () => {
				if (currentMode === 'system') {
					applyTheme();
				}
			});
			mediaQueryBound = true;
		}

		applyTheme();
	}

	function setTheme(theme: ThemeName) {
		currentTheme = theme;

		if (typeof window !== 'undefined') {
			localStorage.setItem(THEME_KEY, theme);
		}

		applyTheme();
	}

	function setMode(mode: ThemeMode) {
		currentMode = mode;

		if (typeof window !== 'undefined') {
			localStorage.setItem(MODE_KEY, mode);
		}

		applyTheme();
	}

	function toggleMode() {
		setMode(resolveMode() === 'dark' ? 'light' : 'dark');
	}

	function cycleMode() {
		switch (currentMode) {
			case 'system':
				setMode('light');
				break;
			case 'light':
				setMode('dark');
				break;
			case 'dark':
				setMode('system');
				break;
		}
	}

	return {
		get theme() {
			return currentTheme;
		},
		get mode() {
			return currentMode;
		},
		get isDark() {
			return resolveMode() === 'dark';
		},
		init,
		setTheme,
		setMode,
		toggleMode,
		cycleMode,
		resolveMode
	};
}

export const THEME_OPTIONS: { value: ThemeName; label: string }[] = [
	{ value: 'zinc', label: 'Zinc' },
	{ value: 'neutral', label: 'Neutral' },
	{ value: 'stone', label: 'Stone' },
	{ value: 'slate', label: 'Slate' },
	{ value: 'gray', label: 'Gray' }
];
