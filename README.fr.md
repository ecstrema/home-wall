# My Wall

Application Svelte/Vite pour créer et imprimer le guide des voies d'un mur d'escalade à la maison.

[Read the English version](README.md)

## Développement

```sh
bun install
bun run dev
```

Les voies sont conservées dans `localStorage`. **Save shared HTML** (ou `Ctrl+S`) utilise le File System Access API lorsqu'il est disponible et écrit les données dans un fichier HTML partageable. Les autres navigateurs téléchargent le fichier.

## Production

```sh
bun run build
bun run preview
```

L'impression produit quatre voies par page A4.

## Déploiement

Chaque push sur `main` construit puis publie `dist/index.html` sur GitHub Pages via `.github/workflows/deploy.yml`. Le workflow publie aussi une source de mise à jour dans la branche `app-source`, car `raw.githubusercontent.com` autorise les lectures cross-origin depuis les installations locales en `file:`. L'application compare sa version horodatée avec cette source et propose une mise à jour en conservant les voies et le titre locaux.

## Transparence concernant l'IA

La majeure partie de ce code a été créée avec l'aide de l'IA. J'ai très peu modifié le code moi-même. Je reste responsable du projet, mais ce dépôt doit être considéré comme du code assisté par l'IA et révisé en conséquence.
