# Skull King — Le Journal des Mers

Application de comptage de points pour le jeu de cartes Skull King.
Aucune base de données ni compte : les données vivent dans le navigateur (localStorage).

> Ce fichier sert d'instructions pour les agents IA (Claude Code lit `CLAUDE.md`,
> Codex lit `AGENTS.md` qui est un symlink vers ce fichier).
> Les skills partagés sont dans `.claude/skills/` (symlink `.agents/skills/` pour Codex).

## Stack Technique

| Composant | Technologie |
|-----------|-------------|
| Frontend | Next.js 16 (App Router) + React 19 |
| Langage | **TypeScript strict** (pas de `any`) |
| Styling | CSS custom (`src/styles/`) — **pas de Tailwind** |
| State | Réducteur immuable maison (`src/domain/gameState.ts`) |
| Persistance | localStorage (clé `skullking-journal-v1`) |
| Build | `output: 'standalone'` → serveur Node (`.next/standalone/server.js`) |
| Tests | `node --test` natif avec type stripping (pas de Jest/Vitest) |
| Package manager | pnpm 11 (via corepack) |
| Deploy | Docker (node:22-alpine) + GitHub Actions → NAS |

## Commandes

```bash
pnpm install --frozen-lockfile   # installation
pnpm dev                         # dev sur http://127.0.0.1:3000
pnpm test                        # tests métier (node --test, TS natif)
pnpm typecheck                   # tsc --noEmit
pnpm build                       # build standalone
pnpm start                       # sert le build (node .next/standalone/server.js)
```

Si `pnpm` est introuvable : `corepack enable` puis `corepack pnpm <cmd>`.

## Structure

```
src/
├── app/            # App Router Next.js (layout, page)
├── App.tsx         # Parcours, confirmations, notifications ('use client')
├── screens/        # Home, Setup, Round, ScoreSheet, Finish
├── components/     # Layout, commandes réutilisables (ui.tsx)
├── domain/         # LOGIQUE MÉTIER PURE (sans React) + tests
│   ├── types.ts        # Game, Round, State, Action (union discriminée)...
│   ├── scoring.ts      # règles de score, validation des manches
│   └── gameState.ts    # réducteur immuable, migration des sauvegardes
├── hooks/
│   └── useJournal.ts   # hydratation + sauvegarde localStorage
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

1. **`src/domain/` ne doit jamais importer React** — logique pure, testable avec
   node --test. Les imports y utilisent l'extension `.ts` explicite (type stripping
   Node) et une syntaxe TS « erasable only » (pas d'enum, pas de namespace)
2. **Compatibilité des sauvegardes** : la clé `skullking-journal-v1` et la migration
   des anciennes parties (`gameState.ts`) ne doivent pas être cassées
3. **SSR = premier rendu client** : la sauvegarde localStorage n'est lue qu'après
   hydratation (`useJournal.ts`) pour éviter d'écraser les données
4. **L'app reste client-side** : malgré le serveur Node (standalone), toute la
   logique de jeu tourne dans le navigateur. Les API routes sont désormais
   possibles (intégration portail à venir) mais le jeu doit rester jouable hors ligne

## Workflow & Qualité

Voir `.claude/rules/workflow.md` et `.claude/rules/quality.md`.
Règle d'or : **jamais de commit/push sans demande explicite de l'utilisateur**.

Avant de considérer une tâche terminée : `pnpm typecheck`, `pnpm test` et
`pnpm build` doivent passer.

## Déploiement

Push sur `main` → GitHub Actions (`.github/workflows/deploy.yml`) :
1. Build image Docker (pnpm build → standalone → node:22-alpine) → push `ghcr.io/nicolasmarcinkowski/skull-king-scoring:latest`
2. SSH sur le NAS → `docker compose pull && up -d` dans `/volume1/docker/skull-king-scoring/`
3. Site exposé sur le port **3011** du NAS (mapping `3011:3000`)

Voir la skill `deploy` pour le diagnostic.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
