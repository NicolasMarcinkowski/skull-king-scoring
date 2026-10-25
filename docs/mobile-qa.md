# Vérification responsive

L'interface compacte s'applique jusqu'à 960 px (téléphone en portrait ou paysage,
petite tablette). Au-delà, la feuille de score reste un tableau ; sur téléphone,
elle présente les mêmes données dans des manches dépliables.

## Contrôles automatisés effectués

Vérification avec Playwright et Microsoft Edge en mode headless, sur le serveur
`pnpm dev`. Playwright n'est pas ajouté aux dépendances du projet.

| Format CSS | Usage simulé |
| --- | --- |
| 320 × 568 | Petit téléphone |
| 360 × 740 | Téléphone |
| 390 × 844 | Téléphone |
| 430 × 932 | Grand téléphone |
| 768 × 1024 | Tablette portrait |
| 844 × 390 | Téléphone paysage |
| 1024 × 768 | Tablette / petit ordinateur |
| 1280 × 800 | Ordinateur |

Pour chaque format : accueil, préparation, annonces, résultats, feuille de score,
journal et bilan final, avec huit joueurs et des noms longs (dont un sans espaces).

- Pas de débordement horizontal de la page.
- Les débordements volontaires restent confinés à la liste des dix manches et,
  sur ordinateur, au tableau des scores.
- Les boutons, champs et résumés dépliables mesurent au moins 44 × 44 px sur
  les formats compacts.
- La bonne présentation des scores est visible, sans double présentation
  accessible simultanément.
- Les confirmations restent dans la fenêtre, y compris en paysage ;
  leur contenu long défile verticalement.
- Aucune erreur JavaScript de page détectée.

Parcours tactile vérifié à 320 et 390 px :

1. Nouvelle partie, saisie des noms et Entrée pour passer au nom suivant.
2. Suppression et déplacement d'un joueur.
3. Confirmation de l'équipage et des annonces.
4. Ouverture des résultats au titre de la manche, sans ouverture forcée du clavier.
5. Boutons +/− des plis, ajout d'un bonus et déclaration du Kraken.
6. Validation : le score affiché est celui enregistré.
7. Consultation d'une manche dans la feuille de score mobile et correction du bonus.
8. Confirmation de la correction et rechargement : les valeurs sont conservées.
9. Passage par le journal et reprise de la manche en cours.

### Résultats compacts

La carte standard reste compacte sur téléphone (sans avertissement ni nom sur
plusieurs lignes). Les bonus et plis sont côte à côte ; l'aperçu des points reste
visible en tête. Le récapitulatif est juste sous les onglets, avec le total
des plis remportés face aux plis disponibles (Kraken inclus), et le ratio remportés / annoncés
de chacun : vert si exact, rouge sinon. Il n'y a plus de bouton « ⋯ ».

Vérifié de 320 à 1280 px : cibles tactiles de 44 px minimum,
alerte de bonus non accordés, validation, correction des annonces, annulation et
noms longs sans débordement horizontal.

### Retours de table

- Préparation : nom, déplacement, suppression et ajout sur la même ligne.
- Plis annoncés : nom et saisie sur la même ligne, libellé conservé pour les
  lecteurs d'écran uniquement.
- Résultats : bonus à gauche, plis à droite ; Kraken compact présent / absent.
- Confirmation : couleurs des scores et phrase pirate tirée du classement
  provisoire, sans répétition immédiate. Une correction remplace les points de
  la manche dans ce classement ; elle ne les ajoute pas deux fois.
- La phrase pirate est en tête de confirmation, avec un pavillon, en italique.
- Le total et la barre de progression réagissent à chaque saisie de plis remportés :
  par exemple 3/3 → 2/3 lorsqu'on retire un pli. Changer un bonus ne change pas ce total.
- Le « ? » est face au logo. Accueil et Classement restent fixés au bas de l'écran ;
  les derniers contrôles et la notification doivent rester au-dessus de cette barre.
- Classement ouvre la feuille de score de la partie sélectionnée, ou de la plus
  récente si aucune n'est sélectionnée ; le bouton est désactivé sans partie.
  Le journal complet est accessible depuis l'accueil.
- Le bouton Feuille de score est en fin de page, après le classement.
- Feuille de score : classement, puis détail des manches validées et en cours
  uniquement, sur mobile comme sur ordinateur.
- Classement : pavillon pirate pour les premiers ex æquo, rangs numériques
  pour les autres ; scores positifs verts, négatifs rouges, zéro neutre.

Tests des phrases, en complément de `pnpm test` :
`node --experimental-strip-types --test src/components/pirateQuip.test.ts`.

## À vérifier sur un vrai téléphone avant publication

L'émulation ne remplace pas Safari iOS ou Chrome Android sur appareil réel :

- Le clavier virtuel ne doit pas masquer durablement le champ actif.
- Le bouton « suivant » du clavier conserve le parcours entre les noms.
- Le focus d'un champ ne doit pas déclencher de zoom automatique ; le zoom
  manuel par pincement reste autorisé.
- Les encoches, la barre d'accueil et les barres variables du navigateur
  ne recouvrent pas les contrôles (marges `safe-area-inset-*` et hauteur `dvh`).
- Après rotation de l'appareil, les saisies et la manche affichée restent intactes.
- Les détails et confirmations restent utilisables avec VoiceOver / TalkBack.

Vérifications de code : `pnpm typecheck`, `pnpm test`, `pnpm build`.
