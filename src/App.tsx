'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Layout from './components/Layout.tsx';
import { Modal, PirateIcon, scoreClass, signed, type ModalData } from './components/ui.tsx';
import { pirateQuip } from './components/pirateQuip.ts';
import Home, { History } from './screens/Home.tsx';
import Setup from './screens/Setup.tsx';
import Round from './screens/Round.tsx';
import ScoreSheet from './screens/ScoreSheet.tsx';
import Finish from './screens/Finish.tsx';
import { useJournal } from './hooks/useJournal.ts';
import { selectedGame, selectedRound } from './domain/gameState.ts';
import { cardsForRound, isComplete, ranking, score, validateRound } from './domain/scoring.ts';
import type { Screen } from './domain/types.ts';

export default function App() {
  const { state, dispatch, saved, ready } = useJournal();
  const [modal, setModal] = useState<ModalData | null>(null);
  const [notification, setNotification] = useState('');
  const previousQuip = useRef('');
  const game = selectedGame(state), screen = state.view.screen;
  const phase = screen === 'round' ? selectedRound(state)?.phase : null;
  const close = () => setModal(null);
  useEffect(() => {
    if (screen === 'round') {
      document.getElementById('round-heading')?.scrollIntoView({ block: 'start', behavior: 'instant' });
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [screen, state.view.roundIndex, state.view.gameId, phase, ready]);
  useEffect(() => { if (!notification) return; const timer = setTimeout(() => setNotification(''), 2800); return () => clearTimeout(timer); }, [notification]);
  const navigate = (next: Screen) => dispatch({ type: 'NAVIGATE', screen: next });
  const resume = (id: string) => dispatch({ type: 'RESUME', id });
  const rankingGame = game ?? state.games[0];
  function showRanking() {
    if (!rankingGame) return;
    if (!game) resume(rankingGame.id);
    navigate('sheet');
  }
  function confirm(title: string, content: ReactNode, label: string, action: () => void) { setModal({ title, content, label, confirm: () => { close(); action(); } }); }
  function start(players: string[]) { dispatch({ type: 'START', id: crypto.randomUUID(), date: new Date().toISOString(), players }); }
  function newGame() {
    if (state.games.some(item => !isComplete(item))) confirm('Une partie est en cours', <p>Elle restera dans le journal de bord et pourra être reprise. Préparer un nouvel équipage ?</p>, 'Nouvelle partie', () => navigate('setup'));
    else navigate('setup');
  }
  function reviewSetup() {
    const names = state.draft.map(name => name.trim());
    if (names.some(name => !name)) return dispatch({ type: 'ERROR', message: 'Renseignez le nom de chaque joueur.' });
    if (new Set(names.map(name => name.toLocaleLowerCase('fr'))).size !== names.length) return dispatch({ type: 'ERROR', message: 'Deux joueurs portent le même nom. Ajoutez un complément pour les distinguer.' });
    confirm('Prêts à prendre le large ?', <><p>{names.join(' · ')}</p><p>{names.length} joueurs · 10 manches · Score classique{names.length === 8 && <><br />8 cartes aux manches 9 et 10.</>}</p></>, 'Commencer la partie', () => start(names));
  }
  function reviewScores() {
    const round = selectedRound(state);
    if (!round || !game) return;
    const cards = cardsForRound(game.players.length, state.view.roundIndex + 1), errors = validateRound(round, cards, game.players.length, !!game.kraken);
    if (errors.length) return dispatch({ type: 'ERROR', message: errors.join(' ') });
    const projected = { ...game, rounds: game.rounds.map((item, index) => index === state.view.roundIndex ? { ...round, validated: true } : item) };
    const quip = pirateQuip(ranking(projected), previousQuip.current);
    previousQuip.current = quip;
    const content = <><p className="pirate-quip"><PirateIcon /><span>{quip.replace(/[.!?]+$/, '')} !!!</span></p>{game.players.map((name, player) => {
      const total = score(round.bids[player], round.wins[player], round.bonuses[player], cards).total;
      const previous = game.rounds[state.view.roundIndex];
      const old = previous.validated ? score(previous.bids[player], previous.wins[player], previous.bonuses[player], cards).total : null;
      return <div className="rule-line" key={player}><span>{name}</span><strong>{old !== null && <><span className={scoreClass(old)}>{signed(old)}</span> → </>}<span className={scoreClass(total)}>{signed(total)} pts</span></strong></div>;
    })}{game.kraken && <p>Kraken : {round.destroyed ? 'présent' : 'absent'}.</p>}</>;
    confirm(state.edit ? 'Confirmer la correction' : `Valider la manche ${state.view.roundIndex + 1}`, content, state.edit ? 'Enregistrer la correction' : 'Valider les scores', () => { dispatch({ type: 'COMMIT' }); setNotification(state.edit ? 'Correction enregistrée' : 'Manche validée · Scores enregistrés'); });
  }
  function showRules() { confirm('Le code des mers', <><p>Annonce positive exacte : <strong>+20 points par pli</strong>.<br />Annonce positive manquée : <strong>−10 points par pli d’écart</strong>.</p><p>Zéro annoncé : <strong>+10 points par carte</strong> si aucun pli n’est remporté ; sinon <strong>−10 points par carte</strong>.</p><p>Saisissez les bonus par paliers de 5. Ils sont accordés uniquement si l’annonce est exacte. Le groupe vérifie leur montant autour de la table.</p><p>Lorsqu’un pli est détruit, indiquez Kraken présent. Le total attendu diminue de 1 ; les points restent basés sur les cartes distribuées.</p><p>À 8 joueurs, les deux dernières manches se jouent avec 8 cartes.</p></>, 'Compris', () => {}); }
  const enableKraken = () => confirm('Activer le Kraken ?', <p>Vous pourrez déclarer un pli détruit dans chaque manche, y compris en corrigeant une manche précédente. Les scores déjà enregistrés restent identiques.</p>, 'Activer le Kraken', () => dispatch({ type: 'ENABLE_KRAKEN' }));
  const rematch = () => { if (game) confirm('Repartir avec le même équipage ?', <><p>{game.players.join(' · ')}</p><p>Une nouvelle partie commencera à zéro. Le résultat précédent reste dans le journal.<br />Kraken activé.</p></>, 'Commencer la revanche', () => start([...game.players])); };

  if (!ready) return <main className="shell"><div className="page-title" role="status"><span className="eyebrow">Skull King</span><h1>Le journal des mers</h1><p className="intro">Ouverture de votre journal…</p></div></main>;

  let page: ReactNode;
  switch (screen) {
    case 'setup': page = <Setup state={state} dispatch={dispatch} navigate={navigate} review={reviewSetup} />; break;
    case 'history': page = <History games={state.games} resume={resume} />; break;
    case 'round': page = game ? <Round state={state} game={game} dispatch={dispatch} navigate={navigate} reviewScores={reviewScores} enableKraken={enableKraken} /> : null; break;
    case 'sheet': page = game ? <ScoreSheet game={game} dispatch={dispatch} resume={resume} /> : null; break;
    case 'finish': page = game ? <Finish game={game} navigate={navigate} rematch={rematch} newGame={newGame} /> : null; break;
    default: page = <Home state={state} resume={resume} newGame={newGame} showRules={showRules} showHistory={() => navigate('history')} />;
  }
  return <Layout screen={screen} saved={saved} navigate={navigate} showRules={showRules} showRanking={showRanking} rankingAvailable={!!rankingGame}>{page}<Modal modal={modal} onClose={close} /><div id="toast" className={notification ? 'show' : ''} role="status" aria-live="polite">{notification}</div></Layout>;
}
