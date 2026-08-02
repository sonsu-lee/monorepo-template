import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));
const garageEndpoint = 'http://garage:3900';
const healthEndpoint = 'http://127.0.0.1:3903/health';
const region = 'garage';
const commandTimeout = 5 * 60 * 1000;

function writeCapturedOutput(result) {
  if (result.stdout) {
    process.stderr.write(result.stdout);
  }

  if (result.stderr) {
    process.stderr.write(result.stderr);
  }
}

function runDocker(args, options = {}) {
  const { allowFailure = false, capture = false, encoding = 'utf8', input } = options;
  const result = spawnSync('docker', args, {
    cwd: repoRoot,
    encoding,
    env: process.env,
    input,
    maxBuffer: 10 * 1024 * 1024,
    stdio: capture ? ['pipe', 'pipe', 'pipe'] : ['ignore', 'inherit', 'inherit'],
    timeout: commandTimeout,
  });

  if (result.error) {
    throw new Error(`Could not run Docker: ${result.error.message}`);
  }

  if (result.status !== 0 && !allowFailure) {
    if (capture) {
      writeCapturedOutput(result);
    }

    throw new Error(`Docker command failed with exit code ${result.status ?? 'unknown'}`);
  }

  return result;
}

function runCompose(args, options) {
  return runDocker(['compose', '--ansi', 'never', ...args], options);
}

function runAws(args, options = {}) {
  return runCompose(
    [
      'run',
      '--rm',
      '--no-deps',
      '-T',
      'aws-cli',
      '--endpoint-url',
      garageEndpoint,
      '--region',
      region,
      '--no-cli-pager',
      ...args,
    ],
    { ...options, capture: true },
  );
}

function getConfiguredBucket() {
  const configResult = runCompose(['--profile', 'tools', 'config', '--format', 'json'], {
    capture: true,
  });
  const config = JSON.parse(configResult.stdout);
  const bucket = config.services?.garage?.environment?.GARAGE_DEFAULT_BUCKET;

  if (typeof bucket !== 'string' || bucket.length === 0) {
    throw new Error('Could not resolve the default Garage bucket from Compose');
  }

  return bucket;
}

async function assertHealthy() {
  let lastError;

  for (let attempt = 0; attempt < 10; attempt += 1) {
    try {
      const response = await fetch(healthEndpoint, {
        signal: AbortSignal.timeout(5_000),
      });

      if (response.ok) {
        return;
      }

      lastError = new Error(`Health endpoint returned HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  const detail = lastError instanceof Error ? `: ${lastError.message}` : '';
  throw new Error(`Garage health check failed${detail}`);
}

async function main() {
  console.log('Validating the Docker Compose configuration...');
  runCompose(['config', '--quiet']);
  const bucket = getConfiguredBucket();

  console.log('Starting Garage and waiting for it to become healthy...');
  runCompose(['up', '--detach', '--wait', 'garage']);
  await assertHealthy();

  const objectKey = `__garage-smoke__/${randomUUID()}.txt`;
  const payload = Buffer.from(`Garage smoke test ${randomUUID()}\n`);
  let objectExists = false;

  console.log(`Checking signed S3 operations against bucket "${bucket}"...`);

  try {
    runAws(['s3', 'cp', '-', `s3://${bucket}/${objectKey}`, '--only-show-errors'], {
      input: payload,
    });
    objectExists = true;

    runAws(['s3api', 'head-object', '--bucket', bucket, '--key', objectKey]);

    const listResult = runAws([
      's3api',
      'list-objects-v2',
      '--bucket',
      bucket,
      '--prefix',
      objectKey,
      '--output',
      'json',
    ]);
    const listedObjects = JSON.parse(listResult.stdout).Contents ?? [];

    if (!listedObjects.some((object) => object.Key === objectKey)) {
      throw new Error('Uploaded object was not returned by list-objects-v2');
    }

    const downloadResult = runAws(
      ['s3', 'cp', `s3://${bucket}/${objectKey}`, '-', '--only-show-errors'],
      { encoding: null },
    );

    if (!downloadResult.stdout.equals(payload)) {
      throw new Error('Downloaded object content did not match the upload');
    }

    runAws(['s3api', 'delete-object', '--bucket', bucket, '--key', objectKey]);
    objectExists = false;

    const deletedHeadResult = runAws(
      ['s3api', 'head-object', '--bucket', bucket, '--key', objectKey],
      { allowFailure: true },
    );

    if (deletedHeadResult.status === 0) {
      throw new Error('Deleted object was still readable');
    }
  } finally {
    if (objectExists) {
      runAws(['s3api', 'delete-object', '--bucket', bucket, '--key', objectKey], {
        allowFailure: true,
      });
    }
  }

  console.log('Garage S3 smoke check passed. Garage is still running.');
}

try {
  await main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  console.error(`Garage S3 smoke check failed: ${detail}`);
  process.exitCode = 1;
}
