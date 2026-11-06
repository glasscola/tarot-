import assert from 'node:assert/strict';
import { CARDS } from '../cards.js';
import { SPREADS, TOPICS, shuffleDeck, makeReading, formatReading, birthCards, validateQuestion } from '../engine.js';

assert.equal(CARDS.length, 78, 'The complete deck has 78 cards.');
assert.equal(new Set(CARDS.map(card => card.id)).size, 78, 'Every card has a unique stable id.');
const majors = CARDS.filter(card => /^m\d\d$/.test(card.id));
assert.equal(majors.length, 22);
assert.equal(TOPICS.length, 4);
assert.deepEqual(SPREADS.map(spread => spread.id), ['single', 'timeline', 'action', 'insight', 'choice', 'relationship']);
SPREADS.forEach(spread => {
  assert.equal(spread.positions.length, spread.count);
  assert.equal(spread.cells.length, spread.count, 'Every drawn card has a visible layout cell.');
  assert.equal(new Set(spread.cells.map(({ col, row }) => `${col}:${row}`)).size, spread.count, 'Cards never share the same cell.');
  assert.ok(spread.cells.every(({ col, row }) => Number.isInteger(col) && Number.isInteger(row)
    && col >= 1 && col <= spread.columns && row >= 1 && row <= spread.rows), 'All cells fit inside the declared layout.');
  assert.ok(Object.isFrozen(spread.cells) && spread.cells.every(Object.isFrozen), 'Geometry cannot accidentally change during a reading.');
  assert.ok(spread.layoutName && spread.layoutDescription, 'Every layout explains its shape and reading order.');
});
const bySpread = Object.fromEntries(SPREADS.map(spread => [spread.id, spread]));
for (const id of ['timeline', 'action']) {
  const spread = bySpread[id];
  assert.equal(spread.rows, 1, 'Sequential three-card readings retain one row.');
  assert.ok(spread.cells.every((cell, index) => index === 0 || cell.col > spread.cells[index - 1].col), 'Draw order reads left to right.');
}
const [center, above, left, right, below] = bySpread.insight.cells;
assert.ok(above.col === center.col && below.col === center.col && above.row < center.row && below.row > center.row, 'Background and advice surround the center vertically.');
assert.ok(left.row === center.row && right.row === center.row && left.col < center.col && right.col > center.col, 'Obstacle and support surround the center horizontally.');
const [currentChoice, aPossible, aCaution, bPossible, bCaution] = bySpread.choice.cells;
assert.ok(aPossible.col === aCaution.col && bPossible.col === bCaution.col, 'Each choice has its own vertical branch.');
assert.ok(aPossible.col < currentChoice.col && bPossible.col > currentChoice.col && aPossible.row > currentChoice.row && bPossible.row > currentChoice.row, 'A and B branch away from the shared current situation.');
assert.ok(aPossible.row < aCaution.row && bPossible.row < bCaution.row, 'Read each possibility before its caution.');
const [ownView, otherView, meeting] = bySpread.relationship.cells;
assert.ok(ownView.row === otherView.row && ownView.col < meeting.col && otherView.col > meeting.col && meeting.row > ownView.row, 'The two upper perspectives meet at the lower third card.');
assert.match(SPREADS.find(spread => spread.id === 'insight').description, /이 앱에서 구성/);
assert.match(SPREADS.find(spread => spread.id === 'choice').description, /이 앱에서 구성/);
assert.match(bySpread.relationship.description, /이 앱에서 구성/);

// Old saved histories bind cards to this order. A new visual shape must never reorder them.
const historicSlots = {
  single: ['핵심 조언'], timeline: ['과거', '현재', '미래'], action: ['상황', '행동', '흐름'],
  insight: ['현재', '배경', '방해 요소', '도움 요소', '조언'],
  choice: ['현재', 'A의 가능성', 'A의 주의점', 'B의 가능성', 'B의 주의점'],
};
for (const [spreadId, slots] of Object.entries(historicSlots)) {
  const restored = makeReading({ question: '이전에 저장한 질문', spreadId,
    selected: CARDS.slice(0, slots.length).map(card => ({ id: card.id, reversed: false })), date: '2026-10-18T01:30:00Z' });
  assert.deepEqual(restored.entries.map(entry => entry.positionName), slots, `${spreadId} preserves historical slot meanings.`);
  const savedHistory = JSON.parse(JSON.stringify(restored));
  assert.ok(!('cells' in savedHistory), 'History data remains independent of UI geometry.');
  assert.equal(formatReading(savedHistory), formatReading(restored), 'Old-style saved objects still copy without requiring new metadata.');
}

const original = JSON.stringify(CARDS);
const input = Object.freeze(CARDS.map(card => Object.freeze({ id: card.id })));
const deck = shuffleDeck(input);
assert.equal(deck.length, 78);
assert.deepEqual(new Set(deck.map(card => card.id)), new Set(CARDS.map(card => card.id)));
assert.ok(deck.every(card => card.reversed === false));
assert.equal(JSON.stringify(CARDS), original, 'Shuffle does not change definitions.');
assert.deepEqual(input.map(card => card.id), CARDS.map(card => card.id), 'Shuffle does not change source order.');
assert.equal(shuffleDeck(majors, true).length, 22);
assert.ok(shuffleDeck(CARDS, true).every(card => typeof card.reversed === 'boolean'));
assert.throws(() => shuffleDeck([CARDS[0], CARDS[0]]), /중복/);
assert.throws(() => shuffleDeck([{ id: 'not-a-card' }]), /알 수 없는/);
assert.throws(() => shuffleDeck([]), /카드가 없습니다/);

assert.deepEqual(birthCards('1950-02-21').numbers, [11, 2]);
assert.equal(birthCards('1950-02-21').total, 92);
assert.deepEqual(birthCards('1969-08-20').numbers, [17, 8]);
assert.match(birthCards('1969-08-20').steps[1], /^11 \+ 6 = 17/);
assert.deepEqual(birthCards('1990-01-05').numbers, [7 + 9, 7]); // 1 + 5 + 19 + 90 = 115 => 11 + 5 = 16
assert.deepEqual(birthCards('1999-01-08').numbers, [19, 10, 1]); // 127 => 12 + 7 = 19
assert.deepEqual(birthCards('1900-01-01').numbers, [21, 3]);
assert.deepEqual(birthCards('1900-01-10').numbers, [12, 3], 'A single 3 is paired with 12, rather than 21.');
assert.deepEqual(birthCards('1950-01-20').numbers, [18, 9]);
assert.deepEqual(birthCards('1990-01-09').numbers, [20, 2]);
assert.deepEqual(birthCards('2000-01-08').numbers, [11, 2]); // 29 => 11
assert.equal(birthCards('2000-02-29').date, '2000-02-29');
assert.throws(() => birthCards('1900-02-29'), /실제 양력/);
assert.throws(() => birthCards('2023-02-29'), /실제 양력/);
assert.throws(() => birthCards('2024-04-31'), /실제 양력/);
assert.throws(() => birthCards('2024-13-01'), /실제 양력/);
assert.throws(() => birthCards('1899-01-01'), /1900년/);
assert.throws(() => birthCards('2099-01-01'), /미래 날짜/);
assert.throws(() => birthCards('2024-2-9'), /YYYY-MM-DD/);
// Seoul has already reached the next day here; machine time zones must not reject today's birthday.
const RealDate = globalThis.Date;
try {
  globalThis.Date = class extends RealDate {
    constructor(...args) { super(...(args.length ? args : ['2026-10-17T15:10:00Z'])); }
  };
  assert.equal(birthCards('2026-10-18').date, '2026-10-18');
  assert.throws(() => birthCards('2026-10-19'), /미래 날짜/);
} finally {
  globalThis.Date = RealDate;
}

const rawQuestion = '<script>alert("plain text")</script> A와 B 중 무엇을 살펴볼까?';
const selected = [{ id: 'm00', reversed: false }, { id: 'm01', reversed: true }, { id: 'm02', reversed: false }];
const reading = makeReading({ question: `  ${rawQuestion}  `, topic: 'work', spreadId: 'timeline', selected, date: '2026-10-18T01:30:00Z' });
assert.equal(reading.question, rawQuestion, 'Question remains plain text without execution or inference.');
assert.equal(reading.date, '2026-10-18T01:30:00.000Z');
assert.deepEqual(reading.entries.map(entry => entry.positionName), ['과거', '현재', '미래']);
assert.equal(reading.entries[1].cardMeaning, CARDS.find(card => card.id === 'm01').reversed);
assert.match(reading.entries[2].interpretation, /현재의 선택과 주변 조건에 따라 흐름은 달라질 수/);
assert.match(reading.entries[0].interpretation, /과거의 경험 중 ‘새 출발’과 닮은 장면/);
assert.match(reading.entries[1].interpretation, /현재는 ‘실행’이 잘 드러나지 않거나/);
assert.ok(!reading.entries[1].interpretation.includes('실제로 확인할 수 있는 정보'), 'Topic guidance appears in the summary rather than every entry.');
assert.match(reading.summary, /실제로 확인할 수 있는 정보/);
assert.match(reading.summary, /역방향 1장/);
assert.match(reading.summary, /실행 \(역방향\)/);
assert.ok(!reading.summary.includes('새 출발 (역방향)'), 'Summary reversal labels belong only to cards actually drawn reversed.');
assert.equal(typeof reading.focus, 'string');
assert.equal(typeof reading.reflection, 'string');
assert.ok(reading.id.length > 10);

const text = formatReading(reading);
assert.ok(text.startsWith('월솜 타로 · 타로 리딩\n'));
assert.ok(text.includes(rawQuestion), 'Clipboard output preserves user text literally.');
assert.match(text, /1\. 과거 —/);
assert.match(text, /2\. 현재 —/);
assert.match(text, /3\. 미래 —/);
assert.ok(!formatReading(reading, { hideQuestion: true }).includes(rawQuestion), 'Private question is excluded from shared text.');
assert.ok(!text.includes('<div'), 'The formatter adds no HTML.');
assert.match(text, /2026년 10월 18일/);

const changedQuestion = makeReading({ question: '전혀 다른 문장의 질문', topic: 'work', spreadId: 'timeline', selected });
assert.deepEqual(changedQuestion.entries, reading.entries, 'No facts or interpretations are fabricated from free-text questions.');
assert.equal(changedQuestion.summary, reading.summary);
const action = makeReading({ question: '무엇을 할까?', spreadId: 'action', selected });
assert.notEqual(action.entries[1].interpretation, reading.entries[1].interpretation, 'Different positions meaningfully change interpretation.');
assert.match(action.entries[1].interpretation, /행동에 앞서 ‘실행’/);
const choice = makeReading({ question: 'A와 B를 비교하자', spreadId: 'choice', selected: CARDS.slice(0, 5).map(card => ({ id: card.id, reversed: false })) });
assert.match(choice.entries[2].interpretation, /A에서는 ‘관찰’/);
assert.match(choice.entries[3].interpretation, /B를 선택할 때 ‘돌봄’/);
assert.match(choice.summary, /실제 조건과 내 우선순위/);
const relationship = makeReading({ question: '친구와 어떻게 이야기할까?', spreadId: 'relationship', topic: 'love', selected });
assert.deepEqual(relationship.entries.map(entry => entry.positionName), ['나의 태도', '상대에게 확인할 점', '관계의 접점']);
assert.match(relationship.entries[0].interpretation, /내 반응/);
assert.match(relationship.entries[1].interpretation, /상대에게 그대로 적용하지 마세요/);
assert.match(relationship.entries[2].interpretation, /서로.*동의/);
assert.match(relationship.summary, /상대의 마음이나 관계의 결말을 확정하지 않습니다/);
assert.match(relationship.focus, /상대에게 직접 물을 부분/);
assert.match(relationship.reflection, /아직 추측하고 있는 것은 무엇/);
const relationshipUpright = makeReading({ question: '친구와 어떻게 이야기할까?', spreadId: 'relationship',
  selected: selected.map(card => ({ ...card, reversed: false })) });
assert.match(relationshipUpright.entries[1].interpretation, /상대의 실제 마음이라고 단정하지 말고/);
assert.ok(relationship.entries.every(entry => typeof entry.interpretation === 'string' && !entry.interpretation.includes('undefined')));
const vowelKeywordReading = makeReading({ question: '어떻게 살펴볼까?', spreadId: 'timeline', selected: [{ id: 'm08', reversed: false }, { id: 'm00', reversed: false }, { id: 'm01', reversed: false }] });
assert.match(vowelKeywordReading.entries[0].interpretation, /‘인내’와 닮은/);
// Summary holds the shared guidance once; entries retain their distinct card and position reading.
for (const topic of TOPICS) {
  for (const spread of SPREADS) {
    const result = makeReading({
      question: '지금 무엇을 살펴볼까?', topic: topic.id, spreadId: spread.id,
      selected: CARDS.slice(0, spread.count).map(card => ({ id: card.id, reversed: true })),
    });
    const topicContexts = {
      general: '일상에서 조절할 수 있는 시간, 에너지, 선택을 떠올려 보세요.',
      love: '상대의 속마음을 확정하기보다 내 감정과 실제로 오간 말, 서로의 경계를 살펴보세요.',
      work: '내가 맡은 일, 사용할 수 있는 자원, 실제로 확인할 수 있는 정보를 기준으로 생각해 보세요.',
      self: '다른 사람의 기대와 내가 실제로 원하는 것을 구분해 살펴보세요.',
    };
    const copy = formatReading(result);
    assert.equal(copy.split(topicContexts[topic.id]).length - 1, 1, 'Shared topic guidance occurs exactly once in the complete result.');
    assert.equal(copy.split('힘의 막힘·과도함·내면화를 점검하는 관점').length - 1, 1, 'The collective reversal guidance occurs once.');
    assert.ok(!copy.includes('속도와 강도를 먼저 조절해 보세요.'), 'A generic reversal instruction does not repeat before unique card advice.');
    result.entries.forEach(entry => {
      const definition = CARDS.find(card => card.id === entry.id);
      assert.equal(entry.cardMeaning, definition.reversed, 'Unique reversed meanings remain intact.');
      assert.equal(entry.advice, definition.advice, 'Unique advice remains intact.');
      assert.ok(entry.interpretation.includes(`‘${entry.keywords[0]}’`), 'Interpretation joins the actual card theme to its spread role.');
      assert.match(entry.interpretation, /막|과도|지나치|억누르|안에서/, 'Reversed interpretations explore obstruction, excess or inward expression.');
      assert.ok(!entry.interpretation.includes('자리는'), 'Interpretation reads the card rather than explaining the layout.');
    });
    assert.equal(result.summary.match(/\(역방향\)/g)?.length, spread.count, 'Every reversed keyword is individually marked in the summary.');
    assert.ok(!result.focus.includes(result.entries.at(-1).advice), 'The closing perspective connects the spread instead of repeating the final card advice.');
  }
}
assert.match(reading.focus, /과거와 현재 카드의 닮은 점/);
assert.match(choice.focus, /A와 B에서 공통으로/);
assert.equal(validateQuestion('  작은 질문  '), '작은 질문');
assert.throws(() => validateQuestion('   '), /먼저 적어/);
assert.throws(() => validateQuestion('가'.repeat(241)), /240자/);
assert.throws(() => makeReading({ question: '질문', spreadId: 'timeline', selected: selected.slice(0, 2) }), /3장이 필요/);
assert.throws(() => makeReading({ question: '질문', spreadId: 'timeline', selected: [selected[0], selected[0], selected[1]] }), /중복/);
assert.throws(() => makeReading({ question: '질문', spreadId: 'unknown', selected }), /배열/);
assert.throws(() => makeReading({ question: '질문', topic: 'unknown', selected }), /주제/);
assert.throws(() => makeReading({ question: '질문', selected, date: 'not a date' }), /기록 날짜/);

console.log('Tarot engine: deck integrity, immutable shuffle, birth calculations, spread roles, question privacy and plain-text sharing passed.');
