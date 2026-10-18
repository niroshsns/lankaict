import {readFile, access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createHash} from 'node:crypto';
export const root = fileURLToPath(new URL('../', import.meta.url));
export async function readBank() {
  const topics = JSON.parse(await readFile(path.join(root, 'data/topics.json'), 'utf8'));
  const files = ['2023', '2024', '2025', 'additional'];
  const parts = await Promise.all(files.map(f => readFile(path.join(root, `data/${f}.json`), 'utf8').then(JSON.parse)));
  const questions = parts.flat();
  const sinhala = JSON.parse(await readFile(path.join(root,'data/sinhala.json'),'utf8'));
  const glossary = JSON.parse(await readFile(path.join(root,'data/glossary.json'),'utf8'));
  const topicIds = new Set(topics.map(t => t.id));
  const ids = new Set();
  const errors = [];
  if(sinhala.language!=='si'||!sinhala.questions||Object.keys(sinhala.questions).length!==questions.length)errors.push('Sinhala translations must cover the complete bank');
  if(!Array.isArray(glossary.terms)||!glossary.terms.length)errors.push('Glossary terms are missing');
  for(const term of glossary.terms||[]){
    if(!term.en?.trim()||!term.si?.trim()||!Number.isInteger(term.page)||term.page<1||term.page>20)errors.push(`Invalid glossary entry: ${term.en}`);
  }
  for (const q of questions) {
    if (!q.id || ids.has(q.id)) errors.push(`Duplicate or missing ID: ${q.id}`);
    ids.add(q.id);
    const translated=sinhala.questions?.[q.id];
    const fingerprint=createHash('sha256').update(JSON.stringify([q.prompt,q.options,q.explanation])).digest('hex');
    if(!translated||typeof translated.prompt!=='string'||!translated.prompt.trim()||!translated.explanation?.trim()||!Array.isArray(translated.options)||translated.options.length!==5||translated.options.some(o=>typeof o!=='string'||!o.trim()))errors.push(`${q.id}: incomplete Sinhala translation`);
    else {
      if(translated.sourceHash!==fingerprint)errors.push(`${q.id}: Sinhala translation is stale; the English source changed`);
      if(/ZX[KQ]\d/.test([translated.prompt,...translated.options,translated.explanation].join(' ')))errors.push(`${q.id}: unresolved translation marker`);
      q.translations={si:translated};
    }
    if (!topicIds.has(q.topic)) errors.push(`${q.id}: unknown topic ${q.topic}`);
    if (typeof q.prompt !== 'string' || !q.prompt.trim()) errors.push(`${q.id}: missing question`);
    if (!Array.isArray(q.options) || q.options.length !== 5 || q.options.some(o => typeof o !== 'string' || !o.trim())) errors.push(`${q.id}: must have five nonempty options`);
    if (q.answer !== null && (!Number.isInteger(q.answer) || q.answer < 1 || q.answer > 5)) errors.push(`${q.id}: invalid answer`);
    if (!['official', 'worked', 'needs-review', 'authored'].includes(q.answerStatus)) errors.push(`${q.id}: invalid answer status`);
    if ((q.answer === null) !== (q.answerStatus === 'needs-review')) errors.push(`${q.id}: null answers must be marked needs-review`);
    if (!q.explanation?.trim()) errors.push(`${q.id}: missing explanation`);
    if (!['past-paper', 'additional'].includes(q.source)) errors.push(`${q.id}: invalid source`);
    if (q.source === 'past-paper' && (![2023,2024,2025].includes(q.year) || !Number.isInteger(q.page) || q.page < 1 || q.page > 10)) errors.push(`${q.id}: missing paper provenance`);
    if (q.source === 'additional' && (q.year !== null || q.answerStatus !== 'authored')) errors.push(`${q.id}: additional questions require null year and authored status`);
    if (q.figure) {
      if (!/^\/questions\/\d{4}\/[\w.-]+\.(png|webp|jpg)$/.test(q.figure)) errors.push(`${q.id}: invalid figure path`);
      else try {await access(path.join(root, 'public', q.figure));} catch {errors.push(`${q.id}: missing figure ${q.figure}`);}
    }
  }
  for (const year of [2023,2024,2025]) {
    const paper = questions.filter(q => q.year === year);
    if (paper.length !== 50 || new Set(paper.map(q => q.number)).size !== 50 || paper.some(q => q.number < 1 || q.number > 50)) errors.push(`${year}: expected questions 1 through 50 exactly once`);
  }
  if (errors.length) throw new Error(`Question bank validation failed:\n${errors.join('\n')}`);
  return {schemaVersion: 1, title: 'Lanka ICT question bank', language: 'en', availableLanguages:['en','si'], glossary, topics, papers: [2023,2024,2025].map(year => ({year, title: `G.C.E. A/L ICT ${year}`, questionCount: 50, file: `/papers/${year}mcq.pdf`, answerKey: 'independently-worked'})), questions};
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const bank = await readBank();
  console.log(`Validated ${bank.questions.length} questions across ${bank.topics.length} topics.`);
}
