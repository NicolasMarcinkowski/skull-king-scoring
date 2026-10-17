export type Phase = 'bids' | 'results';
export type Screen = 'home' | 'history' | 'setup' | 'round' | 'sheet' | 'finish';
export type NumberField = 'bids' | 'wins' | 'bonuses';

export type Round = {
  bids: number[];
  wins: number[];
  bonuses: number[];
  destroyed: boolean;
  validated: boolean;
  phase: Phase;
  /** Champ hérité de l'ancienne version JavaScript, ignoré par les calculs. */
  ghost?: number;
};

export type Game = {
  id: string;
  date: string;
  players: string[];
  kraken: boolean;
  rounds: Round[];
};

export type View = {
  screen: Screen;
  gameId: string | null;
  roundIndex: number;
};

export type State = {
  games: Game[];
  draft: string[];
  view: View;
  edit: Round | null;
  error: string;
};

export type RoundScore = {
  exact: boolean;
  base: number;
  bonus: number;
  total: number;
};

export type RankingRow = {
  name: string;
  index: number;
  total: number;
  rank: number;
};

export type Action =
  | { type: 'RESTORE'; state: State }
  | { type: 'NAVIGATE'; screen: Screen }
  | { type: 'ERROR'; message: string }
  | { type: 'DRAFT_NAME'; index: number; name: string }
  | { type: 'ADD_PLAYER' }
  | { type: 'REMOVE_PLAYER'; index: number }
  | { type: 'MOVE_PLAYER'; index: number; direction: 1 | -1 }
  | { type: 'START'; id: string; date: string; players: string[]; kraken?: boolean }
  | { type: 'RESUME'; id: string }
  | { type: 'OPEN_ROUND'; index: number }
  | { type: 'STAGE'; phase: Phase }
  | { type: 'SET_NUMBER'; field: NumberField; index: number; value: number }
  | { type: 'DESTROYED'; value: boolean }
  | { type: 'ENABLE_KRAKEN' }
  | { type: 'CANCEL_EDIT' }
  | { type: 'COMMIT' };
