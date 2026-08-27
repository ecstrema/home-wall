<script lang="ts">
	import { holds } from './wall';
	import type { Boulder, HoldType } from './types';

	let { routes }: { routes: Boulder[] } = $props();

	function gradeValue(grade: string) {
		const match = grade.toUpperCase().match(/V(\d+)/);
		return match ? Number(match[1]) : 99;
	}

	function pages() {
		const sortedRoutes = [...routes].sort((a, b) => gradeValue(a.grade) - gradeValue(b.grade));
		const pagePadding = (4 - (sortedRoutes.length % 4)) % 4;
		const emptyRoutes: Boulder[] = Array.from({ length: pagePadding + 8 }, () => ({ name: '', grade: '', holds: [] }));
		const printableRoutes = [...sortedRoutes, ...emptyRoutes];
		return Array.from({ length: Math.ceil(printableRoutes.length / 4) }, (_, pageIndex) =>
			printableRoutes.slice(pageIndex * 4, pageIndex * 4 + 4)
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
						<h2>{route.name}</h2>
						<span>{route.grade}</span>
					</header>
					<svg viewBox="0 0 264.58334 264.58335" aria-label={`Map for ${route.name || 'unnamed climb'}`}>
						<use href="#shared-wall-image" />
						<g transform="translate(-8.4350872,-5.7149787)">
							{#each holds as hold}
								<path class={holdType(route, hold.id)} d={hold.path} transform={hold.transform} />
							{/each}
						</g>
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
		.print-page { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-template-rows: repeat(2, 98mm); align-items: start; gap: 3mm; width: 100%; height: 204mm; padding: 2mm; box-sizing: border-box; break-after: page; }
		.print-page:last-child { break-after: auto; }
		.route-card { min-width: 90mm; width: 90mm; height: 96mm; margin: 0 auto; overflow: hidden; display: flex; flex-direction: column; align-items: center; break-inside: avoid; }
		.route-card header { display: flex; align-items: baseline; justify-content: space-between; width: 90mm; height: 5mm; margin-bottom: 1mm; overflow: hidden; border-bottom: 1px solid #bbb; line-height: 5mm; }
		.route-card h2 { min-width: 0; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font: bold 11pt/5mm Arial, sans-serif; }
		.route-card header span { flex: 0 0 auto; font: bold 11pt/5mm Arial, sans-serif; }
		.route-card svg { display: block; flex: 0 0 auto; width: 90mm; height: 90mm; }
		.route-card path { fill: none; stroke-width: 2; }
		.route-card path.start { fill: #e4a25759; stroke: #b56f19; }
		.route-card path.normal { fill: #72a9b759; stroke: #03ccff; }
		.route-card path.end { fill: #d96e6259; stroke: #a63d33; }
	}
</style>
