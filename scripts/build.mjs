import {cp, mkdir, writeFile, rm} from 'node:fs/promises';
import path from 'node:path';
import {readBank, root} from './validate.mjs';
const bank = await readBank();
const out = path.join(root, 'dist');
// This fixed output is inside the project. Never remove any source files.
await rm(out, {recursive: true, force: true});
await mkdir(path.join(out, 'data'), {recursive: true});
await cp(path.join(root, 'public'), out, {recursive: true});
await writeFile(path.join(out, 'data/question-bank.json'), JSON.stringify(bank));
console.log(`Built dist/ with ${bank.questions.length} questions, source PDFs and figures.`);
