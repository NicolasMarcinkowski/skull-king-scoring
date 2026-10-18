import type { Dispatch } from 'react';
import { cardsForRound, currentRound, isComplete, score, totals } from '../domain/scoring.ts';
import { Button, GameTitle, Ranking, signed } from '../components/ui.tsx';
import type { Action, Game } from '../domain/types.ts';

type ScoreSheetProps = {
  game: Game;
  dispatch: Dispatch<Action>;
  resume: (id: string) => void;
};

export default function ScoreSheet({ game, dispatch, resume }: ScoreSheetProps) {
  const complete = isComplete(game);
  const current = currentRound(game);
  // Both layouts use the same score data; resizing never changes the rules.
  const rounds = game.rounds.map((round, index) => {
    const cards = cardsForRound(game.players.length, index + 1);
    const available = round.validated || index === current && !complete;
    return {
      round, index, cards, available,
      status: round.validated ? 'Validée' : available ? 'En cours' : 'À venir',
      points: game.players.map((_, player) => round.validated
        ? score(round.bids[player], round.wins[player], round.bonuses[player], cards)
        : null),
    };
  });
  const roundAction = (index: number, validated: boolean) => <Button variant="secondary" aria-label={`${validated ? 'Corriger' : 'Reprendre'} la manche ${index + 1}`} onClick={() => dispatch({ type: 'OPEN_ROUND', index })}>{validated ? 'Corriger' : 'Reprendre'}</Button>;

  return <main className="shell">
    <GameTitle game={game} subtitle="Consultez les manches et corrigez une saisie à tout moment.">La feuille de score</GameTitle>
    <div className="score-mobile">
      <section className="panel" aria-label="Totaux des joueurs"><h2>Totaux</h2><Ranking game={game} /></section>
      <p className="intro">Touchez une manche pour voir les points de chaque joueur.</p>
      {rounds.map(({ round, index, cards, available, status, points }) => <details className="score-round" key={index} open={index === (complete ? 9 : current)}>
        <summary><span>Manche {index + 1}<small>{cards} carte{cards > 1 ? 's' : ''}{game.kraken && round.destroyed ? ' · Kraken : 1 pli détruit' : ''}</small></span><span className="badge">{status}</span></summary>
        <div className="score-round-body">
          {game.players.map((name, player) => {
            const result = points[player];
            return <div className="score-player" key={player}>
              <strong>{name}</strong><strong className={result && result.total < 0 ? 'negative' : 'positive'}>{result ? signed(result.total) : '—'}</strong>
              {result && <small>Annonce {round.bids[player]} · Résultat {round.wins[player]}<br />Bonus saisis {round.bonuses[player]} · accordés {result.bonus}</small>}
            </div>;
          })}
          {available && roundAction(index, round.validated)}
        </div>
      </details>)}
    </div>
    <div className="panel table-wrap score-desktop" tabIndex={0} role="region" aria-label="Scores de toutes les manches">
      <table><thead><tr><th scope="col">Manche</th>{game.players.map((name, i) => <th scope="col" key={i}>{name}</th>)}<th scope="col">Action</th></tr></thead>
        <tbody>{rounds.map(({ round, index, cards, available, status, points }) => <tr key={index}>
          <th scope="row">{index + 1}<small>{cards} cartes · {status}</small>{game.kraken && round.destroyed && <small>Kraken · 1 pli détruit</small>}</th>
          {points.map((result, player) => <td key={player}>{result ? <><strong className={result.total < 0 ? 'negative' : 'positive'}>{signed(result.total)}</strong><small>Annonce {round.bids[player]} · Résultat {round.wins[player]}</small><small>Bonus saisis {round.bonuses[player]} · accordés {result.bonus}</small></> : '—'}</td>)}
          <td>{available && roundAction(index, round.validated)}</td>
        </tr>)}</tbody>
        <tfoot><tr><th scope="row">Total</th>{totals(game).map((total, i) => <td key={i}>{signed(total)}</td>)}<td /></tr></tfoot>
      </table>
    </div>
    <div className="form-actions"><Button variant="primary" onClick={() => resume(game.id)}>{complete ? '← Bilan final' : '← Reprendre la manche'}</Button></div>
  </main>;
}
