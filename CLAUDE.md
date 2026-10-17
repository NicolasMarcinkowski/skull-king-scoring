# Skull King — Le Journal des Mers

Application de comptage de points pour le jeu de cartes Skull King.
Site 100% statique : aucun backend, aucune base de données, persistance via localStorage.

> Ce fichier sert d'instructions pour les agents IA (Claude Code lit `CLAUDE.md`,
> Codex lit `AGENTS.md` qui est un symlink vers ce fichier).
> Les skills partagés sont dans `.claude/skills/` (symlink `.agents/skills/` pour Codex).

## Stack Technique

| Composant | Technologie |
|-----------|-------------|
| Frontend | Next.js 16 (App Router) + React 19 |
| Langage | JavaScript (JSX) — **pas de TypeScript** |
| Styling | CSS custom (`src/styles/`) — **pas de Tailwind** |
| State | Réducteur immuable maison (`src/domain/gameState.js`) |
| Persistance | localStorage (clé `skullking-journal-v1`) |
| Build | `output: 'export'` → export statique dans `out/` |
| Tests | `node --test` natif (pas de Jest/Vitest) |
| Package manager | pnpm 11 (via corepack) |
| Deploy | Docker (nginx) + GitHub Actions → NAS |

## Commandes

```bash
pnpm install --frozen-lockfile   # installation
pnpm dev                         # dev sur http://127.0.0.1:3000
pnpm test                        # tests métier (node --test src/domain/*.test.js)
pnpm build                       # export statique dans out/
pnpm preview                     # sert out/ localement (scripts/serve-export.mjs)
```

Si `pnpm` est introuvable : `corepack enable` puis `corepack pnpm <cmd>`.

## Structure

```
src/
├── app/            # App Router Next.js (layout, page)
├── App.jsx         # Parcours, confirmations, notifications
├── screens/        # Home, Setup, Round, ScoreSheet, Finish
├── components/     # Layout, commandes réutilisables (ui.jsx)
├── domain/         # LOGIQUE MÉTIER PURE (sans React) + tests
│   ├── scoring.js      # règles de score, validation des manches
│   └── gameState.js    # réducteur immuable, migration des sauvegardes
├── hooks/
│   └── useJournal.js   # hydratation + sauvegarde localStorage
└── styles/         # CSS nordique responsive (base, controls)
```

## Règles Métier Skull King (résumé)

Voir `regles-participants-et-plis.txt` et la skill `test-scoring` pour le détail.

- 2 à 8 joueurs humains, 10 manches
- Cartes distribuées = numéro de manche (plafonné à 8 cartes à 8 joueurs)
- Score : annonce exacte → `bid × 20` ; annonce 0 exacte → `10 × cartes` ;
  ratée → `−10 × |écart|` (annonce 0 ratée → `−10 × cartes`)
- Bonus par paliers de 5, accordés **uniquement si l'annonce est exacte**
- Kraken : un pli peut être détruit → total des plis attendu = cartes − 1
- La somme des plis remportés doit égaler le total attendu pour valider

## Invariants Critiques

1. **`src/domain/` ne doit jamais importer React** — logique pure testable avec node --test
2. **Compatibilité des sauvegardes** : la clé `skullking-journal-v1` et la migration
   des anciennes parties (`gameState.js`) ne doivent pas être cassées
3. **SSR = premier rendu client** : la sauvegarde localStorage n'est lue qu'après
   hydratation (`useJournal.js`) pour éviter d'écraser les données
4. **Export statique** : pas d'API routes, pas de `next/image` avec optimisation
   serveur, pas de fonctionnalités nécessitant un serveur Node

## Workflow & Qualité

Voir `.claude/rules/workflow.md` et `.claude/rules/quality.md`.
Règle d'or : **jamais de commit/push sans demande explicite de l'utilisateur**.

Avant de considérer une tâche terminée : `pnpm test` puis `pnpm build` doivent passer.

## Déploiement

Push sur `main` → GitHub Actions (`.github/workflows/deploy.yml`) :
1. Build image Docker (pnpm build → export → nginx) → push `ghcr.io/nicolasmarcinkowski/skull-king-scoring:latest`
2. SSH sur le NAS → `docker compose pull && up -d` dans `/volume1/docker/skull-king-scoring/`
3. Site exposé sur le port **3011** du NAS

Voir la skill `deploy` pour le diagnostic.
