'use client';

import { useEffect, useState } from 'react';
import Layout from './components/Layout.jsx';
import { Modal, signed } from './components/ui.jsx';
import Home, { History } from './screens/Home.jsx';
import Setup from './screens/Setup.jsx';
import Round from './screens/Round.jsx';
import ScoreSheet from './screens/ScoreSheet.jsx';
import Finish from './screens/Finish.jsx';
import { useJournal } from './hooks/useJournal.js';
import { selectedGame, selectedRound } from './domain/gameState.js';
import { cardsForRound, expectedTricks, isComplete, score, validateRound } from './domain/scoring.js';

export default function App() {
  const { state, dispatch, saved, ready } = useJournal();
  const [modal, setModal] = useState(null);
  const [notification, setNotification] = useState('');
  const game = selectedGame(state), screen = state.view.screen;
  const close = () => setModal(null);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [screen, state.view.roundIndex]);
  useEffect(() => { if (!notification) return; const timer = setTimeout(() => setNotification(''), 2800); return () => clearTimeout(timer); }, [notification]);
  const navigate = next => dispatch({ type: 'NAVIGATE', screen: next });
  const resume = id => dispatch({ type: 'RESUME', id });
  function confirm(title, content, label, action) { setModal({ title, content, label, confirm: () => { close(); action(); } }); }
  function start(players, kraken) { dispatch({ type: 'START', id: crypto.randomUUID(), date: new Date().toISOString(), players, kraken }); }
  function newGame() {
    if (state.games.some(item => !isComplete(item))) confirm('Une partie est en cours', <p>Elle restera dans le journal de bord et pourra être reprise. Préparer un nouvel équipage ?</p>, 'Nouvelle partie', () => navigate('setup'));
    else navigate('setup');
  }
  function reviewSetup() {
    const names = state.draft.map(name => name.trim());
    if (names.some(name => !name)) return dispatch({ type: 'ERROR', message: 'Renseignez le nom de chaque joueur.' });
    if (new Set(names.map(name => name.toLocaleLowerCase('fr'))).size !== names.length) return dispatch({ type: 'ERROR', message: 'Deux joueurs portent le même nom. Ajoutez un complément pour les distinguer.' });
    confirm('Prêts à prendre le large ?', <><p>{names.join(' · ')}</p><p>{names.length} joueurs · 10 manches · Score classique<br />Bonus manuels par paliers de 5.<br />Kraken : {state.draftKraken ? 'activé' : 'désactivé'}.{names.length === 8 && <><br />8 cartes aux manches 9 et 10.</>}</p></>, 'Commencer la partie', () => start(names, !!state.draftKraken));
  }
  function reviewScores() {
    const round = selectedRound(state), cards = cardsForRound(game.players.length, state.view.roundIndex + 1), errors = validateRound(round, cards, game.players.length, !!game.kraken);
    if (errors.length) return dispatch({ type: 'ERROR', message: errors.join(' ') });
    const content = <>{game.players.map((name, player) => {
      const total = score(round.bids[player], round.wins[player], round.bonuses[player], cards).total;
      const previous = game.rounds[state.view.roundIndex];
      const old = previous.validated ? score(previous.bids[player], previous.wins[player], previous.bonuses[player], cards).total : null;
      return <div className="rule-line" key={player}><span>{name}</span><strong>{old !== null ? `${signed(old)} → ` : ''}{signed(total)} pts</strong></div>;
    })}{game.kraken && <p>Kraken : {round.destroyed ? '1 pli détruit' : 'aucun pli détruit'} · Total des plis attendus : {expectedTricks(round, cards, true)}.</p>}<p>Ces points seront intégrés au classement.</p></>;
    confirm(state.edit ? 'Confirmer la correction' : `Valider la manche ${state.view.roundIndex + 1}`, content, state.edit ? 'Enregistrer la correction' : 'Valider les scores', () => { dispatch({ type: 'COMMIT' }); setNotification(state.edit ? 'Correction enregistrée' : 'Manche validée · Scores enregistrés'); });
  }
  function showRules() { confirm('Le code des mers', <><p>Annonce positive exacte : <strong>+20 points par pli</strong>.<br />Annonce positive manquée : <strong>−10 points par pli d’écart</strong>.</p><p>Zéro annoncé : <strong>+10 points par carte</strong> si aucun pli n’est remporté ; sinon <strong>−10 points par carte</strong>.</p><p>Saisissez les bonus par paliers de 5. Ils sont accordés uniquement si l’annonce est exacte. Le groupe vérifie leur montant autour de la table.</p><p>Avec le Kraken activé, déclarez Oui lorsqu’un pli est détruit. Le total attendu diminue de 1 ; les points restent basés sur les cartes distribuées.</p><p>À 8 joueurs, les deux dernières manches se jouent avec 8 cartes.</p></>, 'Compris', () => {}); }
  const enableKraken = () => confirm('Activer le Kraken ?', <p>Vous pourrez déclarer un pli détruit dans chaque manche, y compris en corrigeant une manche précédente. Les scores déjà enregistrés restent identiques.</p>, 'Activer le Kraken', () => dispatch({ type: 'ENABLE_KRAKEN' }));
  const rematch = () => confirm('Repartir avec le même équipage ?', <><p>{game.players.join(' · ')}</p><p>Une nouvelle partie commencera à zéro. Le résultat précédent reste dans le journal.<br />Kraken : {game.kraken ? 'activé' : 'désactivé'}.</p></>, 'Commencer la revanche', () => start([...game.players], !!game.kraken));

  if (!ready) return <main className="shell"><div className="page-title" role="status"><span className="eyebrow">Skull King</span><h1>Le journal des mers</h1><p className="intro">Ouverture de votre journal…</p></div></main>;

  let page;
  switch (screen) {
    case 'setup': page = <Setup state={state} dispatch={dispatch} navigate={navigate} review={reviewSetup} />; break;
    case 'history': page = <History games={state.games} resume={resume} />; break;
    case 'round': page = <Round state={state} game={game} dispatch={dispatch} navigate={navigate} reviewScores={reviewScores} enableKraken={enableKraken} />; break;
    case 'sheet': page = <ScoreSheet game={game} dispatch={dispatch} resume={resume} />; break;
    case 'finish': page = <Finish game={game} navigate={navigate} rematch={rematch} newGame={newGame} />; break;
    default: page = <Home state={state} resume={resume} newGame={newGame} showRules={showRules} />;
  }
  return <Layout screen={screen} saved={saved} navigate={navigate} showRules={showRules}>{page}<Modal modal={modal} onClose={close} /><div id="toast" className={notification ? 'show' : ''} role="status" aria-live="polite">{notification}</div></Layout>;
}
