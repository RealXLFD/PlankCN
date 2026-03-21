// @vitest-environment node

import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import AppShell from './app-shell.svelte';

function renderShell() {
	return render(AppShell, { props: {} }).body;
}

describe('AppShell rendered output', () => {
	it('renders the app shell with header and board area', () => {
		const html = renderShell();

		// Core shell structure
		expect(html).toContain('data-testid="app-shell"');
		
		// Header elements
		expect(html).toContain('PlankCN');
		expect(html).toContain('搜索卡片...');
		
		// Key action buttons
		expect(html).toContain('aria-label="重置布局"');
		expect(html).toContain('aria-label="清空看板"');
		expect(html).toContain('aria-label="上传背景"');
		expect(html).toContain('aria-label="设置"');
		expect(html).toContain('aria-label="切换亮暗模式"');
	});

	it('renders the board container area', () => {
		const html = renderShell();

		// Main board rendering structure
		expect(html).toContain('data-testid="app-shell"');
		expect(html).toContain('<main');
		expect(html).toContain('overflow-hidden');
	});
});