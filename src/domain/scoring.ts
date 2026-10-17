import type { Game, RankingRow, Round, RoundScore } from './types.ts';

export const cardsForRound = (players: number, round: number): number => players === 8 ? Math.min(round, 8) : round;
export const expectedTricks = (round: Round, cards: number, kraken = false): number => cards - (kraken && round.destroyed === true ? 1 : 0);

export function score(bid: number, won: number, bonus: number, cards: number): RoundScore {
  const exact = bid === won;
  const base = bid === 0 ? (exact ? 10 : -10) * cards : exact ? bid * 20 : -10 * Math.abs(bid - won);
  const awardedBonus = exact ? bonus : 0;
  return { exact, base, bonus: awardedBonus, total: base + awardedBonus };
}

export function validateBids(round: Round, cards: number): string[] {
  return round.bids.some(value => !Number.isInteger(value) || value < 0 || value > cards)
    ? [`Renseignez les annonces avec un entier entre 0 et ${cards}.`] : [];
}

export function validateRound(round: Round, cards: number, players: number, kraken = false): string[] {
  const errors = validateBids(round, cards);
  if (round.destroyed && !kraken) errors.push('Activez le Kraken avant de déclarer un pli détruit.');
  for (let i = 0; i < players; i++) {
    if (!Number.isInteger(round.wins[i]) || round.wins[i] < 0 || round.wins[i] > cards) errors.push(`Les plis remportés doivent être un entier entre 0 et ${cards}.`);
    if (!Number.isInteger(round.bonuses[i]) || round.bonuses[i] < 0 || round.bonuses[i] % 5) errors.push('Les bonus doivent être positifs ou nuls, par paliers de 5.');
  }
  const sum = round.wins.reduce((total, value) => total + (value ?? 0), 0);
  const expected = expectedTricks(round, cards, kraken);
  if (sum !== expected) errors.push(`Le total des plis remportés doit être de ${expected} (actuellement ${sum}).${kraken && round.destroyed ? ' Un pli est détruit par le Kraken.' : ''}`);
  return [...new Set(errors)];
}

export const freshRound = (players: number): Round => ({ bids: Array(players).fill(0), wins: Array(players).fill(0), bonuses: Array(players).fill(0), destroyed: false, validated: false, phase: 'bids' });
export const isComplete = (game: Pick<Game, 'rounds'>): boolean => game.rounds.every(round => round.validated);
export const currentRound = (game: Pick<Game, 'rounds'>): number => Math.max(0, game.rounds.findIndex(round => !round.validated));
export const totals = (game: Pick<Game, 'players' | 'rounds'>): number[] => game.players.map((_, player) => game.rounds.reduce((total, round, index) => total + (round.validated ? score(round.bids[player], round.wins[player], round.bonuses[player], cardsForRound(game.players.length, index + 1)).total : 0), 0));
export function ranking(game: Pick<Game, 'players' | 'rounds'>): RankingRow[] {
  const values = totals(game);
  const rows = game.players.map((name, index) => ({ name, index, total: values[index] })).sort((a, b) => b.total - a.total);
  return rows.map(row => ({ ...row, rank: rows.findIndex(other => other.total === row.total) + 1 }));
}
