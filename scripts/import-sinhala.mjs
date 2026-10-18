import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const {pieces,manifest}=JSON.parse(await readFile('tmp/translation/manifest.json','utf8'));
const batches=JSON.parse(await readFile('tmp/translation/batches.json','utf8'));
const translated=new Map(),missing=[],issues=[];
for(const batch of batches){
 let text;try{text=await readFile(`tmp/translation/output-${String(batch.index).padStart(3,'0')}.txt`,'utf8');}catch{missing.push(batch.index);continue;}
 const matches=[...text.matchAll(/ZXQ(\d{5})QZX/g)];
 if(JSON.stringify(matches.map(m=>Number(m[1])))!==JSON.stringify(batch.ids)){issues.push({batch:batch.index,error:'Incomplete or unexpected question markers'});continue;}
 for(let i=0;i<matches.length;i++){
  const id=Number(matches[i][1]), p=pieces[id];
  let result=text.slice(matches[i].index+matches[i][0].length,matches[i+1]?.index??text.length).trim();
  result=result.replace(/ZXK\s*(\d+)\s*N\s*(\d+)\s*KZX/gi,(_,a,b)=>`ZXK${a}N${b}KZX`);
  const lost=Object.keys(p.restores).filter(token=>!result.includes(token));
  if(lost.length)issues.push({id,text:p.text,result,lost});
  for(let pass=0;pass<3;pass++)for(const [token,value]of Object.entries(p.restores))result=result.replaceAll(token,value);
  const label=p.text.match(/^([A-E])\s*[-–]/)?.[1];
  if(label)result=result.replace(/^(?:[A-E]|ආ|අ|බී|සී|ඩී|ඊ)\s*[-–]/,`${label} -`);
  result=result.replace(/[ \t]{2,}/g,' ');
  if(/ZX[KQ]\d/.test(result))issues.push({id,text:p.text,result,error:'Unresolved protection marker'});
  translated.set(id,result);
 }
}
let overrides={};try{overrides=JSON.parse(await readFile('data/si-overrides.json','utf8'));}catch{}
const overriddenIds=new Set();
for(const [source,text]of Object.entries(overrides)){
 const p=pieces.find(item=>item.text===source);
 if(p){translated.set(p.id,text);overriddenIds.add(p.id);}
}
const remainingIssues=issues.filter(issue=>issue.id===undefined||!overriddenIds.has(issue.id));
await writeFile('tmp/translation/issues.json',JSON.stringify(remainingIssues,null,2));
console.log(`${translated.size} translated lines; ${missing.length} batches pending; ${remainingIssues.length} integrity issues.`);
if(missing.length||remainingIssues.length){console.log('See tmp/translation/issues.json.');process.exitCode=1;}
else{
 const source=(await Promise.all(['2023','2024','2025','additional'].map(y=>readFile(`data/${y}.json`,'utf8').then(JSON.parse)))).flat();
 const line=id=>pieces[id].literal??translated.get(id);
 const field=ids=>ids.map(line).join('\n');
 const questions={};
 for(const q of source){const m=manifest[q.id];questions[q.id]={prompt:field(m.prompt),options:m.options.map(field),explanation:field(m.explanation),sourceHash:createHash('sha256').update(JSON.stringify([q.prompt,q.options,q.explanation])).digest('hex'),status:'study-draft'};}
 await writeFile('data/sinhala.json',JSON.stringify({language:'si',provider:'Google Translate (Classic)',status:'study-draft',glossarySource:'/papers/glossary.pdf',questions},null,2));
 console.log(`Imported Sinhala study translations for ${Object.keys(questions).length} questions.`);
}
