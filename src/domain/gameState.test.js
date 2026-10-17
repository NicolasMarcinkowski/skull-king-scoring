import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyState, gameReducer as reduce, restoreState, selectedGame, selectedRound, STORAGE_KEY } from './gameState.js';
import { freshRound, isComplete, totals } from './scoring.js';

const start = (state = emptyState()) => reduce(state, { type: 'START', id: 'test-game', date: '2026-10-17T12:00:00Z', players: ['Astrid', 'Ragnar'], kraken: true });
const number = (state, field, index, value) => reduce(state, { type: 'SET_NUMBER', field, index, value });

test('new games always use Kraken, even with an old disabled draft', () => {
  const state = { ...emptyState(), draftKraken: false };
  const created = reduce(state, { type: 'START', id: 'new-game', players: ['Astrid', 'Ragnar'], kraken: false });
  assert.equal(selectedGame(created).kraken, true);
  assert.equal(selectedGame(restoreState(JSON.stringify(created))).kraken, true);
});

test('restoring an old game does not change its Kraken rules', () => {
  const saved = start();
  saved.games[0].kraken = false;
  assert.equal(selectedGame(restoreState(JSON.stringify(saved))).kraken, false);
});

test('browser hydration restores the saved journal instead of the empty server state', () => {
  const saved = number(start(), 'bonuses', 0, 20);
  const restored = reduce(emptyState(), { type: 'RESTORE', state: restoreState(JSON.stringify(saved)) });
  assert.equal(restored.games.length, 1);
  assert.equal(selectedRound(restored).bonuses[0], 20);
  assert.equal(restored.view.gameId, 'test-game');
});

test('creation rejects duplicate names and respects zero defaults', () => {
  const state = start();
  assert.equal(state.view.screen, 'round');
  assert.equal(selectedGame(state).rounds.length, 10);
  assert.deepEqual(selectedRound(state).wins, [0, 0]);
  assert.equal(reduce(emptyState(), { type: 'START', players: ['A', ' a '], kraken: false }).games.length, 0);
});
test('legacy saves retain totals and migrate only unfinished blank fields', () => {
  const previous = start();
  previous.games[0].rounds[0] = { ...freshRound(2), validated: true, bids: [1, 0], wins: [1, 0], bonuses: [5, 0], ghost: 1 };
  previous.games[0].rounds[1].bids = [null, 0];
  previous.games[0].rounds[1].wins = [null, null];
  const restored = restoreState(JSON.stringify(previous));
  assert.equal(STORAGE_KEY, 'skullking-journal-v1');
  assert.deepEqual(totals(restored.games[0]), [25, 10]);
  assert.deepEqual(restored.games[0].rounds[1].bids, [0, 0]);
  assert.deepEqual(restored.games[0].rounds[1].wins, [0, 0]);
  assert.equal(restored.view.screen, 'sheet');
});
test('clickable stages preserve results and validate announcements', () => {
  let state = start();
  state = reduce(state, { type: 'STAGE', phase: 'results' });
  state = number(state, 'wins', 0, 1);
  state = number(state, 'bonuses', 0, 15);
  state = reduce(state, { type: 'STAGE', phase: 'bids' });
  state = reduce(state, { type: 'STAGE', phase: 'results' });
  assert.equal(selectedRound(state).wins[0], 1);
  assert.equal(selectedRound(state).bonuses[0], 15);
  state = number(state, 'bids', 0, 2);
  state = reduce(state, { type: 'STAGE', phase: 'bids' });
  state = reduce(state, { type: 'STAGE', phase: 'results' });
  assert.equal(selectedRound(state).phase, 'bids');
  assert.ok(state.error);
});
test('corrections are isolated until confirmed and cancellation preserves scores', () => {
  let state = start();
  state = number(state, 'wins', 0, 1);
  state = reduce(state, { type: 'COMMIT' });
  assert.deepEqual(totals(selectedGame(state)), [-10, 10]);
  const original = state;
  state = reduce(state, { type: 'OPEN_ROUND', index: 0 });
  state = number(state, 'bids', 0, 1);
  assert.deepEqual(totals(selectedGame(state)), [-10, 10]);
  const cancelled = reduce(state, { type: 'CANCEL_EDIT' });
  assert.deepEqual(totals(selectedGame(cancelled)), [-10, 10]);
  state = reduce(state, { type: 'COMMIT' });
  assert.deepEqual(totals(selectedGame(state)), [20, 10]);
  assert.deepEqual(totals(selectedGame(original)), [-10, 10]);
});
test('Kraken selection and correction drafts survive reload', () => {
  let state = start();
  state = reduce(state, { type: 'DESTROYED', value: true });
  state = reduce(state, { type: 'COMMIT' });
  assert.deepEqual(totals(selectedGame(state)), [10, 10]);
  state = reduce(state, { type: 'OPEN_ROUND', index: 0 });
  state = reduce(state, { type: 'DESTROYED', value: false });
  state = restoreState(JSON.stringify(state));
  assert.equal(selectedRound(state).destroyed, false);
  assert.equal(selectedGame(state).rounds[0].destroyed, true);
  const invalid = reduce(state, { type: 'COMMIT' });
  assert.ok(invalid.error);
  assert.deepEqual(totals(selectedGame(invalid)), [10, 10]);
});
test('complete ten-round game and rematch without erasing the journal', () => {
  let state = start();
  for (let round = 1; round <= 10; round++) {
    state = number(state, 'bids', 0, round);
    state = number(state, 'wins', 0, round);
    state = reduce(state, { type: 'COMMIT' });
  }
  assert.equal(state.view.screen, 'finish');
  assert.equal(isComplete(selectedGame(state)), true);
  assert.deepEqual(totals(selectedGame(state)), [1100, 550]);
  state = reduce(state, { type: 'START', id: 'rematch', date: '2026-10-17T14:00:00Z', players: ['Astrid', 'Ragnar'], kraken: true });
  assert.equal(state.games.length, 2);
  assert.deepEqual(totals(selectedGame(state)), [0, 0]);
});
test('malformed saves fail clearly and future rounds cannot be opened', () => {
  assert.throws(() => restoreState('{'));
  assert.throws(() => restoreState('{"games":[{}],"draft":[]}'));
  const state = start();
  assert.equal(reduce(state, { type: 'OPEN_ROUND', index: 9 }), state);
});
