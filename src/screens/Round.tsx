import type { Dispatch } from 'react';
import PlayerRoundCard from '../components/PlayerRoundCard.tsx';
import { cardsForRound, currentRound, expectedTricks, score, totals } from '../domain/scoring.ts';
import { selectedRound } from '../domain/gameState.ts';
import { Button, ErrorMessage, GameTitle, Ranking } from '../components/ui.tsx';
import type { Action, Game, NumberField, Phase, Screen, State } from '../domain/types.ts';

type RoundProps = {
  state: State;
  game: Game;
  dispatch: Dispatch<Action>;
  navigate: (screen: Screen) => void;
  reviewScores: () => void;
  enableKraken: () => void;
};

function StageTabs({ phase, onChange }: { phase: Phase; onChange: (phase: Phase) => void }) {
  const stages: [Phase, string][] = [['bids', '01 · Annonces'], ['results', '02 · Résultats & bonus']];
  return <div className="steps" role="tablist" aria-label="Étapes de la manche">{stages.map(([value, label], index) => <button key={value} role="tab" id={`tab-${value}`} aria-selected={phase === value} aria-controls="round-panel" className={phase === value ? 'current' : ''} tabIndex={phase === value ? 0 : -1} onClick={() => onChange(value)} onKeyDown={event => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - index; onChange(stages[next][0]); document.getElementById(`tab-${stages[next][0]}`)?.focus(); } }}>{label}</button>)}</div>;
}

export default function Round({ state, game, dispatch, navigate, reviewScores, enableKraken }: RoundProps) {
  const round = selectedRound(state);
  if (!round) return null;
  const index = state.view.roundIndex, cards = cardsForRound(game.players.length, index + 1), results = round.phase === 'results', expected = expectedTricks(round, cards, !!game.kraken), sum = round.wins.reduce((total, value) => total + value, 0), running = totals(game);
  const setStage = (phase: Phase) => dispatch({ type: 'STAGE', phase });
  const setNumber = (field: NumberField, player: number, value: number) => dispatch({ type: 'SET_NUMBER', field, index: player, value });
  return <main className="shell"><GameTitle game={game} subtitle={`${cards} carte${cards > 1 ? 's' : ''} par joueur · ${state.edit ? 'Les modifications restent provisoires jusqu’à confirmation.' : results ? 'Les plis remportés sont à 0 par défaut. Saisissez uniquement les autres valeurs.' : 'Les annonces sont à 0 par défaut. Saisissez uniquement les autres valeurs.'}`}>{state.edit ? 'Corriger la manche ' : 'Manche '}{index + 1}</GameTitle><div className="round-strip" aria-label="Les dix manches">{game.rounds.map((item, i) => <button key={i} className={`round-chip ${item.validated ? 'done' : ''} ${i === index ? 'current' : ''}`} aria-label={`Manche ${i + 1}${item.validated ? ', validée' : ''}`} disabled={!item.validated && i !== currentRound(game)} onClick={() => dispatch({ type: 'OPEN_ROUND', index: i })}>{item.validated ? '✓ ' : ''}{i + 1}</button>)}</div><div className="section-head"><StageTabs phase={round.phase} onChange={setStage} /><Button variant="secondary" onClick={() => navigate('sheet')}>Feuille de score</Button></div><div className="round-layout"><section id="round-panel" role="tabpanel" aria-labelledby={`tab-${round.phase}`}>
    {game.players.map((name, player) => {
      const ready = Number.isInteger(round.bids[player]) && Number.isInteger(round.wins[player]);
      const points = ready ? score(round.bids[player], round.wins[player], round.bonuses[player], cards) : null;
      return <PlayerRoundCard key={`${index}-${player}-${round.phase}`} name={name} player={player} round={round} cards={cards} total={running[player]} points={points} editing={!!state.edit} onChange={setNumber} />;
    })}
    {game.kraken && results && <article className="player-card kraken-card"><h3>Le Kraken</h3><p className="intro">Pli détruit par le Kraken</p><div className="kraken-choices" role="group" aria-label="Pli détruit par le Kraken">{[false, true].map(value => <Button key={String(value)} variant={!!round.destroyed === value ? 'primary' : 'secondary'} aria-pressed={!!round.destroyed === value} onClick={() => dispatch({ type: 'DESTROYED', value })}>{value ? 'Oui' : 'Non'}</Button>)}</div><p className="footnote">{round.destroyed ? `Un pli sans gagnant : ${expected} pli${expected > 1 ? 's' : ''} à répartir.` : 'Tous les plis doivent être remportés.'} Le calcul des points reste basé sur les {cards} carte{cards > 1 ? 's' : ''} distribuée{cards > 1 ? 's' : ''}.</p></article>}
    <ErrorMessage message={state.error} /><div className="form-actions"><Button onClick={() => state.edit ? dispatch({ type: 'CANCEL_EDIT' }) : results ? setStage('bids') : navigate('home')}>{state.edit ? 'Annuler la correction' : results ? '← Modifier les annonces' : '← Accueil'}</Button><Button variant="primary" onClick={results ? reviewScores : () => setStage('results')}>{results ? state.edit ? 'Vérifier les modifications →' : 'Valider la manche →' : 'Confirmer les annonces →'}</Button></div></section><aside><section className="panel"><div className="panel-title"><h3>Le classement</h3></div><Ranking game={game} /><p className="footnote">Cumul des manches validées uniquement.</p></section><div className="summary">{results ? <><strong>{sum} / {expected} plis remportés</strong><br />{round.destroyed && game.kraken ? 'Un pli est détruit par le Kraken. ' : ''}Le total attendu est de {expected} pli{expected > 1 ? 's' : ''}.</> : <><strong>Les annonces sont libres.</strong><br />Leur somme peut être différente du nombre de plis.</>}</div><div className="summary">Bonus saisis par paliers de 5.<br />Ils sont accordés uniquement si l’annonce est exacte.</div>{!game.kraken && <div className="summary">Vous jouez avec le Kraken ?<br /><Button variant="secondary" onClick={enableKraken}>Activer le Kraken</Button></div>}</aside></div></main>;
}
