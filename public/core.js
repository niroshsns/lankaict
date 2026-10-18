// Pure quiz rules, shared by the UI and the tests. Answers use the papers' 1–5 numbering.
export function filterQuestions(questions, filters = {}, saved = []) {
  const term = (filters.search || '').trim().toLocaleLowerCase();
  const bookmarks = new Set(saved);
  return questions.filter(q =>
    (!filters.year || filters.year === 'all' || String(q.year) === String(filters.year)) &&
    (!filters.topic || filters.topic === 'all' || q.topic === filters.topic) &&
    (!filters.source || filters.source === 'all' || q.source === filters.source) &&
    (!filters.savedOnly || bookmarks.has(q.id)) &&
    (!term || [q.prompt, ...q.options, q.translations?.si?.prompt || '', ...(q.translations?.si?.options || []), q.id, String(q.year ?? 'additional')].join(' ').toLocaleLowerCase().includes(term))
  );
}

export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function scoreQuiz(questions, answers) {
  const score = {total: questions.length, graded: 0, correct: 0, incorrect: 0, unanswered: 0, unverified: 0, percent: 0};
  for (const q of questions) {
    const selected = Number(answers[q.id]);
    if (!Number.isInteger(selected) || selected < 1 || selected > q.options.length) {
      score.unanswered++;
      continue;
    }
    if (!Number.isInteger(q.answer) || q.answerStatus === 'needs-review') {
      score.unverified++;
      continue;
    }
    score.graded++;
    if (q.answer === selected) score.correct++;
    else score.incorrect++;
  }
  // Unanswered questions with an answer key count against the final score.
  const possible = questions.filter(q => Number.isInteger(q.answer) && q.answerStatus !== 'needs-review').length;
  score.possible = possible;
  score.percent = possible ? Math.round(score.correct / possible * 100) : 0;
  return score;
}

export function restoreSession(raw, questions) {
  if (!raw || !Array.isArray(raw.ids) || !raw.ids.length || raw.completed) return null;
  const known = new Map(questions.map(q => [q.id, q]));
  const ids = [...new Set(raw.ids)].filter(id => known.has(id));
  if (!ids.length) return null;
  const answers = {};
  for (const id of ids) {
    const value = Number(raw.answers?.[id]);
    if (Number.isInteger(value) && value >= 1 && value <= known.get(id).options.length) answers[id] = value;
  }
  return {
    ids, answers,
    checked: (Array.isArray(raw.checked) ? raw.checked : []).filter(id => ids.includes(id) && answers[id]),
    index: Math.max(0, Math.min(ids.length - 1, Number.isInteger(raw.index) ? raw.index : 0)),
    mode: raw.mode === 'exam' ? 'exam' : 'practice',
    startedAt: Number.isFinite(raw.startedAt) ? raw.startedAt : Date.now(),
    elapsed: Number.isFinite(raw.elapsed) ? Math.max(0, raw.elapsed) : 0,
    label: typeof raw.label === 'string' ? raw.label.slice(0, 100) : 'Resumed practice'
  };
}

export function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
