<script lang="ts">
	import type { Boulder } from './types';

	let { routes, selected, onSelect, onAdd, onUpdate, onDelete, onResetAll, onUndo, canUndo }: {
		routes: Boulder[];
		selected: number;
		onSelect: (index: number) => void;
		onAdd: () => void;
		onUpdate: (index: number, name: string, grade: string) => void;
		onDelete: (index: number) => void;
		onResetAll: () => void;
		onUndo: () => void;
		canUndo: boolean;
	} = $props();

	let query = $state('');
	let gradeFilter = $state('all');
	let order = $state('grade');

	const grades = ['all', 'V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6+'];

	function gradeValue(grade: string) {
		const match = grade.toUpperCase().match(/V(\d+)/);
		return match ? Number(match[1]) : 99;
	}

	function visibleRoutes() {
		const filtered = routes
			.map((route, index) => ({ route, index }))
			.filter(({ route }) => {
				const matchesQuery = !query.trim() || route.name.toLowerCase().includes(query.trim().toLowerCase());
				const matchesGrade = gradeFilter === 'all' || (gradeFilter === 'V6+' ? gradeValue(route.grade) >= 6 : route.grade.toUpperCase() === gradeFilter);
				return matchesQuery && matchesGrade;
			});
		if (order === 'name') filtered.sort((a, b) => a.route.name.localeCompare(b.route.name));
		if (order === 'grade') filtered.sort((a, b) => gradeValue(a.route.grade) - gradeValue(b.route.grade));
		if (order === 'holds') filtered.sort((a, b) => b.route.holds.length - a.route.holds.length);
		return filtered;
	}
</script>

<section class="route-list" aria-label="Bouldering routes">
	<div class="list-tools">
		<input class="search" aria-label="Filter climbs" placeholder="Filter climbs" value={query} oninput={(event) => query = (event.target as HTMLInputElement).value} />
		<div class="select-row">
			<select aria-label="Filter by grade" bind:value={gradeFilter}>
				{#each grades as grade}<option value={grade}>{grade === 'all' ? 'All grades' : grade}</option>{/each}
			</select>
			<select aria-label="Order climbs" bind:value={order}>
				<option value="manual">Order: added</option>
				<option value="name">Order: name</option>
				<option value="grade">Order: grade</option>
				<option value="holds">Order: holds</option>
			</select>
		</div>
		<div class="bulk-actions">
			<button onclick={onUndo} disabled={!canUndo}>Undo</button>
			<button onclick={onResetAll}>Reset all</button>
		</div>
	</div>

	<div class="routes">
		{#each visibleRoutes() as item (item.index)}
			<div class:active={item.index === selected} class="route-row">
				<button class="route-select" onclick={() => onSelect(item.index)} aria-label={`Select ${item.route.name || 'unnamed climb'}`}>
					<span class="route-count">{item.index + 1}</span>
				</button>
				<input class="route-name" aria-label="Climb name" value={item.route.name} onchange={(event) => onUpdate(item.index, (event.target as HTMLInputElement).value, item.route.grade)} />
				<input class="route-grade" aria-label="Climb grade" value={item.route.grade} onchange={(event) => onUpdate(item.index, item.route.name, (event.target as HTMLInputElement).value)} />
				<button class="delete-route" onclick={() => onDelete(item.index)} aria-label={`Delete ${item.route.name || 'unnamed climb'}`}>×</button>
			</div>
		{:else}
			<p class="empty">No climbs match this filter.</p>
		{/each}
	</div>
	<button class="add-route" onclick={onAdd}>+ Add new climb</button>
</section>

<style>
	.route-list { flex: 1 1 auto; min-height: 0; overflow: auto; padding: 10px 0; scrollbar-color: #d99852 #202629; scrollbar-width: thin; }
	.route-list::-webkit-scrollbar { width: 8px; }
	.route-list::-webkit-scrollbar-track { background: #202629; }
	.route-list::-webkit-scrollbar-thumb { background: #d99852; border-radius: 4px; }
	.route-list::-webkit-scrollbar-thumb:hover { background: #ebb36e; }
	.list-tools { padding: 0 20px 10px; border-bottom: 1px solid #394044; }
	.search, select { width: 100%; padding: 8px; color: #f4f0e8; background: #293235; border: 1px solid #485456; outline: 0; font: 11px Arial, sans-serif; }
	.select-row { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 6px; }
	.bulk-actions { display: flex; gap: 6px; margin-top: 8px; }
	.bulk-actions button { flex: 1; padding: 7px; color: #c4ccca; background: #303a3d; border: 0; font: 11px Arial, sans-serif; cursor: pointer; }
	.bulk-actions button:disabled { cursor: default; opacity: .45; }
	.routes { padding-top: 4px; }
	.route-row { display: grid; grid-template-columns: 26px minmax(0, 1fr) 52px 22px; gap: 5px; align-items: center; padding: 7px 20px; border-left: 3px solid transparent; }
	.route-row:hover, .route-row.active { background: #2e393b; }
	.route-row.active { border-left-color: #d99852; }
	.route-row input { min-width: 0; padding: 5px 4px; color: #c4ccca; background: transparent; border: 1px solid transparent; outline: 0; font: 13px Georgia, serif; }
	.route-row input:focus { border-color: #647276; background: #293235; }
	.route-grade { text-align: center; }
	.route-select, .delete-route { padding: 2px; color: #8e9a99; background: transparent; border: 0; cursor: pointer; }
	.route-select:hover, .delete-route:hover { color: #d99852; }
	.route-count { font: 10px Arial, sans-serif; }
	.empty { padding: 18px 20px; color: #8e9a99; font: 11px Arial, sans-serif; }
	.add-route { width: calc(100% - 40px); margin: 10px 20px 0; padding: 12px; background: #d99852; color: #1c2526; text-align: left; font: bold 14px Arial, sans-serif; cursor: pointer; }
	.add-route:hover { background: #ebb36e; }
	@media (max-width: 700px) { .route-list { max-height: 300px; flex: none; } .route-row { padding: 6px 20px; } }
</style>
