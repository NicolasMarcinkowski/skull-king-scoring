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
- Si le format de sauvegarde change : prévoir la migration dans `gameState.ts`

### 3. Implémentation
- Règle métier → `src/domain/` + tests dans `src/domain/*.test.ts` (node --test)
- Nouveaux types/actions → `src/domain/types.ts` (union discriminée `Action`)
- Écran → `src/screens/`, composant réutilisable → `src/components/ui.tsx`
- Styles → `src/styles/` en respectant la DA nordique
- TypeScript strict, pas de `any`, pas de nouvelle dépendance sans accord explicite

### 4. Vérification
```bash
pnpm typecheck   # tsc --noEmit
pnpm test        # tests métier
pnpm build       # build standalone OK
pnpm dev         # vérif visuelle si pertinent
```

### 5. Présentation
- Résumer les changements fichier par fichier
- Signaler tout impact sur les sauvegardes existantes
- NE PAS commit/push sans demande explicite

## Pièges connus

- Le jeu doit rester jouable hors ligne : pas de dépendance serveur pour la
  partie jeu (les API routes sont réservées aux features portail)
- Dans `src/domain/` : imports avec extension `.ts` et syntaxe « erasable only »
  (pas d'enum/namespace) — sinon les tests node --test cassent
- Le premier rendu doit être identique serveur/client (hydratation) :
  ne jamais lire localStorage pendant le rendu initial
- À 8 joueurs, les manches 9 et 10 restent à 8 cartes (`cardsForRound`)
