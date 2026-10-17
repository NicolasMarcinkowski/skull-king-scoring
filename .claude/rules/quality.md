# Standards de Qualité

## Code Style

### JavaScript
- Projet en JavaScript pur (JSX) — ne pas introduire TypeScript
- Modules ES (`type: "module"`), imports explicites
- Fonctions courtes et pures dans `src/domain/`
- Pas de `console.log` en production

### React
- Composants fonctionnels uniquement
- Hooks personnalisés dans `src/hooks/`
- `src/domain/` ne doit JAMAIS importer React

### CSS
- Styles dans `src/styles/` (base.css, controls.css)
- Pas de Tailwind, pas de CSS-in-JS
- Respecter la direction artistique nordique (fjord, bleu nuit, acier, bronze)
- Responsive mobile-first (usage principal : téléphone pendant une partie)

## Architecture

### Séparation stricte
```
src/domain/     # Logique métier pure, testable avec node --test
src/screens/    # Écrans (un fichier par écran)
src/components/ # UI réutilisable
src/hooks/      # Pont React <-> localStorage
```

- Toute nouvelle règle de jeu va dans `src/domain/` AVEC ses tests
- Les écrans ne calculent pas de scores : ils appellent `scoring.js`

### Contraintes export statique
- Pas d'API routes, pas de server components dynamiques
- Pas de dépendance à un serveur Node au runtime
- `next.config.mjs` garde `output: 'export'`

## Testing

- Tests avec `node --test` natif dans `src/domain/*.test.js`
- Toute modification de `scoring.js` ou `gameState.js` doit être couverte
- Les cas de validation de `regles-participants-et-plis.txt` font foi
- `pnpm test` doit passer avant tout commit

## Persistance

- Clé localStorage : `skullking-journal-v1` — ne jamais la renommer
- Toute évolution du format de sauvegarde doit inclure une migration
  des anciennes parties dans `gameState.js`
