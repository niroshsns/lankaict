// Offline preparation only. This script makes no translation-service requests.
// Protected fragments are restored after the user-authorized translation step.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const questions=(await Promise.all(['2023','2024','2025','additional'].map(y=>readFile(`data/${y}.json`,'utf8').then(JSON.parse)))).flat();
const glossary=JSON.parse(await readFile('data/glossary.json','utf8'));
const direct=new Map(Object.entries({
 'No output':'ප්‍රතිදානයක් නැත','None of the above':'ඉහත කිසිවක් නොවේ','All of the above':'ඉහත සියල්ල',
 'True':'True','False':'False','None':'None','A syntax error occurs':'කාරක රීති දෝෂයක් ඇති වේ',
 'True and False':'True සහ False','False and True':'False සහ True','True and True':'True සහ True','False and False':'False සහ False'
}));
for(const term of glossary.terms)for(const en of [term.en,...(term.aliases||[])])direct.set(en.toLowerCase(),term.si);
const variants=glossary.terms.flatMap(t=>[t.en,...(t.aliases||[])].flatMap(en=>[en,...(!en.endsWith('s')&&!['data','information','hardware','software','output','storage','privacy','latency','syntax'].includes(en)?[en+'s']:[])]).map(en=>({en,si:t.si}))).sort((a,b)=>b.en.length-a.en.length);
const pattern=new RegExp('\\b('+variants.map(t=>t.en.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')\\b','gi');
const terms=new Map(variants.map(t=>[t.en.toLowerCase(),t.si]));
const pieces=[], byText=new Map(), manifest={};
function common(text){
 if(direct.has(text))return direct.get(text);
 if(direct.has(text.toLowerCase()))return direct.get(text.toLowerCase());
 if(text==='I only')return 'I පමණි';
 if(/^P - (?:file|line); Q - (?:file|line); R - (?:break|continue);/.test(text))return text;
 if(/^[A-E](?:\s*,?\s*(?:and\s+)?[A-E])*\s+only$/i.test(text))return text.replace(/\band\b/gi,'සහ').replace(/\bonly\b/gi,'පමණි');
 if(/^All [A-E]/.test(text))return text.replace(/^All /,'සියලු ').replace(/\band\b/g,'සහ');
 if(!/[A-Za-z]{2}/.test(text))return text;
 if(/^(?:True|False|None|TCP|UDP|IP|ARP|HTTP|HTTPS|FTP|SMTP|POP3|IMAP|DNS|DHCP|RAM|ROM|EEPROM|EPROM|OCR|OMR|MICR|CD-R|CD-ROM|SSD|HDD|CPU|ALU|AND|OR|NOT|NAND|NOR|XOR|XNOR|ASCII|EBCDIC|UTF-8|UNICODE)$/i.test(text))return text;
 if(/^\s*(?:SELECT|UPDATE|INSERT|DELETE|CREATE|ALTER|DROP)\b/.test(text)||/^\s*<[a-z!/]/i.test(text))return text;
 if(/^(?:\s+|\s*(?:def |class |for .+\bin\b|while .+:|if .+:|elif .+:|else:|return\b|print\s*\(|#|const\s+|void\s+|pinMode\s*\(|digitalWrite\s*\(|Serial\.|[{};]+$|[A-Za-z_]\w*\s*(?:\[.*?\])?\s*(?:[+*\/%-]?=|\/\/=)(?!=)))/.test(text))return text;
 if(/^\s*[A-Z_][A-Z_0-9]*\s*\([^?]*\)\s*$/.test(text))return text;
 if(/^[\s\dA-Za-z_.,:;'"\[\](){}+*/=<>!&|^%−–→←¬×÷₀-₉²³]+$/.test(text)&&(/(?:==|!=|<=|>=|\/\/|\*\*|\b(?:range|len|int|str|list|print)\s*\()/.test(text)||/^['"\[({]/.test(text)))return text;
 if(/^[ABCXYZFQPRSTY0-9\s()¬̅+·.=→←⊕⊙]+$/.test(text))return text;
 return null;
}
function piece(text){
 if(byText.has(text))return byText.get(text);
 const id=pieces.length, literal=common(text), restores={};
 let prepared=text;
 function protect(value){if(/^ZXK\d+N\d+KZX$/.test(value))return value;const token=`ZXK${id}N${String(Object.keys(restores).length).padStart(4,'0')}KZX`;restores[token]=value;return ` ${token} `;}
 if(literal===null){
   // Protect quoted literals, inline code, identifiers and numerical notation first.
   prepared=prepared.replace(/`[^`]+`|(?:'[^'\n]{1,80}'|"[^"\n]{1,80}")/g,protect);
   prepared=prepared.replace(/\b[A-Za-z_][A-Za-z_0-9]*(?:\([^()\n]*\))|\b[A-Z][A-Z_0-9]{1,}\b|\b[a-z]+[A-Z][A-Za-z0-9_]*\b|\b\w+_\w+\b/g,protect);
   prepared=prepared.replace(/\b[B-Z]\b|\bA\b(?=\s*(?:[=+¬–]|and\b|bits?\b|is\b))/g,protect);
   prepared=prepared.replace(/[−-]?\b\d+(?:\.\d+)*(?:[₀-₉]+)?(?!\w)/g,protect);
   prepared=prepared.replace(pattern,en=>protect(terms.get(en.toLowerCase())));
 }
 pieces.push({id,text,literal,prepared,restores});byText.set(text,id);return id;
}
function field(text){return text.split('\n').map(piece);}
for(const q of questions)manifest[q.id]={prompt:field(q.prompt),options:q.options.map(field),explanation:field(q.explanation)};
const pending=pieces.filter(p=>p.literal===null);
const batches=[];let content='',ids=[];
for(const p of pending){
 const segment=`ZXQ${String(p.id).padStart(5,'0')}QZX\n${p.prepared}\n\n`;
 if(content.length+segment.length>3500&&ids.length){batches.push({index:batches.length,ids,text:content});content='';ids=[];}
 content+=segment;ids.push(p.id);
}
if(ids.length)batches.push({index:batches.length,ids,text:content});
await mkdir('tmp/translation',{recursive:true});
await writeFile('tmp/translation/manifest.json',JSON.stringify({manifest,pieces}));
await writeFile('tmp/translation/batches.json',JSON.stringify(batches));
console.log(`${questions.length} questions, ${pieces.length} unique lines, ${pending.length} lines to translate in ${batches.length} batches.`);

