# Workflow Standard Skull King

## Processus de Travail

```
User Request -> Read Context -> Plan -> Implement -> Test -> Self-Review -> Present
```

### 1. Read Context
- Lire CLAUDE.md (ou AGENTS.md) pour comprendre le projet
- Pour les règles de jeu : `regles-participants-et-plis.txt` + skill `test-scoring`
- Comprendre la séparation domain / screens / hooks

### 2. Plan
- Utiliser le suivi de tâches si la demande est complexe
- Identifier les fichiers à modifier
- Si la règle métier change : prévoir les tests AVANT l'implémentation

### 3. Implement
- Respecter le style du code existant (TypeScript strict, pas de `any`)
- Logique métier dans `src/domain/`, jamais dans les composants
- Auto-fix les erreurs évidentes

### 4. Test
```bash
pnpm typecheck   # doit passer
pnpm test        # doit passer
pnpm build       # doit passer (standalone)
```

### 5. Self-Review
- Invoquer la skill `self-review` avant tout commit
- Vérifier les invariants (localStorage, domain pur, jouable hors ligne)

### 6. Present Result
- Résumé clair des changements
- Attendre "commit" avant de commiter
- Attendre "push" avant de pusher

## Git Policy

**NEVER AUTO-PUSH** :
- Créer les commits uniquement quand demandé
- Ne JAMAIS push sans demande explicite
- Toujours montrer git status avant commit
- Rappel : un push sur `main` déclenche un déploiement en production sur le NAS

## Déclenchement automatique des skills

| Situation | Skill |
|-----------|-------|
| Avant un commit | `self-review` |
| Modification de scoring.ts / gameState.ts | `test-scoring` |
| Question sur le déploiement / site down | `deploy` |
| Nouvelle fonctionnalité demandée | `feature` |
