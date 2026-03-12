import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	getNextMode,
	getRevealRadius,
	toggleModeWithTransition,
	type ModeToggleDeps,
	type ResolvedMode,
	type ThemeMode,
	type StartViewTransition
} from './mode-toggle.ts';

function createColorSchemeMatchMedia(prefersDark = false, reducedMotion = false) {
	return vi.fn().mockImplementation((query: string) => ({
		matches: query.includes('prefers-reduced-motion') ? reducedMotion : prefersDark,
		media: query,
		onchange: null,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		addListener: vi.fn(),
		removeListener: vi.fn(),
		dispatchEvent: vi.fn()
	}));
}
function createDeps(options: {
	currentMode?: ThemeMode;
	resolvedMode?: ResolvedMode;
	prefersDark?: boolean;
	reducedMotion?: boolean;
	startViewTransition?: StartViewTransition;
	animateReveal?: ModeToggleDeps['animateReveal'];
	waitForModeFlush?: ModeToggleDeps['waitForModeFlush'];
} = {}) {
	let currentMode = options.currentMode ?? 'light';
	let resolvedMode = options.resolvedMode ?? (currentMode === 'system' ? 'light' : currentMode);

	Object.defineProperty(window, 'matchMedia', {
		configurable: true,
		writable: true,
		value: createColorSchemeMatchMedia(options.prefersDark ?? false, options.reducedMotion ?? false)
	});

	const animateReveal =
		options.animateReveal ??
		vi.fn<ModeToggleDeps['animateReveal']>(({ x, y, endRadius }) => {
			document.documentElement.animate?.(
				{
					clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`]
				},
				{
					duration: 500,
					easing: 'ease-in',
					pseudoElement: '::view-transition-new(root)'
				}
			);
		});

	const cycleMode = vi.fn(() => {
		currentMode = getNextMode(currentMode);
		resolvedMode =
			currentMode === 'system'
				? window.matchMedia('(prefers-color-scheme: dark)').matches
					? 'dark'
					: 'light'
				: currentMode;
		document.documentElement.classList.toggle('dark', resolvedMode === 'dark');
		document.documentElement.style.colorScheme = resolvedMode;
	});

	const deps: ModeToggleDeps = {
		getCurrentMode: () => currentMode,
		getResolvedMode: () => resolvedMode,
		resolveMode: (mode) => {
			if (mode === 'system') {
				return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
			}

			return mode;
		},
		cycleMode,
		prefersReducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
		startViewTransition: options.startViewTransition,
		waitForModeFlush: options.waitForModeFlush ?? (async () => {}),
		getViewport: () => ({ width: 1440, height: 900 }),
		animateReveal
	};

	return { deps, animateReveal, cycleMode };
}

beforeEach(() => {
	vi.restoreAllMocks();
	vi.clearAllMocks();
	document.documentElement.className = '';
	document.documentElement.style.colorScheme = 'light';

	Object.defineProperty(document.documentElement, 'animate', {
		configurable: true,
		writable: true,
		value: vi.fn()
	});
});

afterEach(() => {
	document.documentElement.className = '';
	document.documentElement.removeAttribute('style');
	vi.restoreAllMocks();
});

describe('toggleModeWithTransition', () => {
	it('animates the dark-mode toggle when view transitions are available', async () => {
		Object.defineProperty(window, 'matchMedia', {
			configurable: true,
			writable: true,
			value: createColorSchemeMatchMedia(false, false)
		});
		const startViewTransition = vi.fn<StartViewTransition>((callback) => ({
			ready: Promise.resolve(callback()).then(() => undefined)
		}));
		const waitForModeFlush = vi.fn(async () => {});
		const { deps, animateReveal, cycleMode } = createDeps({
			prefersDark: false,
			startViewTransition,
			waitForModeFlush
		});

		const strategy = await toggleModeWithTransition(deps, { clientX: 42, clientY: 24 });

		expect(strategy).toBe('transition');
		expect(startViewTransition).toHaveBeenCalledTimes(1);
		expect(waitForModeFlush).toHaveBeenCalledTimes(1);
		expect(cycleMode).toHaveBeenCalledTimes(1);
		expect(document.documentElement.classList.contains('dark')).toBe(true);
		expect(document.documentElement.style.colorScheme).toBe('dark');
		expect(animateReveal).toHaveBeenCalledWith(
			expect.objectContaining({
				x: 42,
				y: 24,
				endRadius: expect.any(Number)
			})
		);
		expect((document.documentElement.animate as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]).toEqual({
			clipPath: [
				'circle(0px at 42px 24px)',
				`circle(${getRevealRadius(42, 24, 1440, 900)}px at 42px 24px)`
			]
		});
		expect((document.documentElement.animate as ReturnType<typeof vi.fn>).mock.calls[0]?.[1]).toEqual(
			expect.objectContaining({ pseudoElement: '::view-transition-new(root)' })
		);
	});

	it('animates the new root when transitioning from dark to light', async () => {
		const startViewTransition = vi.fn<StartViewTransition>((callback) => ({
			ready: Promise.resolve(callback()).then(() => undefined)
		}));
		document.documentElement.classList.add('dark');
		document.documentElement.style.colorScheme = 'dark';
		const { deps, animateReveal, cycleMode } = createDeps({
			currentMode: 'dark',
			resolvedMode: 'dark',
			prefersDark: false,
			startViewTransition
		});

		const strategy = await toggleModeWithTransition(deps, { clientX: 420, clientY: 32 });

		expect(strategy).toBe('transition');
		expect(startViewTransition).toHaveBeenCalledTimes(1);
		expect(cycleMode).toHaveBeenCalledTimes(1);
		expect(document.documentElement.classList.contains('dark')).toBe(false);
		expect(document.documentElement.style.colorScheme).toBe('light');
		expect(animateReveal).toHaveBeenCalledWith(
			expect.objectContaining({
				x: 420,
				y: 32,
				endRadius: getRevealRadius(420, 32, 1440, 900)
			})
		);
		expect((document.documentElement.animate as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]).toEqual({
			clipPath: [
				'circle(0px at 420px 32px)',
				`circle(${getRevealRadius(420, 32, 1440, 900)}px at 420px 32px)`
			]
		});
		expect((document.documentElement.animate as ReturnType<typeof vi.fn>).mock.calls[0]?.[1]).toEqual(
			expect.objectContaining({ pseudoElement: '::view-transition-new(root)' })
		);
	});

	it('falls back to an immediate dark-mode toggle when view transitions are unavailable', async () => {
		const { deps, animateReveal, cycleMode } = createDeps({ currentMode: 'light' });

		const strategy = await toggleModeWithTransition(deps, { clientX: 96, clientY: 48 });

		expect(strategy).toBe('immediate');
		expect(cycleMode).toHaveBeenCalledTimes(1);
		expect(document.documentElement.classList.contains('dark')).toBe(true);
		expect(document.documentElement.style.colorScheme).toBe('dark');
		expect(animateReveal).not.toHaveBeenCalled();
	});

	it('falls back to an immediate light-mode toggle when reduced motion is preferred', async () => {
		const startViewTransition = vi.fn<StartViewTransition>((callback) => ({
			ready: Promise.resolve(callback()).then(() => undefined)
		}));
		document.documentElement.classList.add('dark');
		document.documentElement.style.colorScheme = 'dark';
		const { deps, animateReveal, cycleMode } = createDeps({
			currentMode: 'dark',
			prefersDark: false,
			reducedMotion: true,
			startViewTransition
		});

		const strategy = await toggleModeWithTransition(deps, { clientX: 128, clientY: 72 });

		expect(strategy).toBe('immediate');
		expect(startViewTransition).not.toHaveBeenCalled();
		expect(cycleMode).toHaveBeenCalledTimes(1);
		expect(document.documentElement.classList.contains('dark')).toBe(false);
		expect(document.documentElement.style.colorScheme).toBe('light');
		expect(animateReveal).not.toHaveBeenCalled();
	});

	it('skips the transition when the next mode resolves to the same appearance', async () => {
		const startViewTransition = vi.fn<StartViewTransition>((callback) => ({
			ready: Promise.resolve(callback()).then(() => undefined)
		}));
		document.documentElement.classList.add('dark');
		document.documentElement.style.colorScheme = 'dark';
		const { deps, animateReveal, cycleMode } = createDeps({
			currentMode: 'dark',
			resolvedMode: 'dark',
			prefersDark: true,
			startViewTransition
		});

		const strategy = await toggleModeWithTransition(deps, { clientX: 120, clientY: 80 });

		expect(strategy).toBe('immediate');
		expect(startViewTransition).not.toHaveBeenCalled();
		expect(cycleMode).toHaveBeenCalledTimes(1);
		expect(document.documentElement.classList.contains('dark')).toBe(true);
		expect(document.documentElement.style.colorScheme).toBe('dark');
		expect(animateReveal).not.toHaveBeenCalled();
	});
});
