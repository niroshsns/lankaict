import test from 'node:test';
import assert from 'node:assert/strict';
import {filterQuestions, shuffle, scoreQuiz, restoreSession, escapeHTML} from '../public/core.js';

const question = (id, fields = {}) => ({
  id, year: 2023, topic: 'networks', source: 'past-paper',
  prompt: `Question ${id}`, options: ['one', 'two', 'three', 'four', 'five'],
  answer: 2, answerStatus: 'worked', ...fields
});
const pool = Object.freeze([
  question('2023-01', {prompt: 'Identify the network switch', options: ['Hub', 'MAC address', 'Router', 'DNS', 'Modem']}),
  question('2023-02', {topic: 'programming', prompt: 'Evaluate a Python expression'}),
  question('2024-01', {year: 2024, prompt: 'Select a network protocol'}),
  question('2025-01', {year: 2025, topic: 'databases', prompt: 'Choose the SQL primary key'}),
  question('extra-01', {year: null, source: 'additional', answerStatus: 'authored', prompt: 'An original network exercise'})
]);
const ids = items => items.map(q => q.id);

test('question filters support year, topic and source independently', () => {
  assert.deepEqual(ids(filterQuestions(pool, {year: '2023'})), ['2023-01', '2023-02']);
  assert.deepEqual(ids(filterQuestions(pool, {year: 2024})), ['2024-01']);
  assert.deepEqual(ids(filterQuestions(pool, {topic: 'networks'})), ['2023-01', '2024-01', 'extra-01']);
  assert.deepEqual(ids(filterQuestions(pool, {source: 'additional'})), ['extra-01']);
  assert.deepEqual(ids(filterQuestions(pool, {year: 'all', topic: 'all', source: 'all'})), ids(pool));
});

test('combined filters and saved-only practice use their intersection', () => {
  const saved = ['2023-01', '2023-02', 'extra-01', 'removed-question'];
  assert.deepEqual(ids(filterQuestions(pool, {year: '2023', topic: 'networks', source: 'past-paper', savedOnly: true}, saved)), ['2023-01']);
  assert.deepEqual(ids(filterQuestions(pool, {savedOnly: true}, saved)), ['2023-01', '2023-02', 'extra-01']);
  assert.deepEqual(filterQuestions(pool, {savedOnly: true}, []), []);
  assert.deepEqual(filterQuestions(pool, {year: 2025, source: 'additional'}), []);
});

test('search finds prompt text, answer options, IDs and year without case or surrounding-space sensitivity', () => {
  assert.deepEqual(ids(filterQuestions(pool, {search: '  PYTHON  '})), ['2023-02']);
  assert.deepEqual(ids(filterQuestions(pool, {search: 'mac ADDRESS'})), ['2023-01']);
  assert.deepEqual(ids(filterQuestions(pool, {search: '2024-01'})), ['2024-01']);
  assert.deepEqual(ids(filterQuestions(pool, {search: '2025'})), ['2025-01']);
  assert.deepEqual(ids(filterQuestions(pool, {search: 'additional'})), ['extra-01']);
  assert.deepEqual(ids(filterQuestions(pool, {search: '   '})), ids(pool));
  assert.deepEqual(filterQuestions(pool, {search: 'missing concept'}), []);
});

test('filtering and shuffling preserve the original bank and every question', () => {
  const immutable = Object.freeze(pool.map(q => Object.freeze({...q, options: Object.freeze([...q.options])})));
  const before = JSON.stringify(immutable);
  const shuffled = shuffle(immutable, () => 0.25);
  assert.notEqual(shuffled, immutable);
  assert.equal(JSON.stringify(immutable), before);
  assert.deepEqual([...ids(shuffled)].sort(), [...ids(immutable)].sort());
  assert.equal(new Set(shuffled).size, immutable.length);
  assert.ok(shuffled.every(q => immutable.includes(q)), 'Shuffle should retain the complete question records');
  assert.deepEqual(shuffle(immutable, () => 0.25), shuffled, 'A supplied deterministic random source should be reproducible');
  assert.deepEqual(shuffle([]), []);
  assert.deepEqual(shuffle([immutable[0]]), [immutable[0]]);
  filterQuestions(immutable, {year: 2023});
  assert.equal(JSON.stringify(immutable), before);
});

test('final score includes unanswered keyed questions in its denominator and excludes questions awaiting review', () => {
  const qs = [
    question('right', {answer: 2}),
    question('wrong', {answer: 4}),
    question('skipped', {answer: 1}),
    question('pending-answered', {answer: null, answerStatus: 'needs-review'}),
    question('pending-skipped', {answer: null, answerStatus: 'needs-review'}),
    question('invalid-selection', {answer: 3})
  ];
  const score = scoreQuiz(qs, {right: 2, wrong: 1, 'pending-answered': 3, 'invalid-selection': 99});
  assert.deepEqual(score, {total: 6, graded: 2, correct: 1, incorrect: 1, unanswered: 3, unverified: 1, possible: 4, percent: 25});
});

test('score respects one-based option numbering, accepts persisted numeric selections and handles no keyed questions', () => {
  assert.equal(scoreQuiz([question('last', {answer: 5})], {last: '5'}).correct, 1);
  for (const value of [0, 6, -1, 1.5, null, undefined, 'invalid']) {
    const score = scoreQuiz([question('q')], {q: value});
    assert.equal(score.correct, 0);
    assert.equal(score.unanswered, 1);
    assert.equal(score.percent, 0);
  }
  const pending = scoreQuiz([question('q', {answer: null, answerStatus: 'needs-review'})], {q: 2});
  assert.equal(pending.possible, 0);
  assert.equal(pending.percent, 0);
  assert.equal(pending.unverified, 1);
  assert.equal(scoreQuiz([], {}).percent, 0);
});

test('resume discards removed questions, duplicate IDs, invalid selections and invalid checked markers', () => {
  const raw = {
    ids: ['2023-01', 'removed-question', '2023-01', '2023-02', '2024-01'],
    answers: {'2023-01': '3', '2023-02': 7, '2024-01': 0, 'removed-question': 2},
    checked: ['removed-question', '2023-01', '2023-02', '2024-01'],
    index: 99, mode: 'exam', startedAt: 12345, elapsed: 90, label: 'Resumed exam'
  };
  const restored = restoreSession(raw, pool);
  assert.deepEqual(restored.ids, ['2023-01', '2023-02', '2024-01']);
  assert.deepEqual(restored.answers, {'2023-01': 3});
  assert.deepEqual(restored.checked, ['2023-01']);
  assert.equal(restored.index, 2);
  assert.equal(restored.mode, 'exam');
  assert.equal(restored.startedAt, 12345);
  assert.equal(restored.elapsed, 90);
  assert.equal(raw.ids.length, 5, 'Restoring must not alter the stored input');
});

test('resume bounds navigation and replaces unusable metadata', () => {
  const before = Date.now();
  const restored = restoreSession({ids: ['2023-01'], answers: {}, checked: 'invalid', index: -20, mode: 'unknown', startedAt: Infinity, elapsed: -100, label: 'x'.repeat(200)}, pool);
  assert.equal(restored.index, 0);
  assert.equal(restored.mode, 'practice');
  assert.equal(restored.elapsed, 0);
  assert.deepEqual(restored.checked, []);
  assert.ok(restored.startedAt >= before && restored.startedAt <= Date.now());
  assert.equal(restored.label.length, 100);
  const fallback = restoreSession({ids: ['2023-01'], index: 1.5, elapsed: NaN, label: {}}, pool);
  assert.equal(fallback.index, 0);
  assert.equal(fallback.elapsed, 0);
  assert.equal(fallback.label, 'Resumed practice');
});

test('completed or empty sessions cannot accidentally resume', () => {
  for (const raw of [null, {}, {ids: '2023-01'}, {ids: []}, {ids: ['removed-question']}, {ids: ['2023-01'], completed: true}]) {
    assert.equal(restoreSession(raw, pool), null);
  }
});

test('HTML escaping renders question text and code as text instead of markup', () => {
  assert.equal(escapeHTML('<img src="x" onerror=\'run()\'> & <script>'), '&lt;img src=&quot;x&quot; onerror=&#39;run()&#39;&gt; &amp; &lt;script&gt;');
  assert.equal(escapeHTML('if a < b && b > 0:'), 'if a &lt; b &amp;&amp; b &gt; 0:');
  assert.equal(escapeHTML(null), '');
  assert.equal(escapeHTML(undefined), '');
  assert.equal(escapeHTML(5), '5');
});
