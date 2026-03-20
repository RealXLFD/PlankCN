export type Card = {
	id: string;
	title: string;
	description?: string;
	labels?: string[];
	createdAt: number;
};

export type List = {
	id: string;
	title: string;
	cards: Card[];
};

export type Board = {
	lists: List[];
};

const STORAGE_KEY = 'trellocn-board';

function generateId(): string {
	return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

function loadBoard(): Board {
	if (typeof window === 'undefined') return { lists: [] };
	try {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved) return JSON.parse(saved);
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
			},
			{
				id: generateId(),
				title: '进行中',
				cards: [],
			},
			{
				id: generateId(),
				title: '已完成',
				cards: [],
			},
		],
	};
}

let board = $state<Board>(loadBoard());

function save() {
	if (typeof window === 'undefined') return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
}

export function getBoardStore() {
	return {
		get lists() {
			return board.lists;
		},

		addList(title: string) {
			board.lists.push({ id: generateId(), title, cards: [] });
			save();
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
				list.cards.push({ id: generateId(), title, description, createdAt: Date.now() });
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

		updateCard(listId: string, cardId: string, updates: Partial<Pick<Card, 'title' | 'description' | 'labels'>>) {
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
	};
}
