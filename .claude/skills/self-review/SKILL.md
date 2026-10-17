---
name: self-review
description: Auto-review du code avant commit (tests, build, invariants, sécurité)
---

# Self Review

Revue automatique du code modifié avant commit.

## Déclenchement

- Avant chaque commit
- Quand l'utilisateur dit "review", "vérifie", "check"

## Instructions

### 1. Collecter les changements

```bash
git status
git diff --stat HEAD
```

### 2. Types, Tests & Build

```bash
pnpm typecheck   # 0 erreur attendue
pnpm test        # 0 échec attendu
pnpm build       # build standalone doit réussir
```

### 3. Vérifier les invariants du projet

- [ ] `src/domain/` n'importe pas React ni de module navigateur
- [ ] Clé localStorage `skullking-journal-v1` inchangée
- [ ] Pas de lecture localStorage pendant le rendu initial (hydratation)
- [ ] `next.config.ts` garde `output: 'standalone'`
- [ ] Pas de `any`, pas de dépendance ajoutée sans accord
- [ ] Le jeu reste jouable hors ligne (pas de dépendance serveur côté jeu)

### 4. Patterns problématiques

Chercher dans les fichiers modifiés :
- `console.log` restants
- `TODO` / `FIXME` non traités
- Secrets hardcodés
- `dangerouslySetInnerHTML`

### 5. Cohérence

- Imports/variables inutilisés
- Logique métier qui aurait fui dans un composant (doit être dans domain/)
- Textes UI en français, cohérents avec le ton existant

## Format de Réponse

```markdown
## Self Review

### Fichiers analysés
| Fichier | Changements | Status |
|---------|-------------|--------|

### Métriques
- Types : OK / X erreurs
- Tests : OK / X échecs
- Build : OK / erreur
- Invariants : OK / X alertes

### Verdict
**[READY TO COMMIT]** / **[NEEDS FIXES]**
```

Rappel : ne pas commit sans demande explicite. Un push sur main = déploiement prod.
