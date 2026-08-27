<script lang="ts">
  import type { Boulder } from "./types";
  import { holds, wallImage } from "./wall";

  let {
    route,
    onCycle,
  }: {
    route: Boulder | undefined;
    onCycle: (target: string) => void;
  } = $props();

  function paint() {
    document
      .querySelectorAll<SVGElement>('[id^="hold-"]')
      .forEach((element) => element.classList.remove("start", "normal", "end"));
    route?.holds.forEach((hold) =>
      document.getElementById(hold.target)?.classList.add(hold.type),
    );
  }

  $effect(() => {
    route;
    requestAnimationFrame(paint);
  });

</script>

<div class="wall">
  <svg
    viewBox="0 0 264.58334 264.58335"
    role="img"
    aria-label="Climbing wall holds"
  >
    <image
      href={wallImage}
      x="0"
      y="0"
      width="264.58334"
      height="264.58334"
      preserveAspectRatio="none"
    />
    <g transform="translate(-8.4350872,-5.7149787)">
      {#each holds as hold}
        <path
          id={hold.id}
          d={hold.path}
          transform={hold.transform}
          role="button"
          tabindex="0"
          aria-label={`Toggle ${hold.id}`}
          onmousedown={(event) => event.preventDefault()}
          onclick={() => onCycle(hold.id)}
          onkeydown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onCycle(hold.id);
            }
          }}
        />
      {/each}
    </g>
  </svg>
</div>

<style>
  .wall {
    flex: 1;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    user-select: none;
    -webkit-user-select: none;
  }
  .wall :global(svg) {
    width: min(100%, calc(100vh - 100px));
    height: min(100%, calc(100vh - 100px));
  }
  .wall :global(path) {
    user-select: none;
    -webkit-user-select: none;
    -webkit-user-drag: none;
  }
  .wall :global([id^="hold-"]) {
    fill: transparent !important;
    stroke: transparent !important;
    stroke-width: 2;
    cursor: pointer;
    pointer-events: all;
  }
  .wall :global([id^="hold-"]:hover:not(.start):not(.normal):not(.end)) {
    stroke: #ffffff !important;
    stroke-width: 1px;
    stroke-dasharray: 2 4;
    stroke-linecap: round;
  }
  .wall :global([id^="hold-"]:hover) {
    fill: #ffffff59 !important;
  }
  .wall :global(.start) {
    stroke: #e4a257 !important;
  }
  .wall :global(.normal) {
    stroke: #03ccff !important;
  }
  .wall :global(.end) {
    stroke: #d0230f !important;
  }
  @media (max-width: 700px) {
    .wall {
      flex: 0 0 auto;
      width: 100%;
      aspect-ratio: 1;
      justify-content: flex-start;
      overflow-x: hidden;
    }
    .wall :global(svg) {
      width: 100%;
      height: 100%;
      max-width: 100%;
      display: block;
    }
  }
</style>
