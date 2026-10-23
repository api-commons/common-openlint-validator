// The artifact types the validator supports. Each maps to an APIs.io catalog
// endpoint, a `format` tag used to select rules, a default API Commons ruleset
// (rules/defaults/<id>.yaml), and a starter sample (samples/<id>.yaml).
import { parse as parseYaml } from 'yaml';

export interface ArtifactType {
  id: string; // matches the default-ruleset + sample filename
  label: string;
  endpoint: string; // APIs.io: /api/v1/<endpoint>
  format: string; // format tag used by compiled + default rules
  // For the two OpenAPI artifacts, the major the group targets. Both share the
  // `openapi` format (and its ruleset), but this splits the ruleset into an
  // explicit Swagger 2.0 (oas2) and OpenAPI 3.x (oas3) grouping — used to select
  // which rules apply in both validation and the Rules tab. Rules with no
  // `formats` are format-agnostic and belong to both groups.
  oasVersion?: 'oas2' | 'oas3';
  searchNote?: string; // shown when the catalog has no data for this type yet
}

// Order as requested. OpenAPI 3.x and Swagger 2.0 share the `openapi` format (and
// its ruleset + APIs.io endpoint); the engine auto-detects the document version and
// runs the matching rules, and `oasVersion` makes each an explicit grouping.
export const ARTIFACTS: ArtifactType[] = [
  { id: 'apis-json', label: 'APIs.json', endpoint: 'apis-json', format: 'apis-json' },
  { id: 'openapi', label: 'OpenAPI 3.x', endpoint: 'openapis', format: 'openapi', oasVersion: 'oas3' },
  { id: 'swagger', label: 'Swagger 2.0', endpoint: 'openapis', format: 'openapi', oasVersion: 'oas2' },
  { id: 'mcp', label: 'MCP', endpoint: 'mcp', format: 'mcp', searchNote: 'MCP artifacts will appear here as the APIs.io catalog indexes them.' },
  { id: 'arazzo', label: 'Arazzo', endpoint: 'arazzo', format: 'arazzo' },
  { id: 'asyncapi', label: 'AsyncAPI', endpoint: 'asyncapis', format: 'asyncapi' },
  { id: 'json-schema', label: 'JSON Schema', endpoint: 'json-schemas', format: 'jsonschema' },
  { id: 'json-structure', label: 'JSON Structure', endpoint: 'json-structures', format: 'json-structure' },
  { id: 'json-ld', label: 'JSON-LD', endpoint: 'json-ld', format: 'json-ld' },
  { id: 'plans', label: 'Plans', endpoint: 'plans', format: 'plans' },
  { id: 'rate-limits', label: 'Rate Limits', endpoint: 'rate-limits', format: 'rate-limits' },
  { id: 'finops', label: 'FinOps', endpoint: 'finops', format: 'finops' },
  { id: 'agent-skill', label: 'Agent Skill', endpoint: 'skills', format: 'agent-skill', searchNote: 'Agent skills (SKILL.md) — search GitHub, or APIs.io as it indexes them.' },
];

export const artifactById = (id: string): ArtifactType =>
  ARTIFACTS.find((a) => a.id === id) ?? ARTIFACTS[1];

const defaultFiles = import.meta.glob('../rules/defaults/*.yaml', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const sampleFiles = import.meta.glob('../samples/*.{yaml,md}', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

function byId(files: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [p, raw] of Object.entries(files)) out[p.split('/').pop()!.replace(/\.(ya?ml|md)$/, '')] = raw;
  return out;
}

// id -> default ruleset definition (data form: { extends?, rules? }).
export const DEFAULT_RULESETS: Record<string, any> = {};
for (const [id, raw] of Object.entries(byId(defaultFiles))) DEFAULT_RULESETS[id] = parseYaml(raw) || {};

// id -> starter sample text.
export const SAMPLES: Record<string, string> = byId(sampleFiles);
