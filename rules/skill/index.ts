// Vendored from the skill ruleset that shipped with the earlier API Commons linter
// build, which has no OpenLint equivalent. This is now the executable source of truth for
// api-commons:skill; tools/check-skill-sync.mjs keeps the rule catalog in step with it.
import { truthy, pattern, length, schema } from '@openlint/openlint-functions';

// api-commons:skill — governance for agent skills (Anthropic "SKILL.md" Agent Skills).
// The document is parsed by the markdown parser into { frontmatter, body, headings,
// links, code, words }. These rules govern the YAML frontmatter (metadata) and the
// markdown body structure. Run with: openlint lint SKILL.md --ruleset rules/skill/index.ts
//
// Note: rules are intentionally NOT format-scoped — Spectral skips format-scoped rules
// when a document's format is unknown, and a skill is selected by ruleset, not detection.

// Custom function: assert a top-level body section (## Heading) is present.
const headingPresent = (
  input: { headings?: Array<{ text?: string; depth?: number }> } | undefined,
  opts: { name: string; maxDepth?: number },
) => {
  const want = String(opts.name).toLowerCase();
  const max = opts.maxDepth ?? 3;
  const found = (input?.headings ?? []).some((h) => (h.depth ?? 6) <= max && String(h.text ?? '').toLowerCase() === want);
  if (!found) return [{ message: `Skill body should have a "${opts.name}" section (e.g. "## ${opts.name}").` }];
  return undefined;
};

// Custom function: at most one level-1 heading in the body (the frontmatter name is the title).
const atMostOneTitle = (input: { headings?: Array<{ depth?: number }> } | undefined) => {
  const h1 = (input?.headings ?? []).filter((h) => (h.depth ?? 6) === 1);
  if (h1.length > 1) return [{ message: `Skill body should have at most one level-1 heading (found ${h1.length}); use "##" for sections.` }];
  return undefined;
};

const ruleset = {
  documentationUrl: 'https://apicommons.org/rules/',
  rules: {
    'skill-name': {
      description: 'A skill must declare a name in its frontmatter.',
      message: '{{error}}',
      given: '$.frontmatter',
      severity: 'error',
      then: { field: 'name', function: truthy },
    },
    'skill-name-kebab-case': {
      description: 'Skill name should be lower kebab-case (matches the skill directory name).',
      given: "$.frontmatter.name",
      severity: 'warn',
      then: { function: pattern, functionOptions: { match: '^[a-z0-9]+(?:-[a-z0-9]+)*$' } },
    },
    'skill-description': {
      description: 'A skill must declare a description — it is how agents decide when to use the skill.',
      given: '$.frontmatter',
      severity: 'error',
      then: { field: 'description', function: truthy },
    },
    'skill-description-length': {
      description: 'Skill descriptions should be specific enough to drive good selection (at least 40 characters).',
      given: '$.frontmatter.description',
      severity: 'warn',
      then: { function: length, functionOptions: { min: 40, max: 1024 } },
    },
    'skill-license': {
      description: 'A skill should declare a license so consumers know the terms of reuse.',
      given: '$.frontmatter',
      severity: 'warn',
      then: { field: 'license', function: truthy },
    },
    'skill-allowed-tools-array': {
      description: 'If a skill declares allowed-tools, it must be an array of tool names.',
      given: "$.frontmatter['allowed-tools']",
      severity: 'warn',
      then: { function: schema, functionOptions: { schema: { type: 'array', items: { type: 'string' } } } },
    },
    'skill-version-semver': {
      description: 'If a skill declares a version, it should be semantic (e.g. 1.0.0) so consumers can reason about changes.',
      given: '$.frontmatter.version',
      severity: 'warn',
      then: { function: pattern, functionOptions: { match: '^\\d+\\.\\d+\\.\\d+(?:[-+][0-9A-Za-z.-]+)?$' } },
    },
    'skill-body-present': {
      description: 'A skill must have body content, not just frontmatter — the body is the instruction set the agent follows.',
      message: '{{error}}',
      given: '$.words',
      severity: 'error',
      then: { function: schema, functionOptions: { schema: { type: 'integer', minimum: 1 } } },
    },
    'skill-has-usage-section': {
      description: 'A skill body should document how to use it under a "Usage" section.',
      given: '$',
      severity: 'warn',
      then: { function: headingPresent, functionOptions: { name: 'Usage' } },
    },
    'skill-has-examples-section': {
      description: 'A skill body should show concrete examples under an "Examples" section so agents and humans see how to invoke it.',
      given: '$',
      severity: 'info',
      then: { function: headingPresent, functionOptions: { name: 'Examples' } },
    },
    'skill-single-title': {
      description: 'A skill body should have at most one level-1 heading — the frontmatter name is the title; use "##" for sections.',
      given: '$',
      severity: 'warn',
      then: { function: atMostOneTitle },
    },
    'skill-body-length': {
      description: 'Skill bodies should stay focused — very long instructions degrade agent performance (max ~5000 words).',
      given: '$.words',
      severity: 'info',
      then: { function: schema, functionOptions: { schema: { type: 'integer', maximum: 5000 } } },
    },
    'skill-require-allowed-tools': {
      description: 'A skill should declare an `allowed-tools` property listing the tools it needs.',
      message: 'Missing `allowed-tools`.',
      given: '$.frontmatter',
      severity: 'info',
      then: { field: 'allowed-tools', function: truthy },
    },
    'skill-require-metadata': {
      description: 'A skill should declare a `metadata` object.',
      message: 'Missing `metadata`.',
      given: '$.frontmatter',
      severity: 'info',
      then: { field: 'metadata', function: truthy },
    },
    'skill-require-version': {
      description: 'A skill should declare a `version`.',
      message: 'Missing `version`.',
      given: '$.frontmatter',
      severity: 'info',
      then: { field: 'version', function: truthy },
    },
    'skill-description-single-line': {
      description: 'A skill description should be a single line (no embedded line breaks) so it renders cleanly in pickers.',
      message: 'Skill description should be a single line.',
      given: '$.frontmatter.description',
      severity: 'info',
      then: { function: pattern, functionOptions: { notMatch: '\\n' } },
    },
    'skill-metadata-object': {
      description: 'If a skill declares metadata, it should be an object of key/value pairs.',
      message: 'Skill metadata should be an object.',
      given: '$.frontmatter.metadata',
      severity: 'info',
      then: { function: schema, functionOptions: { schema: { type: 'object' } } },
    },
    'skill-name-max-length': {
      description: 'A skill name should be concise (64 characters or fewer).',
      message: 'Skill name should be 64 characters or fewer.',
      given: '$.frontmatter.name',
      severity: 'info',
      then: { function: schema, functionOptions: { schema: { type: 'string', maxLength: 64 } } },
    },
  },
};

export { ruleset as default };
