import type { Dispatch } from 'react';
import PlayerRoundCard from '../components/PlayerRoundCard.tsx';
import { cardsForRound, currentRound, expectedTricks, score } from '../domain/scoring.ts';
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
  const stages: [Phase, string][] = [['bids', '01 · Plis annoncés'], ['results', '02 · Résultats']];
  return <div className="steps" role="tablist" aria-label="Étapes de la manche">{stages.map(([value, label], index) => <button key={value} role="tab" id={`tab-${value}`} aria-selected={phase === value} aria-controls="round-panel" className={phase === value ? 'current' : ''} tabIndex={phase === value ? 0 : -1} onClick={() => onChange(value)} onKeyDown={event => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - index; onChange(stages[next][0]); document.getElementById(`tab-${stages[next][0]}`)?.focus(); } }}>{label}</button>)}</div>;
}

export default function Round({ state, game, dispatch, navigate, reviewScores, enableKraken }: RoundProps) {
  const round = selectedRound(state);
  if (!round) return null;
  const index = state.view.roundIndex, cards = cardsForRound(game.players.length, index + 1), results = round.phase === 'results', expected = expectedTricks(round, cards, !!game.kraken);
  const wonSum = round.wins.reduce((total, value) => total + value, 0);
  const setStage = (phase: Phase) => dispatch({ type: 'STAGE', phase });
  const setNumber = (field: NumberField, player: number, value: number) => dispatch({ type: 'SET_NUMBER', field, index: player, value });
  return <main className="shell"><GameTitle game={game} id="round-heading">{state.edit ? 'Corriger la manche ' : 'Manche '}{index + 1}</GameTitle><div className="round-strip" aria-label="Les dix manches">{game.rounds.map((item, i) => <button key={i} className={`round-chip ${item.validated ? 'done' : ''} ${i === index ? 'current' : ''}`} aria-label={`Manche ${i + 1}${item.validated ? ', validée' : ''}`} disabled={!item.validated && i !== currentRound(game)} onClick={() => dispatch({ type: 'OPEN_ROUND', index: i })}>{item.validated ? '✓ ' : ''}{i + 1}</button>)}</div><div className="section-head"><StageTabs phase={round.phase} onChange={setStage} /></div><div className="round-layout"><section id="round-panel" role="tabpanel" aria-labelledby={`tab-${round.phase}`}>
    {results && <section className="bid-overview panel" aria-label="Récapitulatif des plis annoncés">
      <div className="panel-title"><h3>Plis annoncés</h3><strong className={wonSum === expected ? 'positive' : 'negative'} aria-label={`Total des plis remportés : ${wonSum} sur ${expected}`}>{wonSum} / {expected}</strong></div>
      <progress max={Math.max(1, expected)} value={Math.min(wonSum, expected)} aria-label={`${wonSum} plis remportés pour ${expected} plis disponibles`} />
      <div className="bid-chips">{game.players.map((name, player) => <div className="bid-chip" key={player}><span>{name}</span><strong className={round.wins[player] === round.bids[player] ? 'positive' : 'negative'} aria-label={`${name} : ${round.wins[player]} plis remportés sur ${round.bids[player]} annoncés`}>{round.wins[player]}/{round.bids[player]}</strong></div>)}</div>
    </section>}
    {game.players.map((name, player) => {
      const ready = Number.isInteger(round.bids[player]) && Number.isInteger(round.wins[player]);
      const points = ready ? score(round.bids[player], round.wins[player], round.bonuses[player], cards) : null;
      return <PlayerRoundCard key={`${index}-${player}-${round.phase}`} name={name} player={player} round={round} cards={cards} points={points} editing={!!state.edit} onChange={setNumber} />;
    })}
    {game.kraken && results && <article className="player-card kraken-card"><h3>Kraken</h3><div className="kraken-choices" role="group" aria-label="Présence du Kraken">{[false, true].map(value => <Button key={String(value)} variant={!!round.destroyed === value ? 'primary' : 'secondary'} aria-pressed={!!round.destroyed === value} onClick={() => dispatch({ type: 'DESTROYED', value })}>{value ? 'Présent' : 'Absent'}</Button>)}</div></article>}
    <ErrorMessage message={state.error} /><div className="form-actions"><Button onClick={() => state.edit ? dispatch({ type: 'CANCEL_EDIT' }) : results ? setStage('bids') : navigate('home')}>{state.edit ? 'Annuler la correction' : results ? '← Modifier les annonces' : '← Accueil'}</Button><Button variant="primary" onClick={results ? reviewScores : () => setStage('results')}>{results ? state.edit ? 'Vérifier les modifications →' : 'Valider la manche →' : 'Confirmer les annonces →'}</Button></div></section><aside><section className="panel"><div className="panel-title"><h3>Le classement</h3></div><Ranking game={game} /></section>{!game.kraken && <div className="summary">Vous jouez avec le Kraken ?<br /><Button variant="secondary" onClick={enableKraken}>Activer le Kraken</Button></div>}</aside></div><div className="form-actions sheet-action"><Button variant="secondary" onClick={() => navigate('sheet')}>Feuille de score</Button></div></main>;
}
