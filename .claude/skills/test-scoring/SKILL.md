---
name: test-scoring
description: Vérifier les règles de score Skull King (annonces, plis, bonus, Kraken) et leurs tests
---

# Test Scoring

Référence des règles métier Skull King et procédure de vérification.
Source de vérité : `src/domain/scoring.js` + `regles-participants-et-plis.txt`.

## Règles de Score

### Cartes distribuées (`cardsForRound`)
- Manche N → N cartes par joueur
- Exception : à 8 joueurs, plafonné à 8 cartes (manches 9 et 10 → 8 cartes)

### Calcul du score (`score`)
| Cas | Points de base |
|-----|----------------|
| Annonce 0 exacte | `+10 × cartes` |
| Annonce 0 ratée | `−10 × cartes` |
| Annonce N > 0 exacte | `N × 20` |
| Annonce N > 0 ratée | `−10 × |annonce − plis|` |

### Bonus
- Paliers de 5 uniquement (0, 5, 10, ...)
- Accordés **uniquement si l'annonce est exacte** (sinon ignorés, pas de malus)

### Kraken (`expectedTricks`, `validateRound`)
- Si activé et un pli déclaré détruit : total attendu = cartes − 1
- Le nombre de cartes distribuées reste la référence du calcul des points
  (une annonce 0 réussie avec 5 cartes rapporte 50 pts même avec Kraken)
- Déclarer un pli détruit sans Kraken activé = erreur de validation

### Validation d'une manche
- Annonces : entiers entre 0 et cartes (somme libre)
- Plis remportés : entiers entre 0 et cartes
- Somme des plis remportés = total attendu (cartes, ou cartes − 1 si pli détruit)

## Cas de Validation de Référence

| Joueurs | Cartes | Kraken/détruit | Plis | Valide ? |
|---------|--------|----------------|------|----------|
| 2 | 5 | non | 2 + 3 | ✅ |
| 2 | 5 | oui | 2 + 2 | ✅ |
| 2 | 5 | non | 2 + 2 | ❌ |
| 2 | 1 | oui | 0 + 0 | ✅ |

## Procédure de Vérification

```bash
pnpm test                                  # tous les tests
node --test src/domain/scoring.test.js     # scoring seul
node --test src/domain/gameState.test.js   # état de jeu seul
```

Après toute modification de `scoring.js` ou `gameState.js` :
1. Ajouter/adapter les tests couvrant le changement
2. Vérifier que les cas de référence ci-dessus passent toujours
3. Vérifier la rétrocompatibilité des anciennes sauvegardes
   (les anciennes parties conservent leurs règles, ex. Kraken optionnel)
