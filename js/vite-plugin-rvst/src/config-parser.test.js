import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseConfigText, generateCargoDeps } from './config-parser.js';

describe('parseConfigText', () => {
  it('parses all sections populated', () => {
    const text = `
export default {
  packages: {
    'svelte': '^4.0.0',
    '@rvst/renderer': '^0.1.0',
  },
  crates: {
    'serde': '1.0',
    'tokio': { version: '1.28', features: ['full', 'macros'] },
  },
  capabilities: ['clipboard', 'fs-read'],
  webFallbacks: {
    'rvst-shell': '@rvst/shell-wasm',
  },
};
`;
    const config = parseConfigText(text);

    assert.deepEqual(config.packages, {
      'svelte': '^4.0.0',
      '@rvst/renderer': '^0.1.0',
    });
    assert.equal(config.crates['serde'], '1.0');
    assert.deepEqual(config.crates['tokio'], { version: '1.28', features: ['full', 'macros'] });
    assert.deepEqual(config.capabilities, ['clipboard', 'fs-read']);
    assert.deepEqual(config.webFallbacks, { 'rvst-shell': '@rvst/shell-wasm' });
  });

  it('parses crate object values with version and features', () => {
    const text = `
export default {
  crates: {
    'wgpu': { version: '0.18', features: ['vulkan', 'metal'] },
    'naga': { version: '0.14', features: ['wgsl'] },
  },
};
`;
    const config = parseConfigText(text);

    assert.deepEqual(config.crates['wgpu'], { version: '0.18', features: ['vulkan', 'metal'] });
    assert.deepEqual(config.crates['naga'], { version: '0.14', features: ['wgsl'] });
  });

  it('returns defaults for missing sections', () => {
    const text = `
export default {
  packages: {
    'svelte': '^4.0.0',
  },
};
`;
    const config = parseConfigText(text);

    assert.deepEqual(config.packages, { 'svelte': '^4.0.0' });
    assert.deepEqual(config.crates, {});
    assert.deepEqual(config.capabilities, []);
    assert.deepEqual(config.webFallbacks, {});
  });

  it('returns all defaults for empty config', () => {
    const text = `export default {};`;
    const config = parseConfigText(text);

    assert.deepEqual(config.packages, {});
    assert.deepEqual(config.crates, {});
    assert.deepEqual(config.capabilities, []);
    assert.deepEqual(config.webFallbacks, {});
  });
});

describe('generateCargoDeps', () => {
  it('generates Cargo.toml dependency lines from string and object specs', () => {
    const crates = {
      'serde': '1.0',
      'tokio': { version: '1.28', features: ['full', 'macros'] },
      'rand': '0.8',
    };
    const output = generateCargoDeps(crates);

    assert.equal(output, [
      'serde = "1.0"',
      'tokio = { version = "1.28", features = ["full", "macros"] }',
      'rand = "0.8"',
    ].join('\n'));
  });

  it('handles empty crates', () => {
    assert.equal(generateCargoDeps({}), '');
  });
});
