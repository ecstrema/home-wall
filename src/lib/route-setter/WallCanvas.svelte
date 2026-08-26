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
          role="button"
          tabindex="0"
          aria-label={`Toggle ${hold.id}`}
          onmousedown={(event) => event.preventDefault()}
          onclick={() => onCycle(hold.id)}
          onkeydown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
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
  .wall svg {
    width: min(100%, calc(100vh - 100px));
    height: min(100%, calc(100vh - 100px));
  }
  .wall path {
    user-select: none;
    -webkit-user-select: none;
    -webkit-user-drag: none;
  }
  .wall :global([id^="hold-"]) {
    fill: transparent;
    stroke: transparent;
    stroke-width: 2;
    cursor: pointer;
    pointer-events: all;
  }
  .wall :global([id^="hold-"]:hover) {
    filter: brightness(1.2);
  }
  .wall :global(.start) {
    fill: #e4a25759;
    stroke: #e4a257;
  }
  .wall :global(.normal) {
    fill: #72a9b759;
    stroke: #72a9b7;
  }
  .wall :global(.end) {
    fill: #d96e6259;
    stroke: #d96e62;
  }
  @media (max-width: 700px) {
    .wall {
      flex: 0 0 auto;
      width: 100%;
      aspect-ratio: 1;
      justify-content: flex-start;
      overflow-x: hidden;
    }
    .wall svg {
      width: 100%;
      height: 100%;
      max-width: 100%;
      display: block;
    }
  }
</style>
