export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedMode = Exclude<ThemeMode, 'system'>;
export type ViewTransitionHandle = {
	ready: Promise<void>;
};
export type StartViewTransition = (
	callback: () => Promise<void> | void
) => ViewTransitionHandle;
export type ToggleModeEvent = Pick<MouseEvent, 'clientX' | 'clientY'>;
export type ToggleModeStrategy = 'immediate' | 'transition';

export type ModeToggleDeps = {
	getCurrentMode: () => ThemeMode;
	getResolvedMode: () => ResolvedMode;
	resolveMode: (mode: ThemeMode) => ResolvedMode;
	cycleMode: () => void;
	prefersReducedMotion: () => boolean;
	startViewTransition?: StartViewTransition;
	waitForModeFlush: () => Promise<void>;
	getViewport: () => { width: number; height: number };
	animateReveal: (params: {
		x: number;
		y: number;
		endRadius: number;
	}) => void;
};

export function getNextMode(currentMode: ThemeMode): ThemeMode {
	switch (currentMode) {
		case 'system':
			return 'light';
		case 'light':
			return 'dark';
		case 'dark':
			return 'system';
	}
}

export function getRevealRadius(x: number, y: number, width: number, height: number): number {
	return Math.hypot(Math.max(x, width - x), Math.max(y, height - y));
}

export async function toggleModeWithTransition(
	deps: ModeToggleDeps,
	event?: ToggleModeEvent
): Promise<ToggleModeStrategy> {
	const currentMode = deps.getCurrentMode();
	const currentResolvedMode = deps.getResolvedMode();
	const nextMode = getNextMode(currentMode);
	const nextResolvedMode = deps.resolveMode(nextMode);

	if (deps.prefersReducedMotion()) {
		deps.cycleMode();
		return 'immediate';
	}

	if (!event || !deps.startViewTransition) {
		deps.cycleMode();
		return 'immediate';
	}

	if (currentResolvedMode === nextResolvedMode) {
		deps.cycleMode();
		return 'immediate';
	}

	const { width, height } = deps.getViewport();
	const x = event.clientX;
	const y = event.clientY;
	const endRadius = getRevealRadius(x, y, width, height);
	const transition = deps.startViewTransition(async () => {
		deps.cycleMode();
		await deps.waitForModeFlush();
	});

	await transition.ready
		.then(() => {
			deps.animateReveal({ x, y, endRadius });
		})
		.catch(() => undefined);

	return 'transition';
}
