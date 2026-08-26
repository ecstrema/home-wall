<script lang="ts">
	import { holds, wallImage } from './wall';
	import type { Boulder, HoldType } from './types';

	let { routes }: { routes: Boulder[] } = $props();

	function pages() {
		return Array.from({ length: Math.ceil(routes.length / 4) }, (_, pageIndex) =>
			routes.slice(pageIndex * 4, pageIndex * 4 + 4)
		);
	}

	function holdType(route: Boulder, holdId: string): HoldType | '' {
		return route.holds.find((hold) => hold.target === holdId)?.type ?? '';
	}
</script>

<section class="print-view" aria-label="Printable bouldering routes">
	{#each pages() as page}
		<div class="print-page">
			{#each page as route}
				<article class="route-card">
					<header>
						<h2>{route.name || 'Unnamed climb'}</h2>
						<span>{route.grade || 'V?'}</span>
					</header>
					<svg viewBox="0 0 264.58334 264.58335" aria-label={`Map for ${route.name || 'unnamed climb'}`}>
						<image href={wallImage} x="0" y="0" width="264.58334" height="264.58334" preserveAspectRatio="none" />
						{#each holds as hold}
							<path class={holdType(route, hold.id)} d={hold.path} transform={hold.transform} />
						{/each}
					</svg>
				</article>
			{/each}
		</div>
	{/each}
</section>

<style>
	.print-view { display: none; }

	@media print {
		.print-view { display: block; color: #111; }
		.print-page { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 12mm; min-height: 267mm; break-after: page; }
		.print-page:last-child { break-after: auto; }
		.route-card { min-width: 0; break-inside: avoid; }
		.route-card header { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 3mm; border-bottom: 1px solid #bbb; }
		.route-card h2 { margin: 0; font: bold 14pt Arial, sans-serif; }
		.route-card header span { font: bold 12pt Arial, sans-serif; }
		.route-card svg { display: block; width: 100%; height: auto; }
		.route-card path { fill: none; stroke-width: 2; }
		.route-card path.start { fill: #e4a25759; stroke: #b56f19; }
		.route-card path.normal { fill: #72a9b759; stroke: #03ccff; }
		.route-card path.end { fill: #d96e6259; stroke: #a63d33; }
	}
</style>
