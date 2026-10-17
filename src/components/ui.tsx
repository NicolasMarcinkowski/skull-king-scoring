import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { ranking } from '../domain/scoring.ts';
import type { Game } from '../domain/types.ts';

export type ModalData = { title: string; content: ReactNode; label?: string; confirm: () => void };

type ButtonProps = { variant?: string } & ButtonHTMLAttributes<HTMLButtonElement>;
type GameTitleProps = { game: Pick<Game, 'players' | 'kraken'>; children: ReactNode; subtitle?: string };
type StepperProps = { name: string; value: number; onChange: (value: number) => void };
type NumberStepperProps = StepperProps & { label: string; id: string; max: number; readOnly?: boolean };

export const signed = (value: number): string => value > 0 ? `+${value}` : String(value);
export function Button({ children, variant = '', ...props }: ButtonProps) { return <button type="button" className={`btn ${variant}`} {...props}>{children}</button>; }
export function Crown() { return <svg className="mark" viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="m7 15 9 8 8-14 8 14 9-8-5 22H12z" stroke="currentColor" strokeWidth="1.6" /><path d="M13 41h22M12 32h24M24 19v12" stroke="currentColor" strokeWidth="1.6" /><circle cx="7" cy="12" r="2" fill="currentColor" /><circle cx="41" cy="12" r="2" fill="currentColor" /><path d="m24 3 2 3-2 3-2-3z" fill="currentColor" /></svg>; }
export function ErrorMessage({ message }: { message: string }) { return message ? <div className="error" role="alert">{message}</div> : null; }
export function GameTitle({ game, children, subtitle }: GameTitleProps) { return <div className="page-title"><span className="eyebrow">{game.players.length} joueurs · Score classique{game.kraken ? ' · Kraken activé' : ''}</span><h1>{children}</h1>{subtitle && <p className="intro">{subtitle}</p>}</div>; }
export function RulePanel() { return <aside className="panel"><div className="panel-title"><h3>Le code des mers</h3><span className="eyebrow">Classique</span></div>{[['Annonce positive réussie', '+20 / pli'], ['Annonce positive manquée', '−10 / écart'], ['Zéro pli annoncé', '±10 / carte'], ['Points bonus', 'Par pas de 5']].map(([label, value]) => <div className="rule-line" key={label}><span>{label}</span><strong>{value}</strong></div>)}<p className="footnote">Les bonus sont accordés uniquement si l’annonce est exacte. Le montant est déclaré par l’équipage.</p></aside>; }
export function Ranking({ game }: { game: Pick<Game, 'players' | 'rounds'> }) { return <>{ranking(game).map(row => <div className="rank" key={row.index}><small>{row.rank === 1 ? '♔' : String(row.rank).padStart(2, '0')}</small><span>{row.name}</span><span className="points">{signed(row.total)}</span></div>)}</>; }
export function NumberStepper({ label, name, id, value, max, onChange, readOnly = false }: NumberStepperProps) {
  return <div className="field"><label htmlFor={id}>{label}</label><div className="trick-stepper"><button type="button" disabled={readOnly || value <= 0} onClick={() => onChange(Math.max(0, value - 1))} aria-label={`Diminuer les ${label.toLowerCase()} de ${name}`}>−</button><input id={id} type="number" inputMode="numeric" min="0" max={max} step="1" value={value} readOnly={readOnly} aria-label={`${label} de ${name}`} onFocus={event => event.target.select()} onChange={event => onChange(event.target.value === '' ? 0 : Number(event.target.value))} /><button type="button" disabled={readOnly || value >= max} onClick={() => onChange(Math.min(max, value + 1))} aria-label={`Augmenter les ${label.toLowerCase()} de ${name}`}>+</button></div></div>;
}
export function BonusStepper({ name, value, onChange }: StepperProps) { return <div className="field"><label>Points bonus</label><div className="stepper"><button type="button" disabled={value === 0} onClick={() => onChange(Math.max(0, value - 5))} aria-label={`Retirer 5 points bonus à ${name}`}>−5</button><output aria-label={`Bonus saisis de ${name}`} aria-live="polite">{value}</output><button type="button" onClick={() => onChange(value + 5)} aria-label={`Ajouter 5 points bonus à ${name}`}>+5</button></div></div>; }
export function Modal({ modal, onClose }: { modal: ModalData | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (modal && !dialog.open) dialog.showModal();
    if (!modal && dialog.open) dialog.close();
  }, [modal]);
  return <dialog ref={ref} onCancel={onClose} aria-labelledby="modal-title">{modal && <><h2 id="modal-title">{modal.title}</h2>{modal.content}<div className="form-actions"><Button onClick={onClose}>Annuler</Button><Button variant="primary" onClick={modal.confirm}>{modal.label ?? 'Confirmer'}</Button></div></>}</dialog>;
}
