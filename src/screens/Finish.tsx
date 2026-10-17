import { ranking } from '../domain/scoring.ts';
import { Button, Crown, Ranking, signed } from '../components/ui.tsx';
import type { Game, Screen } from '../domain/types.ts';

type FinishProps = {
  game: Game;
  rematch: () => void;
  newGame: () => void;
  navigate: (screen: Screen) => void;
};

export default function Finish({ game, rematch, newGame, navigate }: FinishProps) {
  const rows = ranking(game), winners = rows.filter(row => row.rank === 1);
  return <main className="shell"><div className="page-title"><span className="eyebrow">Dix manches · Une légende</span></div><section className="victory"><Crown /><div className="eyebrow">{winners.length > 1 ? 'Capitaines ex æquo' : 'Capitaine des Sept Mers'}</div><h1>{winners.map(row => row.name).join(' & ')}</h1><h2>{signed(winners[0].total)} points</h2><p>La traversée s’achève. Votre équipage entre dans la légende.</p></section><div className="grid"><section className="panel"><h3>Classement final</h3><Ranking game={game} /></section><section className="panel"><h3>Une nouvelle traversée ?</h3><p className="intro">Même équipage, nouveaux horizons. Les scores repartent de zéro.</p><Button variant="primary" onClick={rematch}>Rejouer avec ces joueurs →</Button><div className="form-actions"><Button onClick={() => navigate('sheet')}>Feuille de score</Button><Button onClick={newGame}>Nouvelle partie</Button></div></section></div></main>;
}
