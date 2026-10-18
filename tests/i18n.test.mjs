import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {readBank,root} from '../scripts/validate.mjs';
import {uiText,localizeQuestion,glossaryMatches} from '../public/i18n.js';
import {filterQuestions,scoreQuiz} from '../public/core.js';
let promise;const bank=()=>promise??=readBank();

test('interface copy and dynamic labels support Sinhala while code and English stay intact',()=>{
  assert.equal(uiText('Practice','en'),'Practice');
  assert.equal(uiText('Practice','si'),'පුහුණුව');
  assert.equal(uiText('2025 past paper','si'),'2025 පසුගිය ප්‍රශ්න පත්‍රය');
  assert.equal(uiText('QUESTION 03','si'),'ප්‍රශ්න 03');
  assert.equal(uiText('  Check answer  ','si'),'  පිළිතුර පරීක්ෂා කරන්න  ');
  assert.equal(uiText('SELECT name FROM Student;','si'),'SELECT name FROM Student;');
  assert.match(uiText('Save question 2025-01','si'),/2025-01/);
});

test('switching content language preserves IDs, choice order, answer keys and source objects',()=>{
  const original={id:'sample',answer:3,options:['a','b','c','d','e'],prompt:'Question',explanation:'Explanation',translations:{si:{prompt:'ප්‍රශ්නය',options:['අ','ආ','ඇ','ඈ','ඉ'],explanation:'පැහැදිලි කිරීම'}}};
  const before=JSON.stringify(original),localized=localizeQuestion(original,'si');
  assert.equal(localizeQuestion(original,'en'),original);
  assert.equal(localized.id,original.id);assert.equal(localized.answer,3);
  assert.deepEqual(localized.options,original.translations.si.options);
  assert.equal(JSON.stringify(original),before);
  assert.equal(localizeQuestion({...original,translations:{}},'si').prompt,'Question');
});

test('all 210 questions include complete Sinhala study translations tied to the current English text',async()=>{
  const b=await bank();
  assert.deepEqual(b.availableLanguages,['en','si']);
  for(const q of b.questions){
    const t=q.translations.si;
    if(/[A-Za-z]/.test(q.prompt))assert.match(t.prompt,/[\u0D80-\u0DFF]/,`${q.id}: prose prompt needs actual Sinhala text`);
    else assert.equal(t.prompt,q.prompt,`${q.id}: a mathematical expression must stay unchanged`);
    assert.equal(t.options.length,5);assert.ok(t.options.every(x=>typeof x==='string'&&x.trim()));
    assert.ok(t.explanation.trim());assert.equal(t.status,'study-draft');
    assert.equal(t.sourceHash,createHash('sha256').update(JSON.stringify([q.prompt,q.options,q.explanation])).digest('hex'));
    assert.doesNotMatch([t.prompt,...t.options,t.explanation].join(' '),/ZX[KQ]\d/);
  }
});

test('Sinhala search and grading use the same questions and one-based answers',async()=>{
  const b=await bank(),q=b.questions.find(x=>x.id==='2025-01');
  const word=q.translations.si.prompt.split(/\s+/).find(x=>/[\u0D80-\u0DFF]/.test(x));
  assert.ok(filterQuestions(b.questions,{search:word}).some(x=>x.id===q.id));
  const answers=Object.fromEntries(b.questions.filter(x=>x.answer!==null).map(x=>[x.id,x.answer]));
  assert.deepEqual(scoreQuiz(b.questions,answers),scoreQuiz(b.questions.map(x=>localizeQuestion(x,'si')),answers));
});

test('SQL, HTML and standalone program lines remain unchanged in Sinhala questions',async()=>{
  const b=await bank();let checked=0;
  const isCode=line=>/^\s*(SELECT|UPDATE|INSERT|DELETE|CREATE|ALTER|DROP)\b/.test(line)||/^\s*<[a-z!/]/i.test(line)||/^P - (?:file|line); Q -/.test(line)||/^\s*(def |for .+\bin\b|while .+:|if .+:|else:|return\b|print\s*\(|const\s+|void\s+|pinMode\s*\(|digitalWrite\s*\()/.test(line);
  for(const q of b.questions){
    for(const [original,translated]of [[q.prompt,q.translations.si.prompt],...q.options.map((x,i)=>[x,q.translations.si.options[i]])]){
      for(const line of original.split('\n').filter(isCode)){
        assert.ok(translated.includes(line),`${q.id}: modified source code ${line}`);checked++;
      }
    }
  }
  assert.ok(checked>=20,'Verify real code-bearing questions, rather than an empty fixture');
  for(const q of b.questions){
    for(const [source,translated]of [[q.prompt,q.translations.si.prompt],...q.options.map((x,i)=>[x,q.translations.si.options[i]]),[q.explanation,q.translations.si.explanation]]){
      for(const label of new Set(source.match(/\b[B-Z]\b/g)||[])){
        const pattern=new RegExp(`\\b${label}\\b`,'g');
        assert.equal((translated.match(pattern)||[]).length,(source.match(pattern)||[]).length,`${q.id}: keep the diagram/statement label ${label}`);
      }
    }
  }
});

test('glossary terms are bilingual, searchable by English aliases and linked to the supplied PDF',async()=>{
  const b=await bank(),terms=b.glossary.terms;
  assert.ok(terms.length>=200);assert.equal(new Set(terms.map(t=>t.en)).size,terms.length);
  for(const term of terms){assert.match(term.si,/[\u0D80-\u0DFF]/);assert.ok(term.page>=1&&term.page<=20);}
  const matches=glossaryMatches({prompt:'What is a primary key in a relational database?',options:['Open-source software']},terms);
  assert.ok(matches.some(t=>t.en==='primary key'));assert.ok(matches.some(t=>t.en==='open source'));
  assert.equal(b.glossary.source.file,'/papers/glossary.pdf');
  assert.ok((await stat(new URL('../public/papers/glossary.pdf',import.meta.url))).size>0);
  const source=JSON.parse(await readFile(new URL('../data/sinhala.json',import.meta.url),'utf8'));
  assert.equal(Object.keys(source.questions).length,b.questions.length);
});
