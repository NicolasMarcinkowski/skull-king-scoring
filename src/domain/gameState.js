import { cardsForRound, currentRound, freshRound, isComplete, validateBids, validateRound } from './scoring.js';

export const STORAGE_KEY = 'skullking-journal-v1';
export const emptyState = () => ({ games: [], draft: ['', '', ''], draftKraken: false, view: { screen: 'home', gameId: null, roundIndex: 0 }, edit: null, error: '' });

// Keeps the storage key and score records from the original JavaScript app.
export function restoreState(serialized) {
  if (!serialized) return emptyState();
  const raw = JSON.parse(serialized);
  if (!Array.isArray(raw.games) || !Array.isArray(raw.draft)) throw new Error('Invalid saved journal');
  const state = { ...emptyState(), ...raw, error: '' };
  if (state.games.some(game => !Array.isArray(game.players) || game.players.length < 2 || game.players.length > 8 || !Array.isArray(game.rounds) || game.rounds.length !== 10 || game.rounds.some(round => ['bids', 'wins', 'bonuses'].some(field => !Array.isArray(round[field]) || round[field].length !== game.players.length)))) throw new Error('Invalid saved game');
  for (const game of state.games) for (const round of game.rounds) if (!round.validated) {
    round.bids = round.bids.map(value => value ?? 0);
    round.wins = round.wins.map(value => value ?? 0);
  }
  if (!['home', 'history', 'setup', 'round', 'sheet', 'finish'].includes(state.view?.screen)) state.view = emptyState().view;
  const game = state.games.find(item => item.id === state.view.gameId);
  if (['round', 'sheet', 'finish'].includes(state.view.screen) && !game) state.view = emptyState().view;
  if (!Number.isInteger(state.view.roundIndex) || state.view.roundIndex < 0 || state.view.roundIndex > 9) state.view.roundIndex = 0;
  // A legacy refresh could leave a validated round open without a correction draft.
  if (game && state.view.screen === 'round' && game.rounds[state.view.roundIndex].validated && !state.edit) state.view.screen = 'sheet';
  return state;
}

export const selectedGame = state => state.games.find(game => game.id === state.view.gameId);
export const selectedRound = state => state.edit ?? selectedGame(state)?.rounds[state.view.roundIndex];
function go(state, screen, rest = {}) { return { ...state, error: '', edit: null, view: { ...state.view, screen, ...rest } }; }
function changeRound(state, update) {
  if (state.edit) return { ...state, edit: update(state.edit), error: '' };
  return { ...state, error: '', games: state.games.map(game => game.id === state.view.gameId ? { ...game, rounds: game.rounds.map((round, index) => index === state.view.roundIndex ? update(round) : round) } : game) };
}

export function gameReducer(state, action) {
  const game = selectedGame(state);
  switch (action.type) {
    case 'RESTORE': return action.state;
    case 'NAVIGATE': return go(state, action.screen);
    case 'ERROR': return { ...state, error: action.message };
    case 'DRAFT_NAME': return { ...state, draft: state.draft.map((name, index) => index === action.index ? action.name : name), error: '' };
    case 'DRAFT_KRAKEN': return { ...state, draftKraken: action.enabled };
    case 'ADD_PLAYER': return state.draft.length < 8 ? { ...state, draft: [...state.draft, ''] } : state;
    case 'REMOVE_PLAYER': return state.draft.length > 2 ? { ...state, draft: state.draft.filter((_, index) => index !== action.index) } : state;
    case 'MOVE_PLAYER': {
      const draft = [...state.draft], target = action.index + action.direction;
      if (target < 0 || target >= draft.length) return state;
      [draft[action.index], draft[target]] = [draft[target], draft[action.index]];
      return { ...state, draft };
    }
    case 'START': {
      const names = action.players.map(name => name.trim());
      if (names.length < 2 || names.length > 8 || names.some(name => !name) || new Set(names.map(name => name.toLocaleLowerCase('fr'))).size !== names.length) return { ...state, error: 'Renseignez de 2 à 8 noms distincts.' };
      const nextGame = { id: action.id, date: action.date, players: names, kraken: action.kraken, rounds: Array.from({ length: 10 }, () => freshRound(names.length)) };
      return go({ ...state, games: [nextGame, ...state.games] }, 'round', { gameId: action.id, roundIndex: 0 });
    }
    case 'RESUME': {
      const target = state.games.find(item => item.id === action.id);
      return target ? go(state, isComplete(target) ? 'finish' : 'round', { gameId: target.id, roundIndex: currentRound(target) }) : state;
    }
    case 'OPEN_ROUND': {
      if (!game || !Number.isInteger(action.index) || action.index < 0 || action.index > 9) return state;
      const round = game.rounds[action.index];
      if (!round.validated && action.index !== currentRound(game)) return state;
      return { ...state, error: '', view: { ...state.view, screen: 'round', roundIndex: action.index }, edit: round.validated ? structuredClone(round) : null };
    }
    case 'STAGE': {
      const round = selectedRound(state);
      if (!round || !['bids', 'results'].includes(action.phase)) return state;
      const errors = action.phase === 'results' ? validateBids(round, cardsForRound(game.players.length, state.view.roundIndex + 1)) : [];
      return errors.length ? { ...state, error: errors.join(' ') } : changeRound(state, current => ({ ...current, phase: action.phase }));
    }
    case 'SET_NUMBER': {
      if (!game || !['bids', 'wins', 'bonuses'].includes(action.field) || action.index < 0 || action.index >= game.players.length) return state;
      return changeRound(state, round => ({ ...round, [action.field]: round[action.field].map((value, index) => index === action.index ? action.value : value) }));
    }
    case 'DESTROYED': return game?.kraken ? changeRound(state, round => ({ ...round, destroyed: action.value })) : state;
    case 'ENABLE_KRAKEN': return { ...state, games: state.games.map(item => item.id === game.id ? { ...item, kraken: true } : item) };
    case 'CANCEL_EDIT': return go(state, 'sheet');
    case 'COMMIT': {
      const round = selectedRound(state);
      const errors = validateRound(round, cardsForRound(game.players.length, state.view.roundIndex + 1), game.players.length, !!game.kraken);
      if (errors.length) return { ...state, error: errors.join(' ') };
      const updated = { ...game, rounds: game.rounds.map((item, index) => index === state.view.roundIndex ? { ...round, validated: true, phase: 'results' } : item) };
      return go({ ...state, games: state.games.map(item => item.id === game.id ? updated : item) }, state.edit ? 'sheet' : isComplete(updated) ? 'finish' : 'round', { roundIndex: state.edit ? state.view.roundIndex : currentRound(updated) });
    }
    default: return state;
  }
}
