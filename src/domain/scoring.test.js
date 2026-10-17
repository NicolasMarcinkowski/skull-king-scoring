import test from 'node:test';
import assert from 'node:assert/strict';
import { cardsForRound, expectedTricks, freshRound, ranking, score, totals, validateRound } from './scoring.js';

test('classic scores, failed bonuses and zero bids', () => {
  for (const [cards, bid, won, bonus, expected] of [[5, 3, 3, 0, 60], [5, 2, 4, 30, -20], [7, 0, 0, 0, 70], [7, 0, 2, 0, -70], [5, 2, 2, 30, 70]]) assert.equal(score(bid, won, bonus, cards).total, expected);
  for (let cards = 1; cards <= 10; cards++) for (let bid = 0; bid <= cards; bid++) for (let won = 0; won <= cards; won++) {
    const points = score(bid, won, 35, cards);
    assert.equal(points.bonus, bid === won ? 35 : 0);
    assert.equal(points.total, points.base + points.bonus);
  }
});
test('zero defaults and equal dealing for eight players', () => {
  assert.deepEqual(freshRound(3).bids, [0, 0, 0]);
  assert.deepEqual(freshRound(3).wins, [0, 0, 0]);
  assert.equal(cardsForRound(8, 9), 8);
  assert.equal(cardsForRound(8, 10), 8);
  assert.equal(cardsForRound(7, 10), 10);
  assert.equal(score(0, 0, 0, cardsForRound(8, 10)).total, 80);
});
test('only human results count; Kraken removes one trick but not one card', () => {
  const round = { ...freshRound(2), bids: [0, 2], wins: [2, 3], ghost: 99 };
  assert.deepEqual(validateRound(round, 5, 2), []);
  round.wins = [2, 2];
  assert.ok(validateRound(round, 5, 2).length);
  round.destroyed = true;
  assert.deepEqual(validateRound(round, 5, 2, true), []);
  assert.equal(expectedTricks(round, 5, true), 4);
  assert.equal(score(0, 0, 0, 5).total, 50);
  assert.ok(validateRound(round, 5, 2, false).length);
  const first = { ...freshRound(2), destroyed: true };
  assert.deepEqual(validateRound(first, 1, 2, true), []);
});
test('invalid totals, noninteger tricks and invalid bonus steps are blocked', () => {
  const round = freshRound(3);
  assert.ok(validateRound(round, 3, 3).length);
  round.wins = [1, 1, 1]; round.bonuses[0] = 3;
  assert.ok(validateRound(round, 3, 3).some(message => message.includes('bonus')));
  round.bonuses[0] = 5; round.bids[0] = -1;
  assert.ok(validateRound(round, 3, 3).length);
  round.bids[0] = 1.5;
  assert.ok(validateRound(round, 3, 3).length);
});
test('ties and negative scores share the correct rank', () => {
  const game = { players: ['A', 'B', 'C'], rounds: [{ ...freshRound(3), validated: true, bids: [0, 0, 0], wins: [1, 1, 0] }] };
  assert.deepEqual(totals(game), [-10, -10, 10]);
  assert.deepEqual(ranking(game).map(row => [row.name, row.rank]), [['C', 1], ['A', 2], ['B', 2]]);
});
