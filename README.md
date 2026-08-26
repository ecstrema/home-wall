# My Wall

Application Svelte/Vite pour creer et imprimer le guide des voies du mur d'escalade familial.

## Developpement

```sh
bun install
bun run dev
```

Les voies sont conservees dans `localStorage`. **Save shared HTML** (ou `Ctrl+S`) utilise le File System Access API quand il est disponible et ecrit les donnees dans un fichier HTML partageable. Sinon, le fichier est telecharge automatiquement.

## Production

```sh
bun run build
bun run preview
```

L'impression produit quatre voies par page A4.
