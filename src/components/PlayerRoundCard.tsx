import { BonusStepper, NumberStepper, scoreClass, signed } from './ui.tsx';
import type { NumberField, Round, RoundScore } from '../domain/types.ts';

type PlayerRoundCardProps = {
  name: string;
  player: number;
  round: Round;
  cards: number;
  points: RoundScore | null;
  editing: boolean;
  onChange: (field: NumberField, player: number, value: number) => void;
};

export default function PlayerRoundCard({ name, player, round, cards, points, editing, onChange }: PlayerRoundCardProps) {
  const results = round.phase === 'results';

  return <article className={`player-card ${results ? 'results-player-card' : 'bids-player-card'}`}>
    <div className="player-card-head">
      <span className="avatar">{name.slice(0, 1).toUpperCase()}</span>
      <div className="player-identity">
        <strong>{name}</strong>
      </div>
      {results && <>
        <strong className={`round-score ${points ? scoreClass(points.total) : 'neutral'}`} aria-label={`Aperçu des points de manche de ${name} : ${points ? signed(points.total) : 'indisponible'}`}>
          {points ? signed(points.total) : '—'} <small>pts</small>
        </strong>
      </>}
    </div>
    <div className="player-inputs">
      {(!results || editing) && <NumberStepper id={`bid-${player}`} label="Plis annoncés" hideLabel={!results} name={name} value={round.bids[player]} max={cards} onChange={value => onChange('bids', player, value)} />}
      {results && <>
        <BonusStepper name={name} value={round.bonuses[player]} onChange={value => onChange('bonuses', player, value)} />
        <NumberStepper id={`win-${player}`} label="Plis remportés" name={name} value={round.wins[player]} max={cards} onChange={value => onChange('wins', player, value)} />
      </>}
    </div>
    {results && <>
      {points && !points.exact && round.bonuses[player] > 0 && <p className="bonus-note">Bonus non accordés : annonce incorrecte</p>}
    </>}
  </article>;
}
