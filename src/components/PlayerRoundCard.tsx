import { useState } from 'react';
import { BonusStepper, NumberStepper, signed } from './ui.tsx';
import type { NumberField, Round, RoundScore } from '../domain/types.ts';

type PlayerRoundCardProps = {
  name: string;
  player: number;
  round: Round;
  cards: number;
  total: number;
  points: RoundScore | null;
  editing: boolean;
  onChange: (field: NumberField, player: number, value: number) => void;
};

export default function PlayerRoundCard({ name, player, round, cards, total, points, editing, onChange }: PlayerRoundCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const results = round.phase === 'results';
  const detailsId = `score-details-${player}`;

  return <article className={`player-card${results ? ' results-player-card' : ''}`}>
    <div className="player-card-head">
      <span className="avatar">{name.slice(0, 1).toUpperCase()}</span>
      <div className="player-identity">
        <strong>{name}</strong>
        <small>{results && <>Annonce {round.bids[player]} · </>}Cumul : {signed(total)} pts</small>
      </div>
      {results && <>
        <strong className={`round-score ${points && points.total < 0 ? 'negative' : 'positive'}`} aria-label={`Aperçu des points de manche de ${name} : ${points ? signed(points.total) : 'indisponible'}`}>
          {points ? signed(points.total) : '—'} <small>pts</small>
        </strong>
        <button type="button" className="score-details-toggle" aria-label={`Détail des points de ${name}`} aria-expanded={showDetails} aria-controls={detailsId} onClick={() => setShowDetails(value => !value)}>⋯</button>
      </>}
    </div>
    <div className="player-inputs">
      {(!results || editing) && <NumberStepper id={`bid-${player}`} label="Plis annoncés" name={name} value={round.bids[player]} max={cards} onChange={value => onChange('bids', player, value)} />}
      {results && <>
        <NumberStepper id={`win-${player}`} label="Plis remportés" name={name} value={round.wins[player]} max={cards} onChange={value => onChange('wins', player, value)} />
        <BonusStepper name={name} value={round.bonuses[player]} onChange={value => onChange('bonuses', player, value)} />
      </>}
    </div>
    {results && <>
      {points && !points.exact && round.bonuses[player] > 0 && <p className="bonus-note">Bonus non accordés : annonce incorrecte</p>}
      <div id={detailsId} className="score-breakdown" hidden={!showDetails}>
        {points ? <><strong>{points.exact ? 'Annonce réussie' : 'Annonce manquée'}</strong><br />Points d’annonce : {signed(points.base)}<br />Bonus saisis : {round.bonuses[player]} · Bonus accordés : {points.bonus}<br />Total de la manche : {signed(points.total)}</> : 'Renseignez les annonces et les plis pour afficher les points.'}
      </div>
    </>}
  </article>;
}
