import {filterQuestions, shuffle, scoreQuiz, restoreSession, escapeHTML as h} from './core.js';
import {uiText, localizeQuestion, localizeInterface, glossaryMatches} from './i18n.js';

const icons = {
  book:'<path d="M3 4h6a3 3 0 0 1 3 3v14a4 4 0 0 0-4-2H3z"/><path d="M21 4h-6a3 3 0 0 0-3 3v14a4 4 0 0 1 4-2h5z"/>',
  practice:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  bookmark:'<path d="M6 3h12v18l-6-4-6 4z"/>',
  chart:'<path d="M4 3v17h17M8 15v-4m5 4V6m5 9v-7"/>',
  folder:'<path d="M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
  left:'<path d="m14 6-6 6 6 6"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  close:'<path d="m6 6 12 12M6 18 18 6"/>',
  external:'<path d="M14 3h7v7m0-7L10 14M9 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-5"/>',
  spark:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z"/>',
  refresh:'<path d="M20 7v5h-5M4 17v-5h5"/><path d="M6 6a8 8 0 0 1 13 3M5 15a8 8 0 0 0 13 3"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/>',
  code:'<path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 20"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>'
};
const icon = (name, cls='') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.book}</svg>`;
const KEY = 'lankaict.v1';
const app = document.querySelector('#app');
let bank, session, result = null, storageAvailable = true, listPage = 1, menuOpen = false;
let page = ['practice','bank','saved','progress','glossary','resources'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'practice';
let stored;
try {stored = JSON.parse(localStorage.getItem(KEY) || '{}');} catch {stored = {}; storageAvailable = false;}
if (!stored || typeof stored !== 'object' || Array.isArray(stored)) stored = {};
let language = stored.language === 'si' ? 'si' : 'en';
let glossarySearch = '';
let saved = Array.isArray(stored.saved) ? stored.saved.filter(id => typeof id === 'string') : [];
let history = Array.isArray(stored.history) ? stored.history.filter(a => a && typeof a === 'object' && Array.isArray(a.ids) && a.answers && typeof a.answers === 'object' && Number.isFinite(a.finishedAt)).slice(0,100) : [];
let filters = {year:'all', topic:'all', source:'all', search:'', savedOnly:false};
let size = 10, mode = 'practice', randomize = true;

function persist() {
  try {localStorage.setItem(KEY, JSON.stringify({saved, history, session, language}));}
  catch {storageAvailable = false;}
}
function toast(message) {
  const el = document.querySelector('#toast');
  el.textContent = uiText(message,language);
  el.classList.add('show');
  clearTimeout(toast.timeout);
  toast.timeout = setTimeout(() => el.classList.remove('show'), 2800);
}
const topic = id => bank.topics.find(t => t.id === id);
const questions = () => session.ids.map(id => bank.questions.find(q => q.id === id)).filter(Boolean);
const current = () => localizeQuestion(questions()[session.index],language);
const sourceLabel = q => q.source === 'additional' ? 'Extra practice' : `${q.year} past paper`;
const answerLabel = q => ({official:'Official answer',worked:'Worked answer',authored:'Practice answer','needs-review':'Answer needs review'}[q.answerStatus]);
const matched = () => filterQuestions(bank.questions, filters, saved);
const date = value => new Intl.DateTimeFormat(language==='si'?'si-LK':'en-GB',{day:'numeric',month:'short',year:'numeric'}).format(new Date(value));
const clock = seconds => `${Math.floor(Math.max(0,seconds)/60).toString().padStart(2,'0')}:${Math.floor(Math.max(0,seconds)%60).toString().padStart(2,'0')}`;
function elapsed() {return Math.max(0, Math.floor((Date.now() - session.startedAt)/1000));}
function timerText() {return clock(session.mode === 'exam' ? Math.max(0, session.ids.length * 144 - elapsed()) : elapsed());}

function createSession(pool = matched(), label) {
  if (!pool.length) {toast('No questions match. Try a different filter.');return;}
  const picked = (randomize ? shuffle(pool) : [...pool]).slice(0, size === 'all' ? pool.length : Number(size));
  session = {ids: picked.map(q => q.id), answers:{}, checked:[], index:0, mode, startedAt:Date.now(), elapsed:0,
    label: label || (filters.topic !== 'all' ? topic(filters.topic).short : filters.year !== 'all' ? `${filters.year} past paper` : 'Mixed practice')};
  result = null;
  persist();
  navigate('practice');
  requestAnimationFrame(() => {
    document.querySelector('#question-title')?.focus({preventScroll:true});
    document.querySelector('.session-section')?.scrollIntoView({block:'start',behavior:'smooth'});
  });
}

function navigate(next) {
  page = next;
  menuOpen = false;
  if (next === 'practice') filters.search = '';
  if (next === 'saved') filters = {year:'all',topic:'all',source:'all',search:'',savedOnly:true};
  if (location.hash !== `#${next}`) historyReplace(next);
  render();
  window.scrollTo({top:0,behavior:'instant'});
}
function historyReplace(next) {window.history.replaceState(null,'',`#${next}`);}
function toggleSaved(id) {
  saved = saved.includes(id) ? saved.filter(s => s !== id) : [...saved,id];
  persist();
  const top = window.scrollY;
  render();
  window.scrollTo(0,top);
  toast(saved.includes(id) ? 'Question saved for later.' : 'Question removed from saved.');
}
function bookmark(q, compact=false) {
  const active = saved.includes(q.id);
  return `<button type="button" class="bookmark ${active ? 'is-saved' : ''} ${compact ? 'compact' : ''}" data-action="save" data-id="${h(q.id)}" aria-label="${active ? 'Unsave' : 'Save'} question ${h(q.id)}" aria-pressed="${active}">${icon('bookmark')}${compact ? '' : `<span>${active ? 'Saved' : 'Save question'}</span>`}</button>`;
}

function shell(content) {
  const navigation = [['practice','practice','Practice'],['bank','grid','Question bank'],['saved','bookmark','Saved questions'],['progress','chart','My progress'],['glossary','book','ICT glossary'],['resources','folder','Source papers']];
  return `<div class="layout ${menuOpen?'menu-open':''}">
    <aside class="sidebar" aria-label="Main navigation">
      <a class="brand" href="#practice"><span class="brand-mark">${icon('book')}</span><span>Lanka<span class="brand-ict">ICT</span><small>LEARN. PRACTISE. PROGRESS.</small></span></a>
      <span class="nav-heading">YOUR WORKSPACE</span>
      <nav>${navigation.map(([key, glyph, label])=>`<a href="#${key}" class="nav-item ${page===key?'active':''}" ${page===key?'aria-current="page"':''}>${icon(glyph)}<span>${label}</span>${key==='saved'&&saved.length?`<span class="nav-count">${saved.length}</span>`:''}</a>`).join('')}</nav>
      <div class="sidebar-note"><span class="little-spark">${icon('spark')}</span><h3>A little, every day.</h3><p>Every question is a step towards feeling ready.</p><a href="#progress">See your progress ${icon('arrow')}</a></div>
      <div class="sidebar-bottom"><span class="flag"><i></i><i></i><i></i></span><span>Made for Sri Lankan<br><strong>A/L ICT students</strong></span></div>
    </aside>
    <div class="workspace">
      <header class="topbar"><div class="topbar-left"><button class="icon-button mobile-menu" data-action="menu" aria-label="Toggle navigation" aria-expanded="${menuOpen}">${icon('menu')}</button><span>G.C.E. Advanced Level</span><span class="topbar-dot">/</span><strong>Information & Communication Technology</strong></div><div class="learner"><span class="medium-label">${language==='si'?'Sinhala study translation':'English medium'}</span><label class="language-control"><span class="sr-only">Language</span><select id="language-select" aria-label="Language"><option value="en" lang="en" ${language==='en'?'selected':''}>English</option><option value="si" lang="si" ${language==='si'?'selected':''}>සිංහල</option></select></label><span class="avatar">AL</span></div></header>
      <main id="main" tabindex="-1">${content}</main>
      <footer><span>Build your confidence, one question at a time.</span><span>${icon('info')} ${storageAvailable?'Progress is saved on this device':'Browser storage unavailable · progress will not be saved'}</span></footer>
    </div>
  </div>`;
}

function filterPanel(practice = false) {
  const available = matched().length;
  return `<section class="filter-panel" aria-label="Question filters"><div class="filter-heading"><span>${icon(practice?'practice':'search')} ${practice?'Make this session yours':'Find your next question'}</span><span class="muted"><strong id="match-count">${available}</strong> ${available===1?'question':'questions'} available</span></div>
  <div class="filters"><label>Paper year<select name="year" id="year-filter"><option value="all">All years</option>${[2025,2024,2023].map(y=>`<option value="${y}" ${String(filters.year)===String(y)?'selected':''}>${y} past paper</option>`).join('')}</select></label>
  <label class="topic-filter">Topic area<select name="topic" id="topic-filter"><option value="all">All topic areas</option>${bank.topics.map(t=>`<option value="${t.id}" ${filters.topic===t.id?'selected':''}>${h(t.short)}</option>`).join('')}</select></label>
  <label>Question source<select name="source" id="source-filter">${[['all','All questions'],['past-paper','Past papers'],['additional','Extra practice']].map(([v,t])=>`<option value="${v}" ${filters.source===v?'selected':''}>${t}</option>`).join('')}</select></label>
  ${practice?`<label class="size-filter">Session length<select name="size" id="size-filter">${[10,20,50,'all'].map(n=>`<option value="${n}" ${String(size)===String(n)?'selected':''}>${n==='all'?'All matching':`${n} questions`}</option>`).join('')}</select></label>`:`<label class="search-filter">Search questions<div class="input-icon">${icon('search')}<input type="search" name="search" id="search-filter" value="${h(filters.search)}" placeholder="Keyword, concept or question ID…" autocomplete="off"></div></label>`}
  </div>${practice?`<div class="filter-bottom"><div class="session-options"><div class="segmented" aria-label="Session mode"><button type="button" data-action="mode" data-mode="practice" class="${mode==='practice'?'selected':''}" aria-pressed="${mode==='practice'}">${icon('book')} Practice</button><button type="button" data-action="mode" data-mode="exam" class="${mode==='exam'?'selected':''}" aria-pressed="${mode==='exam'}">${icon('clock')} Timed test</button></div><label class="checkbox"><input type="checkbox" id="shuffle" ${randomize?'checked':''}> Shuffle questions</label></div><button class="button primary" data-action="start" ${!available?'disabled':''}>Start new session ${icon('arrow')}</button></div>`:''}</section>`;
}

function practiceView() {
  if (result) return resultsView();
  return `<section class="hero"><div><div class="eyebrow"><span></span> A LITTLE PRACTICE. A LOT OF PROGRESS.</div><h1>Small steps.<br><em>Stronger answers.</em></h1><p>Your A/L ICT revision, all in one place. Pick a topic, find your rhythm,<br class="desktop-only"> and turn what you know into confidence.</p></div><div class="hero-facts"><div><strong>${bank.questions.filter(q=>q.source==='past-paper').length}<span>+</span></strong><span>past paper questions</span></div><div><strong>${bank.questions.filter(q=>q.source==='additional').length}</strong><span>extra practice questions</span></div><div><strong>${bank.topics.length}</strong><span>topic areas to explore</span></div></div></section>
    ${filterPanel(true)}
    ${session ? activeSession() : `<div class="empty-state">${icon('practice')}<h2>Your next step starts here</h2><p>Choose your filters and start a session.</p></div>`}
    <section class="topic-section"><div class="section-heading"><div><div class="eyebrow">A FOCUSED LITTLE SESSION</div><h2>Explore by topic</h2></div><a href="#bank" class="text-link">View question bank ${icon('arrow')}</a></div><div class="topic-cards">${bank.topics.map(t=>`<button class="topic-card" data-action="topic" data-topic="${t.id}"><span class="topic-number">${t.unit}</span><span><strong>${h(t.short)}</strong><small>${bank.questions.filter(q=>q.topic===t.id).length} questions</small></span>${icon('arrow')}</button>`).join('')}</div></section>`;
}

function activeSession() {
  const q = current();
  if (!q) return '';
  const checked = session.checked.includes(q.id);
  const selected = session.answers[q.id];
  const verified = Number.isInteger(q.answer) && q.answerStatus !== 'needs-review';
  const progress = Object.keys(session.answers).length;
  return `<section class="session-section"><div class="section-heading"><h2>Your practice space <span class="live-dot"></span></h2><span class="muted">${session.mode==='exam'?'Answers revealed when you finish':'Learn as you go. No pressure.'}</span></div>
  <div class="quiz-layout"><article class="question-card" aria-label="Current question">
    <div class="question-meta"><div><span class="badge paper">${sourceLabel(q)}</span><span class="badge topic">${h(topic(q.topic).short)}</span>${q.answerStatus==='needs-review'?'<span class="badge warning">Needs review · not graded</span>':''}</div>${bookmark(q)}</div>
    <div class="question-index">QUESTION ${String(session.index+1).padStart(2,'0')} <span>OF ${String(session.ids.length).padStart(2,'0')}</span><span class="original-number">${q.source==='past-paper'?`Paper Q${q.number}`:'Additional practice'}</span></div>
    <h3 id="question-title" tabindex="-1">${h(q.prompt)}</h3>
    ${language==='si'?`<p class="translation-note">${icon('info')}${q.isTranslated?'Study translation · compare with the English original.':'Translation not yet available. The English text is shown.'}</p>`:''}
    ${q.figure?`<figure class="question-figure"><img src="${h(q.figure)}" alt="Original question ${q.number} diagram, table or code, with its surrounding context" loading="lazy"><figcaption>Original paper excerpt · ${q.year}, question ${q.number}</figcaption></figure>`:''}
    <fieldset class="answers"><legend class="sr-only">Choose one answer</legend>${q.options.map((option,i)=>{
      const number=i+1;
      const correct=checked&&verified&&number===q.answer;
      const wrong=checked&&verified&&number===selected&&number!==q.answer;
      return `<label class="answer-option ${selected===number?'chosen':''} ${correct?'correct':''} ${wrong?'incorrect':''}"><input type="radio" name="answer" value="${number}" ${selected===number?'checked':''} ${checked?'disabled':''}><span class="option-key">${number}</span><span class="option-text">${h(option)}</span>${correct?icon('check'):wrong?icon('close'):'<span class="radio-circle"></span>'}</label>`;
    }).join('')}</fieldset>
    ${questionLanguageTools(q)}
    ${checked?`<div class="feedback ${!verified?'review':selected===q.answer?'success':'correction'}" role="status"><strong>${icon(!verified?'info':selected===q.answer?'check':'book')}${!verified?'This answer needs a teacher’s review':selected===q.answer?'That’s right. Nicely done!':`Let’s work through this. Answer ${q.answer} is correct.`}</strong><p>${h(q.explanation)}</p><span>${answerLabel(q)}${q.answerStatus==='worked'?' · Independently solved; not an official marking key':''}</span></div>`:''}
    <div class="question-actions"><button class="button quiet" data-action="previous" ${session.index===0?'disabled':''}>${icon('left')} Previous</button><div>${!checked&&session.index<session.ids.length-1?'<button class="button quiet skip" data-action="next">Skip for now</button>':''}${session.mode==='practice'&&!checked?`<button class="button primary" data-action="check" ${!selected?'disabled':''}>Check answer ${icon('check')}</button>`:`<button class="button primary" data-action="${session.index===session.ids.length-1?'finish':'next'}">${session.index===session.ids.length-1?'Finish session':'Next question'} ${icon('arrow')}</button>`}</div></div>
    <div class="question-footnote"><span>${icon('info')} ${session.mode==='exam'?'You can change any answer until you finish.':'Tip: use keys 1–5 to select an answer, then Enter to check.'}</span>${sourceDetails(q)}</div>
  </article>
  <aside class="session-card"><div class="session-card-title"><span>${icon('grid')} This session</span><span class="badge">${session.mode==='exam'?'TIMED':'PRACTICE'}</span></div><h3>${h(session.label)}</h3><div class="session-progress"><span><strong>${progress}</strong> / ${session.ids.length} answered</span><span>${Math.round(progress/session.ids.length*100)}%</span></div><progress value="${progress}" max="${session.ids.length}" aria-label="Questions answered"></progress><div class="question-grid">${questions().map((item,i)=>{
    const done=session.checked.includes(item.id), a=session.answers[item.id], good=done&&item.answer!==null&&item.answerStatus!=='needs-review';
    const state=good?(a===item.answer?'right':'wrong'):a?'answered':'';
    return `<button class="question-number ${state} ${i===session.index?'current':''}" data-action="jump" data-index="${i}" aria-label="Question ${i+1}${a?', answered':''}${done?', checked':''}" ${i===session.index?'aria-current="step"':''}>${i+1}</button>`;
  }).join('')}</div><div class="legend"><span><i class="legend-current"></i>Current</span><span><i class="legend-answered"></i>Answered</span><span><i></i>To do</span></div><div class="timer">${icon('clock')}<span>${session.mode==='exam'?'Time remaining':'Time in this session'}</span><strong id="timer">${timerText()}</strong></div><button class="button outline full" data-action="finish">Finish session ${icon('arrow')}</button><p class="session-note">${session.mode==='exam'?'2 min 24 sec per question. Your test finishes when time runs out.':'Take your time. Your answers are saved as you go.'}</p></aside></div></section>`;
}

function sourceDetails(q) {
  if (!q.sourceImage && q.source !== 'past-paper') return '';
  return `<details class="source-details"><summary>View original ${icon('external')}</summary><div>${q.sourceImage?`<img src="${h(q.sourceImage)}" alt="Original scan of ${q.year} question ${q.number}" loading="lazy">`:''}<a href="/papers/${q.year}mcq.pdf#page=${q.page}" target="_blank" rel="noopener">Open ${q.year} paper · page ${q.page} ${icon('external')}</a></div></details>`;
}

function questionLanguageTools(q,reveal=false) {
  const original=bank.questions.find(item=>item.id===q.id);
  const terms=glossaryMatches(original,bank.glossary?.terms||[]);
  const showExplanation=reveal||session?.mode==='practice'&&session.checked.includes(q.id);
  return `<div class="question-language-tools">${language==='si'?`<details class="english-original"><summary>English original ${icon('book')}</summary><div lang="en" data-question-content><p>${h(original.prompt)}</p><ol>${original.options.map(option=>`<li>${h(option)}</li>`).join('')}</ol>${showExplanation?`<p>${h(original.explanation)}</p>`:''}</div></details>`:''}${terms.length?`<details class="question-terms"><summary>Key ICT terms ${icon('book')}</summary><dl>${terms.map(term=>`<div><dt lang="en">${h(term.en)}</dt><dd lang="si">${h(term.si)}</dd></div>`).join('')}</dl><a href="/papers/glossary.pdf" target="_blank" rel="noopener">Open supplied glossary ${icon('external')}</a></details>`:''}</div>`;
}

function bankView(savedOnly = false) {
  filters.savedOnly = savedOnly;
  const filtered=matched(), perPage=12, pages=Math.max(1,Math.ceil(filtered.length/perPage));
  listPage=Math.min(listPage,pages);
  const items=filtered.slice((listPage-1)*perPage,listPage*perPage).map(q=>localizeQuestion(q,language));
  return `<section class="page-heading"><div class="eyebrow">${savedOnly?'KEEP THE GOOD QUESTIONS CLOSE':'YOUR REVISION LIBRARY'}</div><h1>${savedOnly?'Saved questions':'The question bank'}<span class="title-dot">.</span></h1><p>${savedOnly?'Come back to the questions you want to spend a little more time with.':'Three past papers. More ways to practise. Find a question and make it click.'}</p></section>${filterPanel()}
  <div class="section-heading bank-list-heading"><h2>${filtered.length} ${savedOnly?'saved ':''}${filtered.length===1?'question':'questions'}</h2><button class="button primary small" data-action="practice-filtered" ${!filtered.length?'disabled':''}>Practise these ${icon('arrow')}</button></div>
  <div class="bank-list">${items.length?items.map(q=>`<article class="bank-item"><div class="bank-item-top"><span class="bank-number">${h(q.id)}</span><span class="badge paper">${sourceLabel(q)}</span><span class="badge topic">${h(topic(q.topic).short)}</span>${q.answerStatus==='needs-review'?'<span class="badge warning">Needs review</span>':''}${bookmark(q,true)}</div><h3>${h(q.prompt)}</h3><div class="bank-item-bottom"><span>5 answer choices ${q.figure?'· Includes a figure':''}</span><button class="text-link" data-action="open-question" data-id="${h(q.id)}">Practise question ${icon('arrow')}</button></div></article>`).join(''):`<div class="empty-state">${icon(savedOnly?'bookmark':'search')}<h2>${savedOnly&&!saved.length?'A place for your tricky questions':'No questions found'}</h2><p>${savedOnly&&!saved.length?'Save a question with the bookmark button and find it here.':'Try a different year, topic or search term.'}</p><button class="button outline" data-action="reset-filters">${savedOnly&&!saved.length?'Browse question bank':'Clear filters'}</button></div>`}</div>
  ${pages>1?`<div class="pagination"><button class="button outline" data-action="list-prev" ${listPage===1?'disabled':''}>${icon('left')} Previous</button><span>Page ${listPage} of ${pages}</span><button class="button outline" data-action="list-next" ${listPage===pages?'disabled':''}>Next ${icon('arrow')}</button></div>`:''}`;
}

function finishSession(timedOut = false) {
  if (!session || result) return;
  const qs=questions(), score=scoreQuiz(qs,session.answers);
  result={...session, score, finishedAt:Date.now(), duration:elapsed(), timedOut};
  history=[result,...history].slice(0,100);
  session=null;
  persist();
  render();
  window.scrollTo({top:0,behavior:'smooth'});
}
function resultsView() {
  const qs=result.ids.map(id=>bank.questions.find(q=>q.id===id)).filter(Boolean).map(q=>localizeQuestion(q,language));
  const s=scoreQuiz(qs,result.answers);
  const incorrect=qs.filter(q=>Number.isInteger(q.answer)&&q.answerStatus!=='needs-review'&&result.answers[q.id]!==q.answer);
  return `<section class="page-heading"><div class="eyebrow">ANOTHER STEP FORWARD</div><h1>${result.timedOut?'Time’s up. Let’s review.':'Practice makes progress'}<span class="title-dot">.</span></h1><p>${h(result.label)} · ${date(result.finishedAt)} · ${clock(result.duration||0)}</p></section>
  <section class="result-banner"><div class="score-ring"><strong>${s.possible ? `${s.percent}<small>%</small>` : "—"}</strong><span>${s.possible ? "session score" : "not graded"}</span></div><div><h2>${!s.possible?'This session needs a review.':s.percent>=80?'You’re finding your rhythm.':s.percent>=50?'You’re building a solid foundation.':'Every answer is a chance to learn.'}</h2><p>${s.possible ? `<strong>${s.correct} of ${s.possible}</strong> questions with an answer key answered correctly.` : "No questions in this session can be graded yet."}</p><div class="result-stats"><span><i class="green-dot"></i>${s.correct} correct</span><span><i class="red-dot"></i>${s.incorrect} incorrect</span><span>${s.unanswered} unanswered</span>${s.unverified?`<span>${s.unverified} awaiting review</span>`:''}</div><div class="result-buttons"><button class="button primary" data-action="retry" ${!incorrect.length?'disabled':''}>Practise missed questions ${icon('refresh')}</button><button class="button outline" data-action="back-practice">New session ${icon('arrow')}</button></div></div></section>
  <div class="notice">${icon('info')}<p>Past paper answers are independently worked, unless labelled official. Questions awaiting review are excluded from the score. Additional questions are original practice material.</p></div>
  <div class="section-heading"><h2>Your answer review</h2><span class="muted">${qs.length} ${qs.length===1?'question':'questions'}</span></div><div class="review-list">${qs.map((q,i)=>{
    const a=result.answers[q.id], verified=Number.isInteger(q.answer)&&q.answerStatus!=='needs-review', good=a===q.answer&&verified;
    return `<details class="review-item"><summary><span class="review-status ${!a?'unanswered':!verified?'pending':good?'right':'wrong'}">${!a?'—':!verified?'?':good?icon('check'):icon('close')}</span><span><small>${i+1}. ${sourceLabel(q)} · ${h(topic(q.topic).short)}</small><strong>${h(q.prompt)}</strong></span>${icon('left','chevron')}</summary><div class="review-detail">${q.figure?`<img class="review-figure" src="${h(q.figure)}" alt="Question figure">`:''}<ol>${q.options.map((o,n)=>`<li class="${verified&&n+1===q.answer?'correct-text':''}"><span data-question-content>${h(o)}</span> ${a===n+1?'<span class="badge">Your answer</span>':''}${verified&&n+1===q.answer?' <strong>✓ Correct</strong>':''}</li>`).join('')}</ol><div class="review-explanation"><strong>${answerLabel(q)}</strong><p>${h(q.explanation)}</p></div>${questionLanguageTools(q,true)}${bookmark(q)}${sourceDetails(q)}</div></details>`;
  }).join('')}</div>`;
}

function progressView() {
  const attempts=history.map(a=>({...a,score:scoreQuiz(a.ids.map(id=>bank.questions.find(q=>q.id===id)).filter(Boolean),a.answers)}));
  const totalCorrect=attempts.reduce((n,a)=>n+a.score.correct,0), totalPossible=attempts.reduce((n,a)=>n+a.score.possible,0);
  const attemptedIds=new Set(attempts.flatMap(a=>Object.keys(a.answers)));
  return `<section class="page-heading"><div class="eyebrow">SEE HOW FAR YOU’VE COME</div><h1>Your effort adds up<span class="title-dot">.</span></h1><p>A small record of the questions you’ve tackled and the topics you’re growing in.</p></section><div class="progress-stats"><article><span>Completed sessions</span><strong>${history.length}</strong>${icon('practice')}</article><article><span>Unique questions answered</span><strong>${attemptedIds.size}</strong>${icon('book')}</article><article><span>Overall score</span><strong>${totalPossible?Math.round(totalCorrect/totalPossible*100):0}<small>%</small></strong>${icon('chart')}</article><article><span>Questions saved</span><strong>${saved.length}</strong>${icon('bookmark')}</article></div>
  <div class="progress-layout"><section class="panel"><div class="section-heading"><h2>By topic area</h2><span class="muted">Correct / graded</span></div>${bank.topics.map(t=>{
    let correct=0,total=0;
    attempts.forEach(a=>a.ids.forEach(id=>{const q=bank.questions.find(q=>q.id===id);if(q?.topic===t.id&&q.answer!==null&&q.answerStatus!=='needs-review'){total++;if(a.answers[id]===q.answer)correct++;}}));
    return `<div class="topic-progress"><div><span>${h(t.short)}</span><strong>${correct} / ${total}</strong></div><progress value="${correct}" max="${total||1}" aria-label="${h(t.short)}: ${correct} correct of ${total}"></progress></div>`;
  }).join('')}</section><section class="panel history-panel"><div class="section-heading"><h2>Recent sessions</h2></div>${attempts.length?attempts.slice(0,20).map((a,i)=>`<button class="history-item" data-action="history" data-index="${i}"><span class="history-icon">${icon(a.mode==='exam'?'clock':'book')}</span><span><strong>${h(a.label)}</strong><small>${date(a.finishedAt)} · ${a.ids.length} questions</small></span><strong class="history-score">${a.score.possible ? `${a.score.percent}%` : "—"}</strong>${icon('arrow')}</button>`).join(''):`<div class="empty-state compact-empty">${icon('chart')}<h3>Your story starts with a session</h3><p>Finish a practice session to see your progress here.</p><a href="#practice" class="button primary">Let’s practise ${icon('arrow')}</a></div>`}</section></div><div class="notice">${icon('info')}<p>Progress is stored in this browser. It does not sync between devices. Overall scores include unanswered graded questions in completed sessions.</p></div>`;
}

function glossaryView() {
  const term=glossarySearch.trim().toLocaleLowerCase().normalize('NFC');
  const items=(bank.glossary?.terms||[]).filter(item=>[item.en,item.si,...(item.aliases||[])].join(' ').toLocaleLowerCase().normalize('NFC').includes(term));
  return `<section class="page-heading"><div class="eyebrow">ICT TERMS, IN BOTH LANGUAGES</div><h1>Your ICT word companion<span class="title-dot">.</span></h1><p>Selected terms adapted from the supplied English–Sinhala–Tamil glossary. The original PDF includes additional terms and Tamil equivalents.</p></section><section class="panel glossary-panel"><div class="glossary-toolbar"><label for="glossary-search">Search glossary<input type="search" id="glossary-search" value="${h(glossarySearch)}" placeholder="English or Sinhala term…" autocomplete="off"></label><a class="button outline" href="/papers/glossary.pdf" target="_blank" rel="noopener">Open supplied glossary ${icon('external')}</a></div><div class="section-heading"><h2>Selected glossary terms</h2><span class="muted">${items.length} terms</span></div><div class="glossary-table-wrap"><table class="glossary-table"><thead><tr><th scope="col">English term</th><th scope="col">Sinhala term</th><th scope="col">Source page</th></tr></thead><tbody>${items.map(item=>`<tr><td lang="en">${h(item.en)}</td><td lang="si">${h(item.si)}</td><td><a href="/papers/glossary.pdf#page=${item.page}" target="_blank" rel="noopener">PDF page ${item.page}</a></td></tr>`).join('')}</tbody></table>${!items.length?'<p class="empty-glossary">No glossary terms found.</p>':''}</div></section>`;
}

function resourcesView() {
  const reviewCount=bank.questions.filter(q=>q.answerStatus==='needs-review').length;
  return `<section class="page-heading"><div class="eyebrow">BACK TO THE ORIGINALS</div><h1>The source papers<span class="title-dot">.</span></h1><p>The three papers behind this question bank, kept close for reference.</p></section><div class="paper-cards">${bank.papers.map(p=>`<article class="paper-card"><div class="paper-cover"><span>G.C.E. ADVANCED LEVEL</span><strong>${p.year}</strong><div>Information &<br>Communication Technology</div><span>PAPER I · ENGLISH</span>${icon('book')}</div><div class="paper-content"><h2>${p.year} ICT MCQ paper</h2><p>50 questions · 5 choices per question</p><a class="button outline full" href="${h(p.file)}" target="_blank" rel="noopener">Open original PDF ${icon('external')}</a><button class="text-link" data-action="paper" data-year="${p.year}">Practise this paper ${icon('arrow')}</button></div></article>`).join('')}</div>
  <div class="resource-notes"><section class="panel"><h2>A note on the answers</h2><p>The supplied files contain the question papers, without a separate official answer key. Past paper answers and explanations are independently worked and labelled accordingly.</p><p><strong>${reviewCount} questions need review</strong> because the wording or available options are ambiguous. They can be studied, but do not contribute to your score.</p><p>The 2025 file includes a marking-scheme header; that header alone is not an official answer key. A teacher should review the bank before high-stakes assessment.</p></section><section class="panel"><h2>Built for focused revision</h2><p>Questions are grouped into ${bank.topics.length} topic areas for easier revision. The categories are a study aid, rather than a claim of exact syllabus unit mapping.</p><p>Extra practice questions are newly authored and clearly separated from past papers. Original scans are available beside transcribed questions so you can check diagrams, notation and wording.</p><p>Source papers belong to their respective rights holders. Keep their original attribution when sharing.</p><a href="/data/question-bank.json" download="lanka-ict-question-bank.json" class="text-link">Download the JSON question bank ${icon('download')}</a></section><section class="panel"><h2>English / සිංහල</h2><p>Sinhala translations are study aids prepared with Google Translate and selected glossary terms. Code, identifiers and formulas remain in their original form. Compare any uncertain wording with the English original.</p><a href="#glossary" class="text-link">ICT glossary ${icon('arrow')}</a></section></div>`;
}

function render() {
  if (!bank) return;
  filters.savedOnly=page==='saved';
  app.innerHTML=shell(page==='practice'?practiceView():page==='bank'?bankView():page==='saved'?bankView(true):page==='progress'?progressView():page==='glossary'?glossaryView():resourcesView());
  document.documentElement.lang=language;
  document.querySelector('.skip-link').textContent=uiText('Skip to content',language);
  localizeInterface(app,language);
  document.title=`${uiText({practice:'Practice',bank:'Question bank',saved:'Saved questions',progress:'My progress',resources:'Source papers',glossary:'ICT glossary'}[page],language)} · Lanka ICT`;
}

app.addEventListener('click', e=>{
  const button=e.target.closest('[data-action]');
  if(!button||button.disabled)return;
  const action=button.dataset.action;
  if(action==='save')return toggleSaved(button.dataset.id);
  if(action==='menu'){menuOpen=!menuOpen;return render();}
  if(action==='mode'){mode=button.dataset.mode;return render();}
  if(action==='start'||action==='practice-filtered')return createSession();
  if(action==='topic'){filters={...filters,topic:button.dataset.topic,year:'all',source:'all',savedOnly:false,search:''};return createSession(bank.questions.filter(q=>q.topic===filters.topic));}
  if(action==='paper'){filters={...filters,year:button.dataset.year,source:'past-paper',topic:'all',savedOnly:false,search:''};size=50;mode='practice';randomize=false;return createSession();}
  if(action==='open-question'){const q=bank.questions.find(q=>q.id===button.dataset.id);const oldSize=size;size=1;createSession([q],`${sourceLabel(q)} · Q${q.number}`);size=oldSize;return;}
  if(action==='reset-filters'){filters={year:'all',topic:'all',source:'all',search:'',savedOnly:page==='saved'};listPage=1;if(page==='saved'&&!saved.length)return navigate('bank');return render();}
  if(action==='list-prev'||action==='list-next'){listPage+=action==='list-next'?1:-1;render();return document.querySelector('.bank-list-heading')?.scrollIntoView({behavior:'smooth'});}
  if(action==='history'){result=history[Number(button.dataset.index)];return navigate('practice');}
  if(action==='back-practice'){result=null;render();return;}
  if(action==='retry'){
    const wrong=result.ids.map(id=>bank.questions.find(q=>q.id===id)).filter(q=>q&&q.answer!==null&&q.answerStatus!=='needs-review'&&result.answers[q.id]!==q.answer);
    const oldSize=size;size='all';mode='practice';createSession(wrong,'Missed questions');size=oldSize;return;
  }
  if(!session)return;
  if(action==='finish')return finishSession();
  if(action==='check'){
    const q=current();
    if(session.answers[q.id]&&!session.checked.includes(q.id)){session.checked.push(q.id);persist();render();document.querySelector('.feedback')?.scrollIntoView({block:'nearest',behavior:'smooth'});}
    return;
  }
  if(action==='jump')session.index=Number(button.dataset.index);
  else if(action==='previous')session.index=Math.max(0,session.index-1);
  else if(action==='next')session.index=Math.min(session.ids.length-1,session.index+1);
  else return;
  persist();render();
  document.querySelector('#question-title')?.focus({preventScroll:true});
  document.querySelector('.session-section')?.scrollIntoView({block:'start',behavior:'smooth'});
});

app.addEventListener('change', e=>{
  const el=e.target;
  if(el.id==='language-select'){
    const previousTop=window.scrollY;
    language=el.value==='si'?'si':'en';persist();render();
    window.scrollTo(0,previousTop);document.querySelector('#language-select')?.focus({preventScroll:true});return;
  }
  if(['year-filter','topic-filter','source-filter'].includes(el.id)){
    filters[el.name]=el.value;
    if(el.id==='source-filter'&&el.value==='additional')filters.year='all';
    if(el.id==='year-filter'&&el.value!=='all'&&filters.source==='additional')filters.source='all';
    listPage=1;render();
  }
  if(el.id==='size-filter')size=el.value;
  if(el.id==='shuffle')randomize=el.checked;
  if(el.name==='answer'&&session){const q=current();if(!session.checked.includes(q.id)){session.answers[q.id]=Number(el.value);persist();const scroll=window.scrollY;render();window.scrollTo(0,scroll);document.querySelector(`input[name="answer"][value="${el.value}"]`)?.focus({preventScroll:true});}}
});
let searchTimer;
app.addEventListener('input',e=>{
  if(e.target.id==='glossary-search'){
    const value=e.target.value;
    clearTimeout(searchTimer);
    searchTimer=setTimeout(()=>{glossarySearch=value;render();document.querySelector('#glossary-search')?.focus({preventScroll:true});},180);return;
  }
  if(e.target.id!=='search-filter')return;
  const value=e.target.value,position=e.target.selectionStart;
  clearTimeout(searchTimer);
  searchTimer=setTimeout(()=>{filters.search=value;listPage=1;render();const field=document.querySelector('#search-filter');field?.focus({preventScroll:true});try{field?.setSelectionRange(position,position);}catch{}},180);
});
document.addEventListener('keydown',e=>{
  const focused=document.activeElement;
  const editing=focused?.matches('textarea, select, input:not([type="radio"]), [contenteditable="true"]');
  if(e.ctrlKey||e.metaKey||e.altKey||editing||['BUTTON','SUMMARY','A'].includes(focused?.tagName))return;
  if(page!=='practice'||!session||result)return;
  if(/^[1-5]$/.test(e.key)&&!session.checked.includes(current().id)){
    session.answers[current().id]=Number(e.key);persist();render();e.preventDefault();
  } else if(e.key==='Enter'){
    const action=session.mode==='practice'&&!session.checked.includes(current().id)?'check':session.index===session.ids.length-1?'finish':'next';
    document.querySelector(`[data-action="${action}"]`)?.click();e.preventDefault();
  }
});
window.addEventListener('hashchange',()=>{const next=location.hash.slice(1);if(['practice','bank','saved','progress','glossary','resources'].includes(next))navigate(next);});
window.addEventListener('pagehide',persist);
setInterval(()=>{
  if(!session||result)return;
  if(session.mode==='exam'&&elapsed()>=session.ids.length*144){navigate('practice');finishSession(true);return;}
  const timer=document.querySelector('#timer');if(timer)timer.textContent=timerText();
},1000);

try {
  const response=await fetch('/data/question-bank.json');
  if(!response.ok)throw new Error('Question bank could not be loaded');
  bank=await response.json();
  saved=saved.filter(id=>bank.questions.some(q=>q.id===id));
  history=history.filter(a=>a.ids.every(id=>bank.questions.some(q=>q.id===id)));
  session=restoreSession(stored.session,bank.questions);
  if(!session){session={ids:bank.questions.filter(q=>q.year===2025).slice(0,10).map(q=>q.id),answers:{},checked:[],index:0,mode:'practice',startedAt:Date.now(),elapsed:0,label:'2025 · A fresh start'};persist();}
  render();
} catch(error) {
  app.innerHTML=`<main class="loading"><img src="/favicon.svg" width="52" height="52" alt=""><h1>Let’s get you back to practice.</h1><p>The question bank could not be loaded. Refresh the page to try again.</p><p>For local use, run <code>npm run dev</code> and open the printed address.</p><a class="button primary" href="/">Try again</a></main>`;
  console.error(error);
}
