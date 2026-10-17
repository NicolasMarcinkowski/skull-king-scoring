---
name: feature
description: Workflow complet pour implémenter une nouvelle fonctionnalité (analyse, plan, implémentation, tests)
---

# Feature

Workflow structuré pour ajouter ou modifier une fonctionnalité.

## Instructions

### 1. Analyse
- Relire CLAUDE.md et les invariants critiques
- Si la demande touche aux règles du jeu : relire `regles-participants-et-plis.txt`
  et la skill `test-scoring`
- Identifier les fichiers impactés (domain ? screens ? hooks ? styles ?)

### 2. Plan
- Lister les étapes avec le suivi de tâches
- Décider : la logique va-t-elle dans `src/domain/` (règle métier, calcul)
  ou dans les composants (pure UI) ?
- Si le format de sauvegarde change : prévoir la migration dans `gameState.js`

### 3. Implémentation
- Règle métier → `src/domain/` + tests dans `src/domain/*.test.js` (node --test)
- Écran → `src/screens/`, composant réutilisable → `src/components/ui.jsx`
- Styles → `src/styles/` en respectant la DA nordique
- JamaIS de TypeScript, pas de nouvelle dépendance sans accord explicite

### 4. Vérification
```bash
pnpm test     # tests métier
pnpm build    # export statique OK
pnpm dev      # vérif visuelle si pertinent
```

### 5. Présentation
- Résumer les changements fichier par fichier
- Signaler tout impact sur les sauvegardes existantes
- NE PAS commit/push sans demande explicite

## Pièges connus

- `output: 'export'` interdit API routes et features serveur
- Le premier rendu doit être identique serveur/client (hydratation) :
  ne jamais lire localStorage pendant le rendu initial
- À 8 joueurs, les manches 9 et 10 restent à 8 cartes (`cardsForRound`)
