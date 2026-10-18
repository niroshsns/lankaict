import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, stat} from 'node:fs/promises';
import path from 'node:path';
import {readBank, root} from '../scripts/validate.mjs';

let bankPromise;
const loadBank = () => bankPromise ??= readBank();
const publicRoot = path.resolve(root, 'public');
const years = [2023, 2024, 2025];

async function asset(url) {
  assert.equal(typeof url, 'string');
  assert.ok(url.startsWith('/'), `Asset must be site-relative: ${url}`);
  assert.ok(!url.includes('\\') && !url.includes('..'), `Unsafe asset reference: ${url}`);
  const filename = path.resolve(publicRoot, `.${url}`);
  const relative = path.relative(publicRoot, filename);
  assert.ok(relative && !relative.startsWith('..') && !path.isAbsolute(relative), `Asset escaped the public directory: ${url}`);
  const metadata = await stat(filename);
  assert.ok(metadata.isFile() && metadata.size > 0, `Asset is empty or is not a file: ${url}`);
  return filename;
}

test('the complete bank loads with unique IDs, meaningful MCQ fields and valid topic references', async () => {
  const bank = await loadBank();
  assert.equal(bank.schemaVersion, 1);
  assert.equal(bank.language, 'en');
  assert.ok(bank.questions.length > 150, 'The bank must include all 150 paper questions and original extra practice');
  const topicIds = new Set(bank.topics.map(t => t.id));
  assert.equal(topicIds.size, bank.topics.length);
  assert.equal(new Set(bank.questions.map(q => q.id)).size, bank.questions.length);
  for (const q of bank.questions) {
    assert.ok(typeof q.id === 'string' && q.id.trim(), 'Every question needs a stable ID');
    assert.ok(topicIds.has(q.topic), `${q.id}: unknown topic`);
    assert.ok(typeof q.prompt === 'string' && q.prompt.trim().length > 0, `${q.id}: missing question text`);
    assert.equal(q.options.length, 5, `${q.id}: five options required`);
    assert.ok(q.options.every(o => typeof o === 'string' && o.trim()), `${q.id}: empty option`);
    assert.ok(typeof q.explanation === 'string' && q.explanation.trim(), `${q.id}: explanation required`);
    assert.ok(['past-paper', 'additional'].includes(q.source), `${q.id}: unknown source`);
  }
});

test('each supplied paper contains questions 1 through 50 exactly once with a consistent year and provenance', async () => {
  const bank = await loadBank();
  for (const year of years) {
    const questions = bank.questions.filter(q => q.source === 'past-paper' && q.year === year);
    assert.equal(questions.length, 50, `${year}: incomplete paper`);
    assert.deepEqual(questions.map(q => q.number).sort((a,b) => a-b), Array.from({length: 50}, (_,i) => i+1));
    for (const q of questions) {
      assert.equal(q.id, `${year}-${String(q.number).padStart(2,'0')}`, `${q.id}: ID disagrees with paper question number`);
      assert.ok(Number.isInteger(q.page) && q.page >= 1 && q.page <= 10, `${q.id}: invalid PDF page`);
      assert.ok(['worked', 'official', 'needs-review'].includes(q.answerStatus), `${q.id}: paper answer mislabelled as original practice`);
      assert.ok(q.sourceImage?.startsWith(`/questions/${year}/`), `${q.id}: original scan missing or belongs to another year`);
    }
  }
  assert.equal(bank.questions.filter(q => q.source === 'past-paper').length, 150);
});

test('answers are one-based, and every unresolved answer is explicitly excluded from grading', async () => {
  const bank = await loadBank();
  for (const q of bank.questions) {
    if (q.answerStatus === 'needs-review') {
      assert.equal(q.answer, null, `${q.id}: an unresolved item must not publish a guessed correct option`);
    } else {
      assert.ok(Number.isInteger(q.answer) && q.answer >= 1 && q.answer <= 5, `${q.id}: invalid correct option`);
      assert.ok(['worked','official','authored'].includes(q.answerStatus), `${q.id}: missing answer provenance`);
    }
  }
});

test('additional questions are labelled original practice, have no invented paper year and cover every topic', async () => {
  const bank = await loadBank();
  const extra = bank.questions.filter(q => q.source === 'additional');
  const paperPrompts = new Set(bank.questions.filter(q => q.source === 'past-paper').map(q => q.prompt.trim().toLocaleLowerCase()));
  assert.ok(extra.length > 0);
  for (const q of extra) {
    assert.equal(q.year, null, `${q.id}: extra practice must not claim a past-paper year`);
    assert.equal(q.answerStatus, 'authored', `${q.id}: extra question answer needs authored provenance`);
    assert.ok(!paperPrompts.has(q.prompt.trim().toLocaleLowerCase()), `${q.id}: extra question exactly duplicates a paper prompt`);
  }
  for (const topic of bank.topics) {
    assert.ok(extra.some(q => q.topic === topic.id), `${topic.id}: extra practice has no coverage`);
  }
});

test('every original scan and figure reference resolves to a nonempty image inside the published site', async () => {
  const bank = await loadBank();
  const images = new Set();
  for (const q of bank.questions) {
    if (q.source === 'past-paper') assert.ok(q.sourceImage, `${q.id}: missing source scan`);
    for (const url of [q.sourceImage, q.figure].filter(Boolean)) images.add(url);
  }
  assert.ok(images.size > 0, 'Original source images must be available');
  await Promise.all([...images].map(async url => {
    const filename = await asset(url);
    const bytes = await readFile(filename);
    if (url.endsWith('.png')) {
      assert.deepEqual([...bytes.subarray(0,8)], [137,80,78,71,13,10,26,10], `Invalid PNG: ${url}`);
      assert.ok(bytes.length > 24 && bytes.readUInt32BE(16) > 0 && bytes.readUInt32BE(20) > 0, `Image has no dimensions: ${url}`);
    } else {
      assert.ok(/\.(jpg|jpeg|webp)$/i.test(url), `Unsupported figure type: ${url}`);
    }
  }));
});

test('source-paper links point to all three supplied PDF files', async () => {
  const bank = await loadBank();
  assert.deepEqual(bank.papers.map(p => p.year).sort(), years);
  for (const paper of bank.papers) {
    assert.equal(paper.questionCount, 50);
    assert.equal(paper.file, `/papers/${paper.year}mcq.pdf`);
    const bytes = await readFile(await asset(paper.file));
    assert.equal(bytes.subarray(0,5).toString(), '%PDF-', `Invalid PDF: ${paper.file}`);
  }
});

