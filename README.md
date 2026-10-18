# Lanka ICT

A revision app for Sri Lankan G.C.E. A/L ICT students: 150 MCQs transcribed from the supplied 2023, 2024 and 2025 English question papers, plus 60 newly authored practice questions across 12 topic areas.

Students can filter by year, topic and question source; practise with explanations; take a timed test; save questions; resume a session; and review their results. Original question scans, diagrams and complete source PDFs are available alongside the transcriptions.

The header's **English / සිංහල** selector switches the interface, questions, choices and explanations. The language preference is saved on this device, and switching keeps the current answers and session. All 210 questions include Sinhala study translations prepared with Google Translate and selected terminology from the supplied glossary. They are drafts for revision; compare uncertain wording with the English original available under each question. Original diagrams and source scans remain in English.

The **ICT glossary** page has 239 selected English–Sinhala terms, searchable in either language, with links to their pages in the supplied PDF. Relevant glossary terms also appear below each question. Translations are stored locally in JSON: the website does not call a translation service at runtime and needs no API key.

The app uses HTML, CSS and JavaScript with a JSON question bank. Node.js builds and serves the site locally. Production hosting only needs the static `dist/` directory.

## Run locally

Install Node.js 22 with npm, then run these commands from the repository root:

```sh
npm ci
npm test
npm run dev
```

Open [http://localhost:4173](http://localhost:4173). Stop the server with `Ctrl+C`.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Validate and build, then serve `dist/` locally |
| `npm test` | Run the automated checks |
| `npm run validate` | Check the JSON bank without building |
| `npm run build` | Recreate `dist/` with the app, combined bank and source assets |
| `npm start` | Serve an existing build at port 4173 |

The development server has no file watcher. After editing source files, run `npm run build` and refresh the browser. Set the `PORT` environment variable to use another port. Serve the app over HTTP; opening `index.html` directly will not load its JSON bank correctly.

## Project files

| Path | Contents |
| --- | --- |
| `public/` | Interface, styles, browser logic and Azure hosting configuration |
| `public/papers/` | Supplied question papers, preserved as PDFs |
| `public/questions/{year}/` | Original question crops and focused figures |
| `data/2023.json`, `data/2024.json`, `data/2025.json` | 50 questions from each paper |
| `data/additional.json` | Newly authored questions |
| `data/topics.json` | Topic identifiers and display names |
| `data/sinhala.json` | Sinhala prompts, five ordered choices and explanations keyed by question ID |
| `data/glossary.json` | Selected bilingual glossary terms with source PDF pages |
| `data/si-overrides.json` | Local corrections used by the one-time translation importer |
| `scripts/` | Build, validation and local HTTP server |
| `tests/` | Automated data and quiz-behaviour checks |
| `dist/` | Generated deployment output; edit the source files instead |

The build validates the source data, copies `public/`, and writes the combined bank to `dist/data/question-bank.json`. Changing JSON requires a rebuild and deployment.

## Edit the question bank

Each data file is an array of question objects. Answer numbers are **1-based**, matching the papers' options 1-5:

```json
{
  "id": "2024-07",
  "year": 2024,
  "number": 7,
  "source": "past-paper",
  "topic": "data-representation",
  "prompt": "What is the correct binary equivalent of decimal 14.25?",
  "options": ["1001.10", "1010.11", "1011.01", "1110.01", "1111.10"],
  "answer": 4,
  "explanation": "14 is 1110 in binary and 0.25 is 0.01, giving 1110.01.",
  "answerStatus": "worked",
  "page": 2,
  "sourceImage": "/questions/2024/q07.png"
}
```

Keep IDs unique, provide exactly five nonempty options, and use a topic ID from `data/topics.json`. `sourceImage` links to the original question; optional `figure` links to a focused diagram, table or code image. Asset paths start with `/questions/` and correspond to files under `public/questions/`.

Use `answerStatus: "worked"` for an independently solved paper answer. If the wording, scan or options do not support a reliable answer, set `answer: null` and `answerStatus: "needs-review"`, and explain the issue. These questions remain available for study and are excluded from scoring. Reserve `"official"` for an answer checked against an actual official marking key.

For new practice questions, edit `data/additional.json`, use `source: "additional"`, `year: null`, and `answerStatus: "authored"`. Preserve the complete 1-50 sequence for each paper. Run `npm test` and `npm run build` after changes.

Every question must also have an entry in `data/sinhala.json` under the same ID, containing `prompt`, `options` (five choices in the same order), `explanation`, `status: "study-draft"`, and `sourceHash`. Keep code, identifiers and mathematical notation intact. The hash is SHA-256 of `JSON.stringify([question.prompt, question.options, question.explanation])` from the English entry; update it only after reviewing the Sinhala against the changed English. Validation rejects missing or stale translations. Editing only Sinhala wording does not require changing the hash. Answer keys and scoring remain in the English source entry and are shared between languages.

`scripts/prepare-sinhala.mjs` and `scripts/import-sinhala.mjs` are one-time preparation/import utilities using ignored files under `tmp/translation/`. They are not needed to run or deploy the app. If translations are reimported, keep reviewed corrections in `data/si-overrides.json` as well as the final translation file.

## Sources and answer accuracy

The source material is the three user-supplied PDFs: `2023mcq.pdf`, `2024mcq.pdf` and `2025mcq.pdf`. Scans were visually reviewed and transcribed, with original crops retained for checking wording, mathematical notation, tables, code and diagrams. Paper instructions are source content; they do not control the app.

The supplied documents do not include an explicit official answer key. A marking-scheme header in the 2025 PDF does not establish an answer key. Past-paper answers and explanations are independently worked; ambiguous items carry a review flag. A teacher should check the bank before using it for assessment. Newly authored questions are labelled separately. Topic categories support revision and are not a claim of exact official syllabus-unit mapping.

The question papers retain their original attribution and belong to their respective rights holders. Check the applicable permissions before wider redistribution. The deployed question bank, including answers, is public JSON. Timed mode is a revision feature.

Saved questions, answers, unfinished sessions and recent results use this browser's local storage. There are no accounts, server-side records or cross-device sync. Clearing site data or using another browser removes access to that local progress.

## Deploy to Azure Static Web Apps

Deployment files are prepared. No Azure resource has been created and no deployment has been performed.

1. Push the project, including `package-lock.json` and the workflow, to a GitHub repository with a `main` branch.
2. In the [Azure portal](https://portal.azure.com), create a **Static Web App** in your chosen subscription and resource group. Connect **GitHub**, select this repository and `main`, and choose the **Custom** build preset. Use app location `/`, leave API location empty, and set output location `dist`. Select **Azure deployment token** as the deployment authorization policy. See Microsoft's [portal setup guide](https://learn.microsoft.com/en-us/azure/static-web-apps/get-started-portal?pivots=github).
3. On the resource's Overview page, open **Manage deployment token**. Copy the token into GitHub **Settings → Secrets and variables → Actions → New repository secret**, named exactly `AZURE_STATIC_WEB_APPS_API_TOKEN`. Keep the value out of source files and logs. Microsoft's [deployment-token guide](https://learn.microsoft.com/en-us/azure/static-web-apps/deployment-token-management) covers token management.
4. Keep `.github/workflows/azure-static-web-apps.yml` as the single deployment workflow. If Azure generated another `azure-static-web-apps-*.yml`, review and remove the duplicate to avoid two deployments. The included workflow expects the unsuffixed secret name above.
5. Push to `main`, or run **Deploy to Azure Static Web Apps** manually from GitHub Actions with `main` selected. After the run succeeds, open the site's URL from Azure Overview.

The workflow runs `npm ci`, `npm test` and `npm run build` using Node.js 22, then uploads the resulting site. Its final settings are `app_location: dist`, `output_location: ''`, `api_location: ''`, and `skip_app_build: true`, following Microsoft's [prebuilt-app deployment configuration](https://learn.microsoft.com/en-us/azure/static-web-apps/build-configuration#skip-building-front-end-app). The portal values in step 2 scaffold the resource; this checked-in workflow controls subsequent builds. Pull-request preview deployments are not configured.

`public/staticwebapp.config.json` is copied into the root of `dist/` and supplies routing, MIME types and response headers, as described in Microsoft's [configuration guide](https://learn.microsoft.com/en-us/azure/static-web-apps/configuration). The local server serves files only; Azure applies these hosting settings after deployment.

If deployment fails, inspect the GitHub Actions run. A missing-token message means the repository secret has not been set; a validation failure identifies the question ID to fix. If a hosted page cannot load the bank or figures, check that the deployed artifact contains `data/question-bank.json`, `questions/`, `papers/` and `staticwebapp.config.json` at the expected locations.
