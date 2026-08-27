<script lang="ts">
  import { onMount } from "svelte";
  import favicon from "./assets/favicon.ico";
  import wallImage from "./lib/assets/wall.webp";
  import PrintRoutes from "./lib/route-setter/PrintRoutes.svelte";
  import RouteList from "./lib/route-setter/RouteList.svelte";
  import WallCanvas from "./lib/route-setter/WallCanvas.svelte";
  import type { Boulder, HoldType } from "./lib/route-setter/types";

  const storageKey = "climbing-wall-boulders";
  const updateSourceUrl =
    "https://raw.githubusercontent.com/ecstrema/home-wall/refs/heads/app-source/index.html";
  type SavedSnapshot = {
    savedAt: number;
    routes: Boulder[];
    title?: string;
  };
  const initialRoutes: Boulder[] = [
    {
      name: "Demo Route",
      grade: "V2",
      holds: [
        { type: "start", target: "hold-1" },
        { type: "start", target: "hold-2" },
        { type: "normal", target: "hold-3" },
        { type: "normal", target: "hold-4" },
        { type: "normal", target: "hold-5" },
        { type: "end", target: "hold-6" },
      ],
    },
  ];

  let routes = $state<Boulder[]>(initialRoutes);
  let embeddedRoutes = $state<Boulder[]>(cloneRoutes(initialRoutes));
  let undoStack = $state<Boulder[][]>([]);
  let redoStack = $state<Boulder[][]>([]);
  let selectedIndex = $state(-1);
  let wallTitle = $state("My Wall");
  let fileHandle: FileSystemFileHandle | null = null;
  let saveStatus = $state("Not saved");
  let hasUnsavedChanges = $state(false);
  let importInput: HTMLInputElement;
  let updateAvailable = $state(false);
  let latestVersion = $state("");

  const selectedRoute = () =>
    selectedIndex >= 0 ? routes[selectedIndex] : undefined;

  function cloneRoutes(source: Boulder[]) {
    return source.map((route) => ({
      ...route,
      holds: route.holds.map((hold) => ({ ...hold })),
    }));
  }

  function persistRoutes() {
    const snapshot: SavedSnapshot = {
      savedAt: Date.now(),
      routes: cloneRoutes(routes),
      title: wallTitle,
    };
    localStorage.setItem(storageKey, JSON.stringify(snapshot));
  }

  function updateTitle(event: Event) {
    wallTitle = (event.target as HTMLInputElement).value;
    localStorage.setItem("climbing-wall-title", wallTitle);
    persistRoutes();
    hasUnsavedChanges = true;
  }

  function selectRoute(index: number) {
    selectedIndex = index;
  }

  function rememberRoutes() {
    undoStack = [...undoStack, cloneRoutes(routes)].slice(-50);
  }

  function commitRoutes(nextRoutes: Boulder[]) {
    rememberRoutes();
    redoStack = [];
    routes = nextRoutes;
    persistRoutes();
    hasUnsavedChanges = true;
  }

  function addRoute() {
    commitRoutes([...routes, { name: "New Climb", grade: "V0", holds: [] }]);
    selectRoute(routes.length - 1);
  }

  function updateRoute(
    index: number,
    updatedName: string,
    updatedGrade: string,
  ) {
    commitRoutes(
      routes.map((route, routeIndex) =>
        routeIndex === index
          ? { ...route, name: updatedName, grade: updatedGrade }
          : route,
      ),
    );
  }

  function deleteRoute(index: number) {
    commitRoutes(routes.filter((_, routeIndex) => routeIndex !== index));
    saveStatus = "Climb deleted (not saved)";
    if (selectedIndex === index) selectRoute(routes.length ? 0 : -1);
    else if (selectedIndex > index) selectRoute(selectedIndex - 1);
  }

  function resetRoutes() {
    commitRoutes(cloneRoutes(embeddedRoutes));
    saveStatus = "All climbs reset (not saved)";
    selectRoute(routes.length ? 0 : -1);
  }

  function undo() {
    const previous = undoStack.at(-1);
    if (!previous) return;
    redoStack = [...redoStack, cloneRoutes(routes)];
    undoStack = undoStack.slice(0, -1);
    routes = cloneRoutes(previous);
    persistRoutes();
    hasUnsavedChanges = true;
    if (selectedIndex >= routes.length) selectRoute(routes.length ? 0 : -1);
  }

  function redo() {
    const next = redoStack.at(-1);
    if (!next) return;
    undoStack = [...undoStack, cloneRoutes(routes)];
    redoStack = redoStack.slice(0, -1);
    routes = cloneRoutes(next);
    persistRoutes();
    hasUnsavedChanges = true;
    if (selectedIndex >= routes.length) selectRoute(routes.length ? 0 : -1);
  }

  function cycleHold(target: string) {
    const current = selectedRoute();
    if (!current) return;
    const holdIndex = current.holds.findIndex((hold) => hold.target === target);
    const nextHolds = [...current.holds];

    if (holdIndex < 0) nextHolds.push({ type: "start", target });
    else {
      const nextType: Record<HoldType, HoldType | undefined> = {
        start: "normal",
        normal: "end",
        end: undefined,
      };
      const next = nextType[nextHolds[holdIndex].type];
      if (next) nextHolds[holdIndex] = { ...nextHolds[holdIndex], type: next };
      else nextHolds.splice(holdIndex, 1);
    }

    commitRoutes(
      routes.map((route, index) =>
        index === selectedIndex ? { ...route, holds: nextHolds } : route,
      ),
    );
  }

  async function saveRoutes() {
    if (import.meta.env.DEV) {
      console.log("Save disabled in development; use the production build.");
      saveStatus = "Save disabled in development; use the production build.";
      return;
    }
    saveStatus = "Saving...";
    const clone = document.documentElement.cloneNode(true) as HTMLElement;
    const appMountPoint = clone.querySelector("#app");
    if (appMountPoint) {
      appMountPoint.innerHTML = "";
    } else {
      // Fallback: If we mount directly to the body, manually remove the app nodes
      clone.querySelectorAll(".app").forEach((el) => el.remove());
    }
    clone
      .querySelectorAll('[id^="hold-"]')
      .forEach((element) => element.classList.remove("start", "normal", "end"));
    const clonedStatus = clone.querySelector(".save-status");
    if (clonedStatus) clonedStatus.textContent = "Not saved";
    const titleScript = clone.querySelector("#wall-title");
    if (titleScript)
      titleScript.textContent = wallTitle.replace(/</g, "\\u003c");
    const dataScript = clone.querySelector("#boulders-data");
    if (!dataScript) {
      saveStatus = "Save unavailable";
      return;
    }
    const snapshot: SavedSnapshot = {
      savedAt: Date.now(),
      routes: cloneRoutes(routes),
      title: wallTitle,
    };
    dataScript.textContent = JSON.stringify(snapshot, null, 2).replace(
      /</g,
      "\\u003c",
    );
    const html = `<!DOCTYPE html>\n${clone.outerHTML}`;

    try {
      const pickerWindow = window as Window & {
        showSaveFilePicker?: (
          options: unknown,
        ) => Promise<FileSystemFileHandle>;
      };
      if (!fileHandle && pickerWindow.showSaveFilePicker) {
        fileHandle = await pickerWindow.showSaveFilePicker({
          suggestedName: "topo-sous-sol.html",
          types: [
            { description: "HTML File", accept: { "text/html": [".html"] } },
          ],
        });
      }
      if (fileHandle) {
        const writable = await fileHandle.createWritable();
        await writable.write(html);
        await writable.close();
      } else {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(
          new Blob([html], { type: "text/html" }),
        );
        link.download = "topo-sous-sol.html";
        link.click();
        URL.revokeObjectURL(link.href);
      }
      localStorage.setItem(storageKey, JSON.stringify(snapshot));
      localStorage.removeItem("climbing-wall-title");
      hasUnsavedChanges = false;
      saveStatus = `Saved at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } catch (error) {
      if ((error as DOMException).name === "AbortError")
        saveStatus = "Save cancelled";
      else {
        saveStatus = "Save failed";
      }
    }
  }

  function printRoutes() {
    window.print();
  }

  function versionNumber(version: string) {
    const parsed = Date.parse(version);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  async function checkForUpdates() {
    try {
      const response = await fetch(
        `${updateSourceUrl}?update-check=${Date.now()}`,
        { cache: "no-store" },
      );
      if (!response.ok) return;
      const remoteDocument = new DOMParser().parseFromString(
        await response.text(),
        "text/html",
      );
      const remoteVersion =
        remoteDocument
          .querySelector('meta[name="app-version"]')
          ?.getAttribute("content") ?? "";
      if (versionNumber(remoteVersion) > versionNumber(__APP_VERSION__)) {
        latestVersion = remoteVersion;
        updateAvailable = true;
        saveStatus = "App update available";
      }
    } catch {
      // Offline or opening the app from file:; keep the installed app usable.
    }
  }

  async function updateApp() {
    saveStatus = "Downloading app update...";
    try {
      const response = await fetch(`${updateSourceUrl}?update=${Date.now()}`, {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Update unavailable");
      const remoteDocument = new DOMParser().parseFromString(
        await response.text(),
        "text/html",
      );
      const dataScript = remoteDocument.querySelector("#boulders-data");
      const titleScript = remoteDocument.querySelector("#wall-title");
      if (!dataScript || !titleScript) throw new Error("Invalid app update");
      const snapshot: SavedSnapshot = {
        savedAt: Date.now(),
        routes: cloneRoutes(routes),
        title: wallTitle,
      };
      dataScript.textContent = JSON.stringify(snapshot, null, 2).replace(
        /</g,
        "\\u003c",
      );
      titleScript.textContent = wallTitle.replace(/</g, "\\u003c");
      const html = `<!DOCTYPE html>\n${remoteDocument.documentElement.outerHTML}`;
      if (fileHandle) {
        const writable = await fileHandle.createWritable();
        await writable.write(html);
        await writable.close();
      } else {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(
          new Blob([html], { type: "text/html" }),
        );
        link.download = "topo-sous-sol.html";
        link.click();
        URL.revokeObjectURL(link.href);
      }
      localStorage.setItem(storageKey, JSON.stringify(snapshot));
      localStorage.removeItem("climbing-wall-title");
      updateAvailable = false;
      saveStatus = `App updated to ${new Date(latestVersion).toLocaleString()}`;
    } catch {
      saveStatus = "App update failed";
    }
  }

  function exportData() {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(
      new Blob([JSON.stringify(routes, null, 2)], { type: "application/json" }),
    );
    link.download = "topo-sous-sol-data.json";
    link.click();
    URL.revokeObjectURL(link.href);
    saveStatus = "Data exported";
  }

  function importData() {
    importInput?.click();
  }

  async function readImportedData(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      const contents = await file.text();
      let parsed: unknown;
      if (
        file.name.toLowerCase().endsWith(".html") ||
        file.type === "text/html"
      ) {
        const document = new DOMParser().parseFromString(contents, "text/html");
        const dataScript = document.querySelector("#boulders-data");
        if (!dataScript?.textContent)
          throw new Error("Missing embedded route data");
        parsed = JSON.parse(dataScript.textContent);
      } else {
        parsed = JSON.parse(contents);
      }
      if (
        !Array.isArray(parsed) ||
        !parsed.every(
          (route) =>
            route &&
            typeof route.name === "string" &&
            typeof route.grade === "string" &&
            Array.isArray(route.holds),
        )
      )
        throw new Error("Invalid route data");
      commitRoutes(cloneRoutes(parsed));
      selectRoute(routes.length ? 0 : -1);
      saveStatus = "Imported data (not saved)";
    } catch {
      saveStatus = "Import failed";
    } finally {
      input.value = "";
    }
  }

  onMount(() => {
    const embeddedTitle = document
      .getElementById("wall-title")
      ?.textContent?.trim();
    wallTitle = embeddedTitle || "My Wall";
    const embedded = document.getElementById("boulders-data")?.textContent;
    let embeddedSnapshot: SavedSnapshot | undefined;
    if (embedded) {
      try {
        const parsedEmbedded = JSON.parse(embedded) as
          | SavedSnapshot
          | Boulder[];
        embeddedSnapshot = Array.isArray(parsedEmbedded)
          ? { savedAt: 0, routes: parsedEmbedded }
          : parsedEmbedded;
        if (Array.isArray(embeddedSnapshot.routes)) {
          embeddedRoutes = cloneRoutes(embeddedSnapshot.routes);
          routes = cloneRoutes(embeddedSnapshot.routes);
          if (embeddedSnapshot.title) wallTitle = embeddedSnapshot.title;
        }
      } catch {
        embeddedRoutes = cloneRoutes(initialRoutes);
        routes = cloneRoutes(initialRoutes);
      }
    }
    const localRoutes = localStorage.getItem(storageKey);
    if (localRoutes) {
      try {
        const parsedLocal = JSON.parse(localRoutes) as
          | SavedSnapshot
          | Boulder[];
        const localSnapshot: SavedSnapshot = Array.isArray(parsedLocal)
          ? { savedAt: 0, routes: parsedLocal }
          : parsedLocal;
        if (
          Array.isArray(localSnapshot.routes) &&
          localSnapshot.savedAt > (embeddedSnapshot?.savedAt ?? 0)
        ) {
          routes = cloneRoutes(localSnapshot.routes);
          if (localSnapshot.title) wallTitle = localSnapshot.title;
          hasUnsavedChanges = true;
        }
      } catch {
        localStorage.removeItem(storageKey);
      }
    }
    if (routes.length) selectRoute(0);
    const saveOnShortcut = (event: KeyboardEvent) => {
      const modifier = event.ctrlKey || event.metaKey;
      if (modifier && event.key.toLowerCase() === "s") {
        event.preventDefault();
        saveRoutes();
      } else if (modifier && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      } else if (modifier && event.key.toLowerCase() === "y") {
        event.preventDefault();
        redo();
      }
    };
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      if (import.meta.env.DEV || !hasUnsavedChanges) return;
      event.preventDefault();
      event.returnValue =
        "You have unsaved changes. Are you sure you want to leave?";
    };
    window.addEventListener("keydown", saveOnShortcut);
    window.addEventListener("beforeunload", warnBeforeUnload);

    checkForUpdates();
    return () => {
      window.removeEventListener("keydown", saveOnShortcut);
      window.removeEventListener("beforeunload", warnBeforeUnload);
    };
  });
</script>

<svelte:head>
  <title>{wallTitle} | Route Setter</title>
  <link rel="icon" href={favicon} />
</svelte:head>

<div class="app">
  <!-- Shared image for reuse -->
  <svg style="display: none;">
    <g id="shared-wall-image">
      <image
        href={wallImage}
        x="0"
        y="0"
        width="264.58334"
        height="264.58334"
        preserveAspectRatio="none"
      />
    </g>
  </svg>

  <aside>
    <header>
      <input
        class="wall-title"
        aria-label="Wall title"
        value={wallTitle}
        oninput={updateTitle}
      />
    </header>

    <RouteList
      {routes}
      selected={selectedIndex}
      onSelect={selectRoute}
      onAdd={addRoute}
      onUpdate={updateRoute}
      onDelete={deleteRoute}
      onResetAll={resetRoutes}
      onUndo={undo}
      canUndo={undoStack.length > 0}
    />

    <footer>
      <button onclick={printRoutes}>Print routes</button>
      <button onclick={saveRoutes}>Save HTML</button>
      <button onclick={exportData}>Export data</button>
      <button onclick={importData}>Import data</button>
      <input
        class="import-input"
        bind:this={importInput}
        type="file"
        accept="application/json,.json,text/html,.html"
        onchange={readImportedData}
      />
      {#if updateAvailable}
        <button class="update-app" onclick={updateApp}>Update app</button>
      {/if}
      <span
        class:unsaved={hasUnsavedChanges}
        class="save-status"
        aria-live="polite"
      >
        {hasUnsavedChanges ? "Unsaved changes" : saveStatus}
      </span>
    </footer>
  </aside>

  <main>
    <div class="bar">
      <span>ROUTE SETTER</span>
    </div>
    <div class="legend" aria-label="Hold types">
      <span><i class="start"></i> Start</span>
      <span><i class="normal"></i> Move</span>
      <span><i class="end"></i> Finish</span>
    </div>
    <WallCanvas route={selectedRoute()} onCycle={cycleHold} />
    <p class="hint">Click a hold to cycle start, move, finish, then clear.</p>
  </main>
</div>

<PrintRoutes {routes} />

<style>
  :global(*) {
    box-sizing: border-box;
  }
  :global(body) {
    margin: 0;
    overflow-x: hidden;
    scrollbar-color: #d99852 #202629;
    scrollbar-width: thin;
    background: #15191c;
    color: #f4f0e8;
    font-family: Georgia, "Times New Roman", serif;
  }
  button {
    font: inherit;
  }
  .app {
    display: flex;
    min-height: 100vh;
  }
  aside {
    width: 330px;
    min-width: 330px;
    height: 100vh;
    max-height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background: #202629;
    border-right: 1px solid #394044;
  }
  header {
    padding: 18px 20px 14px;
    border-bottom: 1px solid #394044;
  }
  .wall-title {
    display: block;
    width: 100%;
    margin: 0;
    padding: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: #f4f0e8;
    font:
      normal 28px Georgia,
      "Times New Roman",
      serif;
    line-height: 1.1;
  }
  .wall-title:focus {
    border-bottom: 1px solid #d99852;
  }
  button {
    border: 0;
    cursor: pointer;
  }
  footer {
    padding: 18px 28px;
    border-top: 1px solid #394044;
  }
  footer button {
    padding: 0;
    margin-right: 14px;
    color: #d99852;
    background: none;
    font:
      11px Arial,
      sans-serif;
  }
  .import-input {
    display: none;
  }
  .save-status {
    display: block;
    margin-top: 12px;
    color: #8e9a99;
    font:
      11px Arial,
      sans-serif;
  }
  .save-status.unsaved {
    color: #d99852;
  }
  .update-app {
    color: #1c2526;
    background: #d99852;
    padding: 7px 10px;
    font:
      bold 11px Arial,
      sans-serif;
  }
  .update-app:hover {
    background: #ebb36e;
  }
  main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    padding: 22px 28px 18px;
  }
  .bar {
    display: flex;
    justify-content: space-between;
    padding: 0 3px 12px;
    color: #8e9a99;
    font:
      11px Arial,
      sans-serif;
    letter-spacing: 0.1em;
  }
  .hint {
    margin: 12px 3px 0;
    color: #8e9a99;
    text-align: right;
    font:
      11px Arial,
      sans-serif;
  }
  .legend {
    display: flex;
    gap: 18px;
    padding: 0 3px 10px;
    color: #aeb8b5;
    font:
      11px Arial,
      sans-serif;
  }
  .legend span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .legend i {
    width: 9px;
    height: 9px;
    border-radius: 50%;
  }
  .legend i.start {
    background: #e4a257;
  }
  .legend i.normal {
    background: #72a9b7;
  }
  .legend i.end {
    background: #d96e62;
  }
  @media (max-width: 700px) {
    .app {
      flex-direction: column;
    }
    aside {
      width: 100%;
      min-width: 0;
      height: auto;
      max-height: none;
      overflow: visible;
    }
    :global(.route-list) {
      order: 2;
    }
    footer {
      order: 4;
    }
    header {
      padding: 20px;
    }
    main {
      min-height: 0;
      height: auto;
      padding: 14px 0;
    }
    footer {
      padding: 12px 20px;
    }
    .bar,
    .hint {
      margin-left: 14px;
      margin-right: 14px;
    }
  }
  @media print {
    @page {
      size: A4 landscape;
      margin: 0;
    }
    :global(body) {
      background: white;
    }
    .app {
      display: none;
    }
  }
</style>
