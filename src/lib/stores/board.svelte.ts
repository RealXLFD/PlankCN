export const LABEL_COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'sky'] as const;
export type LabelColor = (typeof LABEL_COLORS)[number];

export const LABEL_PALETTE: Record<LabelColor, { bg: string; text: string }> = {
	red: { bg: 'bg-red-500', text: 'text-white' },
	orange: { bg: 'bg-orange-500', text: 'text-white' },
	yellow: { bg: 'bg-yellow-400', text: 'text-yellow-900' },
	green: { bg: 'bg-green-500', text: 'text-white' },
	blue: { bg: 'bg-blue-500', text: 'text-white' },
	purple: { bg: 'bg-purple-500', text: 'text-white' },
	pink: { bg: 'bg-pink-500', text: 'text-white' },
	sky: { bg: 'bg-sky-400', text: 'text-sky-900' },
};

export const COVER_COLORS: Record<LabelColor, string> = {
	red: 'bg-red-500',
	orange: 'bg-orange-500',
	yellow: 'bg-yellow-400',
	green: 'bg-green-500',
	blue: 'bg-blue-500',
	purple: 'bg-purple-500',
	pink: 'bg-pink-500',
	sky: 'bg-sky-400',
};

export type Card = {
	id: string;
	title: string;
	description?: string;
	labels: LabelColor[];
	dueDate?: number;
	coverColor?: LabelColor | null;
	createdAt: number;
};

export type List = {
	id: string;
	title: string;
	cards: Card[];
	position: { x: number; y: number };
};

export type Board = {
	lists: List[];
};

export function getDueDateStatus(dueDate: number): 'overdue' | 'soon' | 'normal' {
	const now = Date.now();
	const diff = dueDate - now;
	if (diff < 0) return 'overdue';
	if (diff < 24 * 60 * 60 * 1000) return 'soon';
	return 'normal';
}

const STORAGE_KEY = 'trellocn-board';

function generateId(): string {
	return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

function migrateBoard(data: Board): Board {
	for (const list of data.lists) {
		if (!Array.isArray(list.cards)) list.cards = [];
		for (const card of list.cards) {
			if (!Array.isArray(card.labels)) card.labels = [];
		}
		if (list.position === undefined) {
			const idx = data.lists.indexOf(list);
			list.position = { x: 20+ idx * 340, y: 20 };
		}
	}
	return data;
}

function loadBoard(): Board {
	if (typeof window === 'undefined') return { lists: [] };
	try {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved) return migrateBoard(JSON.parse(saved));
	} catch {
		// ignore
	}
	return getDefaultBoard();
}

function getDefaultBoard(): Board {
	return {
		lists: [
			{
				id: generateId(),
				title: '待办',
				cards: [],
				position: { x: 20, y: 20 },
			},
			{
				id: generateId(),
				title: '进行中',
				cards: [],
				position: { x: 360, y: 20 },
			},
			{
				id: generateId(),
				title: '已完成',
				cards: [],
				position: { x: 700, y: 20 },
			},
		],
	};
}

let board = $state<Board>(loadBoard());
let searchQuery = $state('');
let backgroundImage = $state<string | null>(loadBackground());
let blurLevel = $state<number>(loadBlurLevel());
let viewScale = $state<number>(loadViewScale());
let resetLayoutVersion = $state(0);

function loadBackground(): string | null {
	if (typeof window === 'undefined') return null;
	return localStorage.getItem('trellocn-bg');
}

function loadBlurLevel(): number {
	if (typeof window === 'undefined') return 12;
	const v = localStorage.getItem('trellocn-blur');
	return v ? Number(v) : 12;
}

function loadViewScale(): number {
	if (typeof window === 'undefined') return 100;
	const v = localStorage.getItem('trellocn-scale');
	return v ? Number(v) :100;
}

function save() {
	if (typeof window === 'undefined') return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
}

export function getSearchStore() {
	return {
		get query() { return searchQuery; },
		set query(v: string) { searchQuery = v; },
	};
}

export function getSettingsStore() {
	return {
		get backgroundImage() { return backgroundImage; },
		set backgroundImage(v: string | null) {
			backgroundImage = v;
			if (typeof window === 'undefined') return;
			if (v) localStorage.setItem('trellocn-bg', v);
			else localStorage.removeItem('trellocn-bg');
		},
		get blurLevel() { return blurLevel; },
		set blurLevel(v: number) {
			blurLevel = v;
			if (typeof window === 'undefined') return;
			localStorage.setItem('trellocn-blur', String(v));
		},
		get viewScale() { return viewScale; },
		set viewScale(v: number) {
			viewScale = v;
			if (typeof window === 'undefined') return;
			localStorage.setItem('trellocn-scale', String(v));
		},
	};
}

export function findCard(cardId: string): { card: Card; listId: string } | null {
	for (const list of board.lists) {
		const card = list.cards.find((c) => c.id === cardId);
		if (card) return { card, listId: list.id };
	}
	return null;
}

function getNextPosition(): { x: number; y: number } {
	if (board.lists.length === 0) return { x: 20, y: 20 };
	
	let maxX = 0;
	let minY = Infinity;
	for (const list of board.lists) {
		if (list.position.x > maxX) maxX = list.position.x;
		if (list.position.y < minY) minY = list.position.y;
	}
	
	return { x: maxX + 340, y: minY };
}

export function getBoardStore() {
	return {
		get lists() {
			return board.lists;
		},

		addList(title: string, position?: { x: number; y: number }): string {
			const id = generateId();
			const pos = position ?? getNextPosition();
			board.lists.push({ id, title, cards: [], position: pos });
			save();
			return id;
		},

		updateListPosition(listId: string, position: { x: number; y: number }) {
			const list = board.lists.find((l) => l.id === listId);
			if (list) {
				list.position = position;
				save();
			}
		},

		removeList(listId: string) {
			board.lists = board.lists.filter((l) => l.id !== listId);
			save();
		},

		renameList(listId: string, title: string) {
			const list = board.lists.find((l) => l.id === listId);
			if (list) {
				list.title = title;
				save();
			}
		},

		addCard(listId: string, title: string, description?: string) {
			const list = board.lists.find((l) => l.id === listId);
			if (list) {
				list.cards.push({ id: generateId(), title, description, labels: [], createdAt: Date.now() });
				save();
			}
		},

		removeCard(listId: string, cardId: string) {
			const list = board.lists.find((l) => l.id === listId);
			if (list) {
				list.cards = list.cards.filter((c) => c.id !== cardId);
				save();
			}
		},

		updateCard(listId: string, cardId: string, updates: Partial<Pick<Card, 'title' | 'description' | 'labels' | 'dueDate' | 'coverColor'>>) {
			const list = board.lists.find((l) => l.id === listId);
			if (list) {
				const card = list.cards.find((c) => c.id === cardId);
				if (card) {
					Object.assign(card, updates);
					save();
				}
			}
		},

		moveCard(fromListId: string, toListId: string, cardId: string, toIndex: number) {
			const fromList = board.lists.find((l) => l.id === fromListId);
			const toList = board.lists.find((l) => l.id === toListId);
			if (!fromList || !toList) return;

			const cardIndex = fromList.cards.findIndex((c) => c.id === cardId);
			if (cardIndex === -1) return;

			const [card] = fromList.cards.splice(cardIndex, 1);
			toList.cards.splice(toIndex, 0, card);
			save();
		},

		moveList(fromIndex: number, toIndex: number) {
			if (fromIndex === toIndex) return;
			const [list] = board.lists.splice(fromIndex, 1);
			board.lists.splice(toIndex, 0, list);
			save();
		},

		reorderCard(listId: string, fromIndex: number, toIndex: number) {
			const list = board.lists.find((l) => l.id === listId);
			if (!list || fromIndex === toIndex) return;
			const [card] = list.cards.splice(fromIndex, 1);
			list.cards.splice(toIndex, 0, card);
			save();
		},

		setListCards(listId: string, cards: Card[]) {
			const list = board.lists.find((l) => l.id === listId);
			if (list) {
				list.cards = cards;
				save();
			}
		},

		reorderLists(orderedIds: string[]) {
			const reordered = orderedIds
				.map((id) => board.lists.find((l) => l.id === id))
				.filter((l): l is List => l !== undefined);
			board.lists = reordered;
			save();
		},

		resetBoard() {
			board = getDefaultBoard();
			save();
		},

		resetLayout(options?: { viewportWidth?: number; scale?: number }) {
			const LIST_WIDTH = 320;
			const LIST_GAP = 16;
			const PADDING_X = 20;
			const PADDING_Y = 20;
			
			const lists = Array.isArray(board.lists) ? board.lists : [];
			
			for (let i = 0; i < lists.length; i++) {
				lists[i].position = {
					x: PADDING_X + i * (LIST_WIDTH + LIST_GAP),
					y: PADDING_Y
				};
			}
			save();
			resetLayoutVersion++;
		},

		get resetLayoutVersion() { return resetLayoutVersion; },
	};
}
