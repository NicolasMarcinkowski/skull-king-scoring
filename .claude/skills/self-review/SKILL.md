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

### 2. Tests & Build

```bash
pnpm test     # 0 échec attendu
pnpm build    # export statique doit réussir
```

### 3. Vérifier les invariants du projet

- [ ] `src/domain/` n'importe pas React ni de module navigateur
- [ ] Clé localStorage `skullking-journal-v1` inchangée
- [ ] Pas de lecture localStorage pendant le rendu initial (hydratation)
- [ ] `next.config.mjs` garde `output: 'export'`
- [ ] Pas de TypeScript introduit, pas de dépendance ajoutée sans accord

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
- Tests : OK / X échecs
- Build : OK / erreur
- Invariants : OK / X alertes

### Verdict
**[READY TO COMMIT]** / **[NEEDS FIXES]**
```

Rappel : ne pas commit sans demande explicite. Un push sur main = déploiement prod.
