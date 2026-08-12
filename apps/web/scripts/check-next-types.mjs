import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const webRoot = fileURLToPath(new URL('../', import.meta.url));
const oxlintCli = fileURLToPath(
  new URL('../../../node_modules/oxlint/bin/oxlint', import.meta.url),
);
const configPath = fileURLToPath(new URL('../.oxlint-next-typecheck.json', import.meta.url));
const tsconfigPath = fileURLToPath(new URL('../tsconfig.json', import.meta.url));
const validatorPath = fileURLToPath(new URL('../.next/types/validator.ts', import.meta.url));

const result = spawnSync(
  process.execPath,
  [
    oxlintCli,
    `--config=${configPath}`,
    '--no-ignore',
    '-A',
    'all',
    `--tsconfig=${tsconfigPath}`,
    validatorPath,
  ],
  { cwd: webRoot, stdio: 'inherit' },
);

if (result.error !== undefined) {
  throw result.error;
}

process.exitCode = result.status ?? 1;
