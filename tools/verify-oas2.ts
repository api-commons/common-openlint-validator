// Swagger 2.0 end-to-end check. Builds the "Swagger 2.0" grouping's active ruleset
// the way the app does (catalog openapi rules that apply to oas2 + `extends:
// spectral:oas`), lints through the app's own lint() in src/openlint.ts, and:
//   - lints samples/swagger.yaml (the editor sample) and a clean 2.0 doc,
//   - lints a deliberately bad 2.0 doc and REQUIRES oas2 twin rules to fire,
//   - REQUIRES that no oas3-only catalog rule fires on a 2.0 document.
// Run: npm run verify:oas2
import { readFileSync } from 'node:fs';
import { lint } from '../src/openlint';
import all from '../src/all-rules.json';

const catalog: Record<string, any> = (all as any).openapi;
const engineRule = (r: any) => { const { source, title, reference, prompt, _format, ...rest } = r; return rest; };
const toks = (r: any): string[] => (Array.isArray(r?.formats) ? r.formats.map(String) : []);
const appliesTo2 = (r: any) => { const t = toks(r); return !t.length || t.some((x) => x.includes('oas2')); };

const rules: Record<string, any> = {};
for (const [n, r] of Object.entries<any>(catalog)) {
  if (r.source === 'builtin') continue;
  if (Array.isArray(r.tags) && r.tags.includes('duplicate:true')) continue;
  if (!appliesTo2(r)) continue;
  rules[n] = engineRule(r);
}
const def: any = { extends: 'spectral:oas', rules };
const twins = Object.entries<any>(catalog).filter(([, r]) => toks(r).length === 1 && toks(r)[0] === 'oas2').map(([n]) => n);
const oas3Only = new Set(Object.entries<any>(catalog).filter(([, r]) => toks(r).length && !toks(r).some((t) => t.includes('oas2'))).map(([n]) => n));
console.log(`Swagger 2.0 grouping: ${Object.keys(rules).length} catalog rules active (${twins.length} oas2 twins), ${oas3Only.size} oas3-only excluded.`);

const CLEAN = `swagger: "2.0"
info: {title: Things API, version: "1.0.0", description: A clean 2.0 API, contact: {name: n, url: "https://e.co"}}
host: api.example.org
basePath: /v1
schemes: [https]
consumes: [application/json]
produces: [application/json]
tags: [{name: things, description: things ops}]
paths:
  /things:
    get: {operationId: getThings, summary: List, description: List things, tags: [things], responses: {"200": {description: ok, schema: {$ref: "#/definitions/Thing"}}}}
securityDefinitions: {key: {type: apiKey, name: Authorization, in: header}}
security: [{key: []}]
definitions: {Thing: {type: object, description: a thing, properties: {id: {type: integer}}}}`;
// no basePath, http scheme, no security requirement, basic + query apiKey schemes
const BAD = `swagger: "2.0"
info: {title: t, version: "1"}
host: example.com
schemes: [http]
paths:
  /things:
    get: {responses: {"200": {description: ok}}}
securityDefinitions: {basicAuth: {type: basic}, keyQuery: {type: apiKey, name: api_key, in: query}}`;
// no host, no schemes, no securityDefinitions at all
const BARE = `swagger: "2.0"
info: {title: t, version: "1"}
paths:
  /things:
    get: {responses: {"200": {description: ok}}}`;

let failed = 0;
const docs: Array<[string, string, boolean]> = [
  ['samples/swagger.yaml', readFileSync(new URL('../samples/swagger.yaml', import.meta.url), 'utf8'), false],
  ['CLEAN 2.0', CLEAN, false],
  ['BAD 2.0', BAD, true],
  ['BARE 2.0 (no host/schemes/securityDefinitions)', BARE, true],
];
for (const [label, doc, mustFireTwins] of docs) {
  const { diagnostics: d, error } = await lint(doc, def, 'swagger.yaml');
  if (error) { console.log(`  FAIL ${label}: ${error}`); failed++; continue; }
  const codes = [...new Set(d.map((x: any) => String(x.code)))];
  const fired = codes.filter((c) => twins.includes(c));
  const misfire = codes.filter((c) => oas3Only.has(c));
  const builtinOas2 = codes.filter((c) => /^oas2-/.test(c));
  console.log(`\n${label}: ${d.length} findings`);
  console.log(`  oas2 twins fired: ${fired.length}${fired.length ? ' -> ' + fired.join(', ') : ''}`);
  console.log(`  built-in oas2 rules fired: ${builtinOas2.length}${builtinOas2.length ? ' -> ' + builtinOas2.join(', ') : ''}`);
  if (misfire.length) { console.log(`  FAIL oas3-only rules fired on 2.0: ${misfire.join(', ')}`); failed++; }
  if (mustFireTwins && !fired.length) { console.log('  FAIL expected oas2 twin rules to fire'); failed++; }
}
if (failed) { console.error(`\nverify:oas2 failed (${failed}).`); process.exit(1); }
console.log('\nverify:oas2 OK — Swagger 2.0 lints through the app path; twins fire, no oas3-only misfires.');
