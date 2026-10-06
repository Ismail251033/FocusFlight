# Focus Flight — audit de préparation au déploiement

## Vérifié dans la preview

- [x] Le parcours Home → durée → vol → détails → boarding pass → DND → boarding → focus → landing → résumé → statistiques fonctionne entièrement.
- [x] Les durées prédéfinies et personnalisées produisent des vols d’une durée exacte.
- [x] Le timer utilise `startTime`, `durationMs`, `pausedAt` et `totalPausedMs`, persiste via `localStorage`, survit au refresh et reprend après pause sans dérive observable.
- [x] La progression de l’avion est calculée à partir du timer et reste synchronisée avec le temps écoulé jusqu’à l’arrivée.
- [x] Pause, Resume, End Flight et Continue Flight ont de vraies actions ; un vol interrompu apparaît dans le résumé avec le statut `ENDED`.
- [x] L’atterrissage automatique à zéro crée un historique `LANDED`, affiche Landing puis Summary, et alimente Stats.
- [x] Les statistiques, settings, thème, format horaire, son et reduced motion sont persistants et fonctionnels.
- [x] Les routes SPA, `manus-routes.json`, les boutons principaux et les assets PWA répondent correctement en preview.
- [x] Le responsive a été inspecté à 390 px, 768 px, 1024 px et 1440 px ; aucun débordement horizontal n’a été détecté.
- [x] Le service worker utilise `focus-flight-v2`, supprime les anciens caches et applique network-first aux navigations HTML.
- [x] `npm ci` et `npm run build` réussissent sans erreur TypeScript ou Vite.

## Préparé mais dépendant d’un compte externe

- [x] `vercel.json` configure les rewrites SPA exactes et les headers anti-cache obsolète pour `index.html` et `sw.js`.
- [x] `README.md`, `.gitignore`, `package.json` et `package-lock.json` sont prêts pour GitHub/Vercel ; aucun secret n’est présent.
- [ ] Pousser `main` vers le repository GitHub de l’utilisateur — nécessite l’URL du repository ou son import depuis Vercel.
- [ ] Déployer sur Vercel puis vérifier les refresh directs sur toutes les routes et l’installation PWA sur l’URL de production.
