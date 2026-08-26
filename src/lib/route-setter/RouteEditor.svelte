<script lang="ts">
	import type { Boulder } from './types';

	let { route, name, grade, onUpdate, onDelete, onReset }: {
		route: Boulder;
		name: string;
		grade: string;
		onUpdate: (name: string, grade: string) => void;
		onDelete: () => void;
		onReset: () => void;
	} = $props();
</script>

<section class="editor">
	<p>ROUTE DETAILS</p>
	<label>Name <input value={name} oninput={(event) => onUpdate((event.target as HTMLInputElement).value, grade)} /></label>
	<label>Grade <input value={grade} oninput={(event) => onUpdate(name, (event.target as HTMLInputElement).value)} /></label>
	<div class="actions"><button onclick={onDelete}>Delete</button><button onclick={onReset}>Reset</button></div>
</section>

<style>
	.editor { padding: 20px 28px; border-top: 1px solid #394044; background: #1b2123; }
	p { color: #d99852; font: 11px Arial, sans-serif; letter-spacing: .12em; }
	label { display: block; margin-top: 12px; color: #aeb8b5; font: 11px Arial, sans-serif; text-transform: uppercase; }
	input { display: block; width: 100%; margin-top: 6px; padding: 9px; color: white; background: #293235; border: 1px solid #485456; outline: 0; }
	.actions { display: flex; gap: 8px; margin-top: 18px; }
	.actions button { flex: 1; padding: 9px; color: #c4ccca; background: #303a3d; border: 0; cursor: pointer; font: 11px Arial, sans-serif; }
	@media (max-width: 700px) { .editor { padding: 16px 20px; } }
</style>
