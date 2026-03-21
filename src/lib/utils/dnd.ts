import { dndzone as originalDndzone, DRAGGED_ELEMENT_ID as DRAGGED_ELEMENT_ID_ORIGINAL } from 'svelte-dnd-action';
import type { Action } from 'svelte/action';

type DndOptions = {
	items: any[];
	flipDurationMs?: number;
	type?: string;
	dropTargetStyle?: Record<string, string>;
	dropTargetClasses?: string[];
	morphDisabled?: boolean;
	dragDisabled?: boolean;
	dropFromOthersDisabled?: boolean;
	dropAnimationDisabled?: boolean;
	centreDraggedOnCursor?: boolean;
	transformDraggedElement?: (element: HTMLElement, data: any, index: number) => void;
	onConsider?: (e: CustomEvent) => void;
	onFinalize?: (e: CustomEvent) => void;
};

export const dndzone: Action<HTMLElement, DndOptions> = (node, options) => {
	let currentOnConsider = options?.onConsider;
	let currentOnFinalize = options?.onFinalize;

	function considerHandler(e: Event) {
		currentOnConsider?.(e as CustomEvent);
	}
	function finalizeHandler(e: Event) {
		currentOnFinalize?.(e as CustomEvent);
	}

	node.addEventListener('consider', considerHandler);
	node.addEventListener('finalize', finalizeHandler);

	const { onConsider, onFinalize, ...dndOpts } = options!;
	const dnd = originalDndzone(node, dndOpts as any);

	return {
		update(newOptions: DndOptions) {
			currentOnConsider = newOptions.onConsider;
			currentOnFinalize = newOptions.onFinalize;
			const { onConsider: _, onFinalize: __, ...newDndOpts } = newOptions;
			(dnd as any).update(newDndOpts);
		},
		destroy() {
			node.removeEventListener('consider', considerHandler);
			node.removeEventListener('finalize', finalizeHandler);
			(dnd as any).destroy();
		},
	};
};

export const DRAGGED_ELEMENT_ID = DRAGGED_ELEMENT_ID_ORIGINAL;
export { SHADOW_ITEM_MARKER_PROPERTY_NAME } from 'svelte-dnd-action';
