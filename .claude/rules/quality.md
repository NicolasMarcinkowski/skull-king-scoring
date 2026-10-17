# Standards de Qualité

## Code Style

### TypeScript
- Strict mode activé — pas de `any` (exceptions documentées uniquement)
- Types partagés dans `src/domain/types.ts` (Game, Round, State, Action...)
- `Action` est une union discriminée : toute nouvelle action du réducteur y est ajoutée
- Modules ES, imports de types avec `import type` (verbatimModuleSyntax)
- Dans `src/domain/` : extensions `.ts` explicites dans les imports et syntaxe
  « erasable only » (pas d'enum/namespace) — requis par le type stripping de Node
- Pas de `console.log` en production

### React
- Composants fonctionnels uniquement, props typées
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
src/domain/     # Logique métier pure + types, testable avec node --test
src/screens/    # Écrans (un fichier par écran)
src/components/ # UI réutilisable
src/hooks/      # Pont React <-> localStorage
```

- Toute nouvelle règle de jeu va dans `src/domain/` AVEC ses tests
- Les écrans ne calculent pas de scores : ils appellent `scoring.ts`

### Serveur (standalone)
- `next.config.ts` garde `output: 'standalone'`
- L'app de jeu reste 100% client-side (localStorage) : pas de dépendance serveur
  pour jouer. Les API routes sont autorisées pour les features portail à venir

## Testing

- Tests avec `node --test` natif dans `src/domain/*.test.ts` (type stripping)
- Toute modification de `scoring.ts` ou `gameState.ts` doit être couverte
- Les cas de validation de `regles-participants-et-plis.txt` font foi
- `pnpm typecheck` et `pnpm test` doivent passer avant tout commit

## Persistance

- Clé localStorage : `skullking-journal-v1` — ne jamais la renommer
- Toute évolution du format de sauvegarde doit inclure une migration
  des anciennes parties dans `gameState.ts`
