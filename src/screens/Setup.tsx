import { useEffect, useRef, type Dispatch, type KeyboardEvent } from 'react';
import { Button, ErrorMessage, RulePanel } from '../components/ui.tsx';
import type { Action, Screen, State } from '../domain/types.ts';

type SetupProps = {
  state: State;
  dispatch: Dispatch<Action>;
  navigate: (screen: Screen) => void;
  review: () => void;
};

export default function Setup({ state, dispatch, navigate, review }: SetupProps) {
  const nameInputs = useRef<(HTMLInputElement | null)[]>([]);
  const pendingFocus = useRef<number | null>(null);
  useEffect(() => {
    if (pendingFocus.current === null) return;
    nameInputs.current[pendingFocus.current]?.focus();
    pendingFocus.current = null;
  }, [state.draft.length]);

  function addPlayer() {
    if (state.draft.length >= 8) return;
    pendingFocus.current = state.draft.length;
    dispatch({ type: 'ADD_PLAYER' });
  }

  function nextPlayer(event: KeyboardEvent<HTMLInputElement>, index: number) {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;
    event.preventDefault();
    if (index < state.draft.length - 1) nameInputs.current[index + 1]?.focus();
    else if (event.currentTarget.value.trim()) addPlayer();
  }

  return <main className="shell"><div className="page-title"><span className="eyebrow">Préparer la traversée</span><h1>Rassemblez votre équipage</h1><p className="intro">De 2 à 8 joueurs. Dix manches pour écrire votre légende.</p></div><div className="grid"><section className="panel"><div className="panel-title"><h3>Les membres d’équipage</h3><span className="badge">{state.draft.length} / 8 JOUEURS</span></div>{state.draft.map((name, index) => <div className="player-edit" key={index}><span className="avatar">{index + 1}</span><input ref={element => { nameInputs.current[index] = element; }} className="input" aria-label={`Nom du joueur ${index + 1}`} placeholder={`Nom du joueur ${index + 1}`} enterKeyHint="next" maxLength={40} value={name} onKeyDown={event => nextPlayer(event, index)} onChange={event => dispatch({ type: 'DRAFT_NAME', index, name: event.target.value })} /><button className="small-btn" disabled={index === 0} onClick={() => dispatch({ type: 'MOVE_PLAYER', index, direction: -1 })} aria-label={`Monter le joueur ${index + 1}`}>↑</button><button className="small-btn" disabled={index === state.draft.length - 1} onClick={() => dispatch({ type: 'MOVE_PLAYER', index, direction: 1 })} aria-label={`Descendre le joueur ${index + 1}`}>↓</button><button className="small-btn" disabled={state.draft.length <= 2} onClick={() => dispatch({ type: 'REMOVE_PLAYER', index })} aria-label={`Retirer le joueur ${index + 1}`}>×</button></div>)}<Button variant="secondary" disabled={state.draft.length >= 8} onClick={addPlayer}>＋ Ajouter un joueur</Button><ErrorMessage message={state.error} /><div className="form-actions"><Button onClick={() => navigate('home')}>← Retour</Button><Button variant="primary" onClick={review}>Vérifier l’équipage →</Button></div></section><RulePanel /></div></main>;
}
