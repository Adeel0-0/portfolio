import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync, unlinkSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';

// Isolated fixtures never enter the real content tree or deployable artifact.
const repo = process.cwd();
const fixture = resolve('.tools/content-fixture');
// Start empty: a fixture left by an older source layout would keep deleted files.
rmSync(fixture, {recursive:true, force:true});
mkdirSync(fixture, {recursive:true});
for (const dir of ['src','public']) cpSync(join(repo,dir),join(fixture,dir),{recursive:true});
for (const file of ['package.json','tsconfig.json','astro.config.mjs']) cpSync(join(repo,file),join(fixture,file));
const cli = join(repo,'node_modules/astro/bin/astro.mjs');
function astro(command) {
  return spawnSync(process.execPath,[cli,command,'--force'],{cwd:fixture,encoding:'utf8',timeout:120000,env:{...process.env,ASTRO_TELEMETRY_DISABLED:'1'}});
}
const existing = readFileSync(join(fixture,'src/content/projects/sefgh.md'),'utf8');
const invalid = join(fixture,'src/content/projects/sefgh/index.md');
mkdirSync(resolve(invalid,'..'),{recursive:true});
writeFileSync(invalid,existing);
try {
  const collision = astro('sync');
  assert.notEqual(collision.status,0,'Colliding real content filenames must fail validation');
  assert.match(collision.stdout + collision.stderr,/flat lowercase|DuplicateContentEntrySlug|duplicate/i);
} finally { unlinkSync(invalid); }
const malformed = join(fixture,'src/content/projects/UpperCase.md');
writeFileSync(malformed,existing);
try {
  const result = astro('sync');
  assert.notEqual(result.status,0,'Noncanonical filenames must fail instead of silently normalizing');
  assert.match(result.stdout + result.stderr,/flat lowercase/i);
} finally { unlinkSync(malformed); }
writeFileSync(join(fixture,'src/content/projects/evidence-fixture.md'),`---
title: Evidence layout fixture
summary: Synthetic test content, never part of the real portfolio.
description: [Test fixture, Tests image and evidence presentation]
role: Test fixture
status: completed
category: Verification
skills: [Python]
updatedAt: '2026-10-17'
draft: false
diagram: [Input, Output]
media:
  src: /og.png
  alt: Test image with a fully visible caption
metrics:
  - value: Fixture value
    label: Fixture measurement
    method: Synthetic content for responsive testing only.
    measuredAt: '2026-10-17'
    evidence: /resume.pdf
---
## Test case
This entry exists only in the isolated test build.
`);
const build=astro('build');
if(build.status!==0) throw new Error(build.stdout + build.stderr);
const html=readFileSync(join(fixture,'.vercel/output/static/projects/evidence-fixture/index.html'),'utf8');
assert.match(html,/Test image with a fully visible caption/);
assert.match(html,/View supporting evidence/);
console.log('Content build fixtures: collisions and invalid filenames rejected; image/local-evidence case built successfully.');
