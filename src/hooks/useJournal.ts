import { useEffect, useReducer, useState, type Dispatch } from 'react';
import { emptyState, gameReducer, restoreState, STORAGE_KEY } from '../domain/gameState.ts';
import type { Action, State } from '../domain/types.ts';

function initialize(): State {
  try { return restoreState(localStorage.getItem(STORAGE_KEY)); }
  catch { return { ...emptyState(), error: 'La sauvegarde précédente n’a pas pu être lue. Elle reste conservée tant que vous ne modifiez pas le journal.' }; }
}

export function useJournal(): { state: State; dispatch: Dispatch<Action>; saved: boolean; ready: boolean } {
  const [state, dispatch] = useReducer(gameReducer, undefined, emptyState);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(true);
  // Match the server's initial render, then read browser storage after hydration.
  // Never persist the empty server state over an existing journal.
  useEffect(() => {
    dispatch({ type: 'RESTORE', state: initialize() });
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready || state.error.startsWith('La sauvegarde précédente')) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, error: '' })); setSaved(true); }
    catch { setSaved(false); }
  }, [state, ready]);
  return { state, dispatch, saved, ready };
}
