import test from 'node:test';
import assert from 'node:assert/strict';
import { pirateQuip } from './pirateQuip.ts';

test('pirate quips name the provisional leaders and trailers, including ties', () => {
  const rows = [{ name: 'Astrid', total: 20 }, { name: 'Justine', total: 20 }, { name: 'Ragnar', total: -10 }];
  const text = pirateQuip(rows, '', () => 0);
  assert.match(text, /Astrid et Justine/);
  assert.match(text, /Ragnar/);
});

test('a new confirmation avoids immediately repeating the same line', () => {
  const rows = [{ name: 'Astrid', total: 10 }, { name: 'Ragnar', total: -10 }];
  const first = pirateQuip(rows, '', () => 0);
  assert.notEqual(pirateQuip(rows, first, () => 0), first);
});

test('all-tied and empty rankings do not invent a last-place player', () => {
  assert.match(pirateQuip([{ name: 'A', total: 0 }, { name: 'B', total: 0 }], '', () => 0), /Égalité/);
  assert.ok(pirateQuip([]));
});
