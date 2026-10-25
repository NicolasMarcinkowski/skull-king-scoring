import { isComplete } from '../domain/scoring.ts';
import { Button, Crown, ErrorMessage, RulePanel } from '../components/ui.tsx';
import type { Game, State } from '../domain/types.ts';

type SessionListProps = { games: Game[]; resume: (id: string) => void };
type HomeProps = { state: State; resume: (id: string) => void; newGame: () => void; showRules: () => void; showHistory: () => void };

export function SessionList({ games, resume }: SessionListProps) {
  if (!games.length) return <div className="empty"><Crown /><h3>Votre histoire commence ici</h3><p>Aucune partie au journal de bord.<br />Rassemblez votre équipage et prenez le large.</p></div>;
  return games.map(game => <div className="session" key={game.id}><div className="icon-box">{isComplete(game) ? '♔' : '⚑'}</div><div className="session-info"><strong>{game.players.join(' · ')}</strong><small>{new Date(game.date).toLocaleDateString('fr-FR')} · {game.players.length} joueurs · {isComplete(game) ? 'Terminée' : `${game.rounds.filter(round => round.validated).length}/10 manches validées`}</small></div><Button variant="secondary" onClick={() => resume(game.id)}>{isComplete(game) ? 'Voir le bilan →' : 'Reprendre →'}</Button></div>);
}
export default function Home({ state, resume, newGame, showRules, showHistory }: HomeProps) {
  const active = state.games.find(game => !isComplete(game));
  return <><section className="hero"><div className="shell"><div className="hero-content"><div className="eyebrow">Chaque pli écrit votre légende</div><h1>Les mers se gagnent.<br /><span>Les points se comptent.</span></h1><p>Rassemblez votre équipage. Annoncez vos plis.<br />Votre journal de bord garde le cap, jusqu’au dernier point.</p><div className="hero-actions"><Button variant="primary" onClick={active ? () => resume(active.id) : newGame}>{active ? 'Reprendre la partie →' : '＋ Nouvelle partie'}</Button><Button variant="secondary" onClick={active ? newGame : showRules}>{active ? 'Nouvelle partie' : 'Les règles de comptage'}</Button></div><div className="features"><span>2 à 8 joueurs</span><span>10 manches</span><span>Sauvegarde automatique</span></div></div></div></section><main className="shell"><div className="section-head"><div><h2>Votre journal de bord</h2><p className="muted">Les équipages passent. Les scores restent.</p></div><Button variant="secondary" onClick={showHistory}>Journal de bord</Button></div><ErrorMessage message={state.error} /><div className="grid"><section className="panel"><div className="panel-title"><h3>Dernières traversées</h3><span className="muted">{String(state.games.length).padStart(2, '0')}</span></div><SessionList games={state.games.slice(0, 4)} resume={resume} /></section><RulePanel /></div></main></>;
}
export function History({ games, resume }: SessionListProps) { return <main className="shell"><div className="page-title"><span className="eyebrow">Les traces de votre équipage</span><h1>Journal de bord</h1><p className="intro">Vos parties sont conservées dans ce navigateur, sur cet appareil.</p></div><div className="panel"><SessionList games={games} resume={resume} /></div></main>; }
