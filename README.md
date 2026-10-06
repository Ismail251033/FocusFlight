# Focus Flight

Focus Flight transforme une session de concentration en véritable vol : **TIME → FLIGHT → FOCUS → LANDING**. Choisissez une durée, sélectionnez une route, embarquez, puis restez concentré jusqu’à l’arrivée.

## Fonctionnalités

L’application inclut un parcours complet Home → choix de durée → choix du vol → boarding pass → rappel DND → boarding → takeoff → cruise → pause/reprise → landing → résumé → statistiques. Les routes locales ont toujours la durée exacte choisie. La carte stylisée, les phases de vol et l’avion sont synchronisés avec un timer basé sur des timestamps, pas avec un compteur décrémenté.

Les préférences, l’historique et une session en cours sont conservés dans `localStorage`. Un refresh, un changement d’onglet ou une réouverture reprennent le vol au bon moment. L’interface est responsive, accessible au clavier, compatible avec `prefers-reduced-motion` et installable comme PWA. Aucun compte, backend, API d’aviation, Supabase ou clé secrète n’est nécessaire.

## Stack

- React + TypeScript
- Vite
- CSS responsive mobile-first
- Lucide React pour les icônes
- `localStorage` pour les données locales
- Service worker et manifest PWA

## Installation locale

```bash
npm ci
npm run dev
```

Puis ouvrir l’URL indiquée par Vite. Le projet écoute sur `0.0.0.0:3000` pour faciliter la preview.

Commandes disponibles :

```bash
npm run dev       # serveur de développement
npm run build     # vérification TypeScript + build Vite
npm run preview   # servir le build dist localement
```

## Structure

`src/components` contient le branding, la navigation, la carte, les cartes de vols et le boarding pass. `src/pages/Pages.tsx` regroupe les écrans fonctionnels. `src/data` contient les routes locales, `src/store` le stockage versionné et `src/utils` les calculs de temps, de phases et de statistiques. `public` contient le manifest, les icônes, le service worker et `manus-routes.json`.

## Fiabilité du timer

Une session active enregistre `startTime`, `durationMs`, `pausedAt`, `totalPausedMs` et son statut. À chaque rendu, le temps écoulé est calculé comme une différence de timestamps. En pause, l’horloge se fige sur `pausedAt`. À la reprise, la durée de pause est ajoutée à `totalPausedMs`. La progression de la carte est `elapsedMs / durationMs`, bornée entre 0 et 1. Les phases suivent les seuils demandés : 0–5 % boarding, 5–15 % takeoff, 15–80 % cruise, 80–95 % descent, 95–100 % landing.

La web app ne peut pas activer le mode Do Not Disturb du système. L’écran DND l’explique et propose des instructions adaptées mobile et desktop. Les sons sont optionnels, subtils et déclenchés uniquement après une interaction utilisateur.

## GitHub

Le projet est prêt à être poussé sur un repository GitHub. Depuis ce dossier :

```bash
git remote add github https://github.com/<user>/<repository>.git
git push -u github main
```

Aucun secret ne doit être ajouté au repository. `.gitignore` exclut les dépendances, builds, fichiers `.env`, logs et fichiers système.

## Vercel

Importer le repository GitHub dans Vercel avec les valeurs suivantes :

- Install command : `npm ci`
- Build command : `npm run build`
- Output directory : `dist`
- Framework preset : `Vite` (ou `Other` avec les mêmes commandes)

`vercel.json` contient uniquement les rewrites des routes client `/choose-time`, `/flights`, `/flight/:id`, `/dnd`, `/focus`, `/landing`, `/summary`, `/stats` et `/settings` vers `/index.html`. Les assets statiques ne sont pas réécrits. Il configure aussi `Cache-Control: no-cache` pour `index.html` et `sw.js`, afin que les nouvelles versions soient détectées.

Le service worker utilise un cache versionné (`focus-flight-v2`), supprime les anciennes versions à l’activation et utilise une stratégie network-first pour les navigations HTML. Les assets sont ensuite mis en cache pour le mode hors ligne sans servir une ancienne application après un déploiement.

## Données locales

Les vols et statistiques restent sur l’appareil utilisé. Le bouton `Reset local data` dans Settings efface l’historique, la session et les préférences du navigateur courant.
