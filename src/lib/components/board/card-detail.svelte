<script lang="ts">
	import type { Card, LabelColor } from "$lib/stores/board.svelte";
	import { LABEL_COLORS, LABEL_PALETTE, COVER_COLORS, getSettingsStore } from "$lib/stores/board.svelte";
	import { onMount, onDestroy } from "svelte";

	const settings = getSettingsStore();

	let {
		card,
		listTitle,
		open = $bindable(false),
		position = $bindable({ x: 0, y: 0 }),
		onupdate,
		onremove,
	}: {
		card: Card;
		listTitle: string;
		open: boolean;
		position: { x: number; y: number };
		onupdate: (updates: Partial<Pick<Card, 'title' | 'description' | 'labels' | 'dueDate' | 'coverColor'>>) => void;
		onremove: () => void;
	} = $props();

	let editTitle = $state('');
	let editDescription = $state('');
	let editDueDate = $state('');

	// Portal elements - created dynamically
	let backdropEl = $state<HTMLDivElement | null>(null);
	let panelEl = $state<HTMLDivElement | null>(null);

	function saveTitle() {
		const trimmed = editTitle.trim();
		if (trimmed && trimmed !== card.title) {
			onupdate({ title: trimmed });
		}
	}

	function saveDescription() {
		const val = editDescription.trim() || undefined;
		if (val !== (card.description ?? undefined)) {
			onupdate({ description: val });
		}
	}

	function selectLabel(color: LabelColor) {
		const current = card.labels ?? [];
		if (current.length === 1 && current[0] === color) {
			onupdate({ labels: [] });
		} else {
			onupdate({ labels: [color] });
		}
	}

	function saveDueDate() {
		if (editDueDate) {
			onupdate({ dueDate: new Date(editDueDate + 'T23:59:59').getTime() });
		} else {
			onupdate({ dueDate: undefined });
		}
	}

	function setCoverColor(color: LabelColor | null) {
		onupdate({ coverColor: color });
	}

	function handleTitleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			saveTitle();
			(e.target as HTMLInputElement).blur();
		}
	}

	function handleDescriptionBlur() {
		saveDescription();
	}

	function handleDelete() {
		onremove();
		open = false;
	}

	function closeOnEscape(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			open = false;
		}
	}

	function closeDialog() {
		open = false;
	}

	const panelPosition = $derived.by(() => {
		const panelWidth = 320;
		const estimatedHeight = 420;
		const padding = 16;

		let x = position.x + 10;
		let y = position.y + 10;

		if (typeof window !== 'undefined') {
			if (x + panelWidth + padding > window.innerWidth) {
				x = position.x - panelWidth - 10;
			}
			if (y + estimatedHeight + padding > window.innerHeight) {
				y = window.innerHeight - estimatedHeight - padding;
			}
			if (x < padding) {
				x = padding;
			}
			if (y < padding) {
				y = padding;
			}
		}

		return { x, y };
	});

	function createPortalElements() {
		// Create backdrop
		backdropEl = document.createElement('div');
		backdropEl.className = 'fixed inset-0 z-[99998]';
		backdropEl.style.display = 'none';
		backdropEl.style.pointerEvents = 'auto';
		backdropEl.onclick = closeDialog;
		backdropEl.onkeydown = (e) => { if (e.key === 'Escape') open = false; };
		backdropEl.setAttribute('role', 'button');
		backdropEl.setAttribute('tabindex', '-1');
		backdropEl.setAttribute('aria-label', '关闭');
		document.body.appendChild(backdropEl);

		// Create panel
		panelEl = document.createElement('div');
		panelEl.className = 'fixed z-[99999] w-80 rounded-xl border border-border/50 bg-background/95 shadow-2xl overflow-hidden';
		panelEl.style.display = 'none';
		panelEl.style.left = '0';
		panelEl.style.top = '0';
		panelEl.style.pointerEvents = 'auto';
		panelEl.setAttribute('role', 'dialog');
		panelEl.setAttribute('aria-label', '编辑卡片');
		panelEl.setAttribute('aria-modal', 'true');
		panelEl.setAttribute('tabindex', '-1');
		panelEl.onclick = (e) => e.stopPropagation();
		panelEl.onkeydown = (e) => e.stopPropagation();
		document.body.appendChild(panelEl);

		// Initial render
		updatePanelContent();
	}

	function updatePanelContent() {
		if (!panelEl) return;

		const blurLevel = settings.blurLevel;
		panelEl.innerHTML = `
			<div style="backdrop-filter: blur(${blurLevel}px); -webkit-backdrop-filter: blur(${blurLevel}px);">
				<div class="flex items-center justify-between border-b px-4 py-3">
					<div>
						<h2 class="text-sm font-semibold">编辑卡片</h2>
						<p class="text-xs text-muted-foreground">在「${escapeHtml(listTitle)}」中</p>
					</div>
					<button id="close-btn" class="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="关闭">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
					</button>
				</div>
				<div class="max-h-[60vh] overflow-y-auto p-4">
					<div class="flex flex-col gap-5">
						<div>
							<div class="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">标题</div>
							<input id="title-input" value="${escapeHtml(editTitle)}" aria-label="卡片标题" class="w-full rounded-lg border bg-muted/50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
						</div>
						<div>
							<div class="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
								<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3"><path d="M12 12h.01"></path><path d="M12 2v1"></path><path d="m6.5 6.5.7.7"></path><path d="M2 12h1"></path><path d="m6.5 17.5.7-.7"></path><path d="M12 21v1"></path><path d="m17.5 17.5-.7-.7"></path><path d="M21 12h-1"></path><path d="m17.5 6.5-.7.7"></path></svg>
								标签
							</div>
							<div class="flex flex-wrap gap-2">
								${LABEL_COLORS.map(color => {
									const active = card.labels?.includes(color);
									const palette = LABEL_PALETTE[color];
									return `<button data-label="${color}" class="label-btn h-7 w-7 rounded-full transition-all ${palette.bg} ${active ? 'ring-2 ring-ring ring-offset-2 ring-offset-background scale-110' : 'opacity-50 hover:opacity-80 hover:scale-105'}" aria-label="${color}"></button>`;
								}).join('')}
							</div>
						</div>
						<div>
							<div class="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
								<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3"><path d="M8 2v4"></path><path d="M16 2v4"></path><path d="M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8"></path><path d="M3 10h18"></path><path d="M16 19h6"></path><path d="M19 16v6"></path></svg>
								截止日期
							</div>
							<div class="flex items-center gap-2">
								<input id="due-date-input" type="date" value="${editDueDate}" aria-label="截止日期" class="flex-1 rounded-lg border bg-muted/50 px-2.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
								${editDueDate ? `<button id="clear-date-btn" class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20" aria-label="清除日期"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></button>` : ''}
							</div>
						</div>
						<div>
							<div class="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
								<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3"><path d="M12 12h.01"></path><path d="M12 2v1"></path><path d="m6.5 6.5.7.7"></path><path d="M2 12h1"></path><path d="m6.5 17.5.7-.7"></path><path d="M12 21v1"></path><path d="m17.5 17.5-.7-.7"></path><path d="M21 12h-1"></path><path d="m17.5 6.5-.7.7"></path></svg>
								封面颜色
							</div>
							<div class="flex flex-wrap gap-2">
								<button data-cover="null" class="cover-btn flex h-7 w-7 items-center justify-center rounded-full border-2 border-dashed text-[10px] text-muted-foreground transition-all ${card.coverColor === null || card.coverColor === undefined ? 'ring-2 ring-ring ring-offset-2 ring-offset-background' : 'opacity-50 hover:opacity-80'}" aria-label="无封面">
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
								</button>
								${LABEL_COLORS.map(color => {
									const active = card.coverColor === color;
									return `<button data-cover="${color}" class="cover-btn h-7 w-7 rounded-full transition-all ${COVER_COLORS[color]} ${active ? 'ring-2 ring-ring ring-offset-2 ring-offset-background scale-110' : 'opacity-50 hover:opacity-80 hover:scale-105'}" aria-label="${color}"></button>`;
								}).join('')}
							</div>
						</div>
						<div>
							<div class="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
								<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z"></path></svg>
								描述
							</div>
							<textarea id="description-input" aria-label="卡片描述" class="w-full resize-none rounded-lg border bg-muted/50 px-3 py-2 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring" rows="3" placeholder="添加描述...">${escapeHtml(editDescription)}</textarea>
						</div>
					</div>
				</div>
				<div class="border-t px-4 py-3">
					<button id="delete-btn" class="flex w-full items-center justify-center gap-2 rounded-lg border border-destructive/20 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>
						删除卡片
					</button>
				</div>
			</div>
		`;

		// Attach event handlers
		const closeBtn = panelEl.querySelector('#close-btn') as HTMLButtonElement | null;
		if (closeBtn) closeBtn.onclick = closeDialog;

		const titleInput = panelEl.querySelector('#title-input') as HTMLInputElement;
		if (titleInput) {
			titleInput.onblur = saveTitle;
			titleInput.onkeydown = handleTitleKeydown;
		}

		const dueDateInput = panelEl.querySelector('#due-date-input') as HTMLInputElement;
		if (dueDateInput) {
			dueDateInput.onchange = saveDueDate;
		}

		const clearDateBtn = panelEl.querySelector('#clear-date-btn') as HTMLButtonElement | null;
		if (clearDateBtn) {
			clearDateBtn.onclick = () => {
				editDueDate = '';
				saveDueDate();
				updatePanelContent();
			};
		}

		const descriptionInput = panelEl.querySelector('#description-input') as HTMLTextAreaElement;
		if (descriptionInput) {
			descriptionInput.onblur = handleDescriptionBlur;
		}

		const labelBtns = panelEl.querySelectorAll('.label-btn');
		labelBtns.forEach(btn => {
			(btn as HTMLButtonElement).onclick = () => {
				const color = btn.getAttribute('data-label') as LabelColor;
				selectLabel(color);
				updatePanelContent();
			};
		});

		const coverBtns = panelEl.querySelectorAll('.cover-btn');
		coverBtns.forEach(btn => {
			(btn as HTMLButtonElement).onclick = () => {
				const color = btn.getAttribute('data-cover');
				setCoverColor(color === 'null' ? null : color as LabelColor);
				updatePanelContent();
			};
		});

		const deleteBtn = panelEl.querySelector('#delete-btn') as HTMLButtonElement | null;
		if (deleteBtn) deleteBtn.onclick = handleDelete;
	}

	function escapeHtml(str: string): string {
		return str.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');
	}

	// Update visibility and sync data
	$effect(() => {
		if (!backdropEl || !panelEl) return;

		if (open) {
			editTitle = card.title;
			editDescription = card.description ?? '';
			editDueDate = card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : '';
			
			document.addEventListener('keydown', closeOnEscape);
			backdropEl.style.display = 'block';
			panelEl.style.display = 'block';
			updatePanelContent();
		} else {
			document.removeEventListener('keydown', closeOnEscape);
			backdropEl.style.display = 'none';
			panelEl.style.display = 'none';
		}
	});

	// Update position
	$effect(() => {
		if (panelEl && open) {
			panelEl.style.left = `${panelPosition.x}px`;
			panelEl.style.top = `${panelPosition.y}px`;
		}
	});

	onMount(() => {
		createPortalElements();
	});

	onDestroy(() => {
		document.removeEventListener('keydown', closeOnEscape);
		backdropEl?.remove();
		panelEl?.remove();
	});
</script>

