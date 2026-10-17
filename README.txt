SKULL KING — LE JOURNAL DES MERS
Projet React + Next.js (App Router)

PRÉREQUIS
Node.js 22.12 ou version supérieure compatible.
pnpm 11.25.0 (version indiquée dans package.json).

DÉMARRER LE PROJET
Depuis le dossier contenant package.json :
  pnpm install --frozen-lockfile
  pnpm dev
Ouvrir http://127.0.0.1:3000 (ou l'adresse indiquée par Next.js).

VÉRIFICATIONS ET COMPILATION
  pnpm test
  pnpm build
  pnpm preview
Le dossier out produit par next build peut être hébergé sur un serveur statique.
Après la compilation, npm start ou npm run preview sert cet export sur le port 3000.
next.config.mjs active output: 'export'. Le site utilise le stockage du navigateur,
sans besoin de serveur de données. Pour un sous-répertoire, configurer basePath
dans Next.js puis recompiler ; l'export par défaut est prévu à la racine du domaine.

ÉTAT DE VÉRIFICATION À LA LIVRAISON
Installation des dépendances réussie avec pnpm.
Compilation de production Next.js réussie : Next.js 16.4.2, React 19.3.1.
Les 13 tests métier et de gestion d'état passent avec node --test.
pnpm-lock.yaml verrouille les versions pour une installation reproductible.
Les contrôles visuels de la version Next.js restent à effectuer dans le navigateur.
L'aperçu historique sur le port 4173 utilise encore la version JavaScript.

ORGANISATION
src/app/layout.jsx : document, métadonnées et styles globaux Next.js.
src/app/page.jsx : route principale de l'App Router.
next.config.mjs : export statique et mode strict React.
scripts/serve-export.mjs : aperçu local du site compilé, sans dépendance supplémentaire.
src/App.jsx : parcours, confirmations et notifications.
src/screens/ : accueil, journal, création, manche, scores et bilan final.
src/components/ : commandes réutilisables, mise en page, dialogue et classement.
src/domain/scoring.js : règles de score et contrôles, sans dépendance à React.
src/domain/gameState.js : réducteur immuable et reprise des anciennes sauvegardes.
src/domain/*.test.js : tests exécutables avec Node.js.
src/hooks/useJournal.js : lecture après hydratation et sauvegarde locale.
Le premier rendu serveur et navigateur est identique ; la sauvegarde n'est jamais
écrasée par l'état vide du rendu serveur.
src/styles/ : style nordique responsive.
public/fjord.svg : illustration originale.

FONCTIONNALITÉS CONSERVÉES
2 à 8 joueurs humains, 10 manches, score classique.
Plis annoncés et remportés initialisés à zéro, commandes −/+ et saisie directe.
Bonus individuels par paliers de 5, accordés uniquement si l'annonce est exacte.
Kraken systématique pour les nouvelles parties, déclaration d'un pli détruit,
contrôle du total réduit de 1. Les anciennes parties conservent leurs règles.
Huit cartes aux deux dernières manches à huit joueurs.
Classement, feuille de score, corrections, revanche et journal des parties.
Annonces et Résultats & bonus sont désormais de vrais onglets cliquables.
Changer d'onglet conserve les saisies et contrôle les annonces avant les résultats.
Les anciennes parties sont reprises avec la clé localStorage existante.
Les modifications d'une correction restent isolées jusqu'à confirmation.

SAUVEGARDES
La clé est skullking-journal-v1, comme dans la version JavaScript.
Les sauvegardes dépendent de l'origine : protocole + domaine + port.
Pour retrouver les parties du serveur local précédent, servir le nouvel export out
sur http://127.0.0.1:4173, dans le même navigateur, une fois le serveur précédent arrêté.
Next.js dev utilise normalement le port 3000 et affichera donc un journal séparé.
Effacer les données du navigateur efface aussi les parties de cette origine.
Il n'y a ni serveur de données ni synchronisation entre appareils.

DESIGN
Direction nordique originale : fjord, bleu nuit, acier et bronze.
Le lien Figma fourni nécessitait une connexion ; la conformité aux maquettes reste
à vérifier. Les polices Google sont facultatives, avec remplacement local prévu.

RÈGLES DE RÉFÉRENCE
https://www.fetedujeu.org/wp-content/uploads/2024/09/regles-skull-king.pdf
