import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

describe('shared database command protection', () => {
  it.each(['db:push', 'db:migrate', 'db:reset'])('blocks %s before connecting to the shared database', (command) => {
    const pkg = JSON.parse(readFileSync(resolve('package.json'), 'utf8'));
    expect(pkg.scripts[command]).toBe('node scripts/block-shared-schema-change.cjs');
    const result = spawnSync(process.execPath, [resolve('scripts/block-shared-schema-change.cjs')], {
      encoding: 'utf8',
      env: {},
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('shared database');
    expect(result.stderr).toContain('rimev_');
  });
});
