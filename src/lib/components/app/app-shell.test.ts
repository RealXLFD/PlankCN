// @vitest-environment node

import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import AppShell from './app-shell.svelte';

function renderShell(props: Partial<{ open: boolean; mobileOpen: boolean }> = {}) {
	return render(AppShell, {
		props: {
			open: true,
			mobileOpen: false,
			...props
		}
	}).body;
}

describe('AppShell rendered output', () => {
	it('renders the required shell hooks and topbar controls', () => {
		const html = renderShell();

		expect(html).toContain('data-testid="app-shell"');
		expect(html).toContain('data-testid="app-sidebar"');
		expect(html).toContain('data-testid="app-topbar"');
		expect(html).toContain('data-testid="main-view"');
		expect(html).toContain('aria-label="Toggle sidebar"');
		expect(html).toContain('aria-label="切换主题"');
		expect(html).toContain('aria-label="切换亮暗模式"');
		expect(html).toContain('data-slot="sidebar-inset"');
	});

	it('renders empty sidebar and main-view containers without placeholder copy', () => {
		const html = renderShell({ open: false });

		expect(html).toContain('data-testid="app-sidebar"');
		expect(html).toContain('data-testid="main-view" class="min-h-0 min-w-0 flex-1 overflow-auto"');
		expect(html).toContain('data-state="collapsed"');
		expect(html).toContain('data-collapsible="offcanvas"');
		expect(html).not.toContain('TaskFlux');
		expect(html).not.toContain('placeholder');
		expect(html).not.toContain('Sidebar.Header');
		expect(html).not.toContain('Sidebar.Content');
	});
});
