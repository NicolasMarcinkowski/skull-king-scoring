import type { RankingRow } from '../domain/types.ts';

/** UI copy for a ranking already calculated by the scoring module. */
export function pirateQuip(rows: readonly Pick<RankingRow, 'name' | 'total'>[], previous = '', random = Math.random): string {
  if (!rows.length) return 'À l’abordage, le trésor attend son équipage !';
  const first = rows[0].total;
  const last = rows[rows.length - 1].total;
  const leaders = rows.filter(row => row.total === first).map(row => row.name).join(' et ');
  const trailers = rows.filter(row => row.total === last).map(row => row.name).join(' et ');
  const lines = first === last ? [
    'Égalité à bord ! Même le perroquet refuse de désigner le capitaine.',
    'Tout l’équipage partage le trésor… pourvu que personne ne compte les pièces !',
    'Tous sur le même pont ! La prochaine vague départagera les capitaines.',
  ] : [
    `${leaders} à la barre ; ${trailers} prépare déjà une mutinerie !`,
    `Le trésor fait les yeux doux à ${leaders}. Pour ${trailers}, la carte est peut-être à l’envers !`,
    `${leaders} garde le cap ; ${trailers} cherche encore le frein du bateau.`,
    `Pavillon haut pour ${leaders} ! ${trailers} négocie une revanche avec le Kraken.`,
    `${leaders} protège le coffre ; ${trailers} attend une marée plus généreuse !`,
  ];
  const choices = lines.filter(line => line !== previous);
  return choices[Math.floor(random() * choices.length)];
}
