import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const reactVersion = process.argv[2];

if (!reactVersion) {
  throw new Error('Usage: node scripts/package-smoke.mjs <react-version>');
}

const repositoryRoot = new URL('../', import.meta.url).pathname;
const fixture = await mkdtemp(join(tmpdir(), `react-pixel-ui-react-${reactVersion}-`));

function run(command, args, cwd = repositoryRoot) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      npm_config_cache: join(fixture, '.npm-cache'),
      npm_config_update_notifier: 'false',
    },
  });

  if (result.status !== 0) {
    throw new Error(
      [`${command} ${args.join(' ')} failed`, result.stdout, result.stderr]
        .filter(Boolean)
        .join('\n')
    );
  }
}

async function pack(packageName, packageDirectory) {
  run('pnpm', ['pack', '--pack-destination', fixture], packageDirectory);
  const prefix = packageName.replace('@react-pixel-ui/', 'react-pixel-ui-');
  const archive = (await readdir(fixture)).find(
    (file) => file.startsWith(prefix) && file.endsWith('.tgz')
  );

  assert.ok(archive, `Missing packed archive for ${packageName}`);
  return join(fixture, archive);
}

try {
  const coreArchive = await pack(
    '@react-pixel-ui/core',
    join(repositoryRoot, 'packages/core')
  );
  const reactArchive = await pack(
    '@react-pixel-ui/react',
    join(repositoryRoot, 'packages/react')
  );

  await writeFile(
    join(fixture, 'package.json'),
    JSON.stringify({
      name: 'react-pixel-ui-smoke',
      private: true,
      type: 'module',
    })
  );

  run(
    'npm',
    [
      'install',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
      `react@${reactVersion}`,
      `react-dom@${reactVersion}`,
      coreArchive,
      reactArchive,
    ],
    fixture
  );

  const esmSmoke = `
    import assert from 'node:assert/strict';
    import React from 'react';
    import { renderToString } from 'react-dom/server';
    import { Pixel } from '@react-pixel-ui/react';
    const html = renderToString(
      React.createElement(Pixel, { size: 6 }, React.createElement('div', null, 'smoke'))
    );
    assert.match(html, /smoke/);
  `;
  const cjsSmoke = `
    const assert = require('node:assert/strict');
    const React = require('react');
    const { renderToString } = require('react-dom/server');
    const { Pixel } = require('@react-pixel-ui/react');
    const html = renderToString(
      React.createElement(Pixel, { size: 6 }, React.createElement('div', null, 'smoke'))
    );
    assert.match(html, /smoke/);
  `;

  await writeFile(join(fixture, 'smoke.mjs'), esmSmoke);
  await writeFile(join(fixture, 'smoke.cjs'), cjsSmoke);
  run('node', ['smoke.mjs'], fixture);
  run('node', ['smoke.cjs'], fixture);

  const installedReactDirectory = join(
    fixture,
    'node_modules',
    '@react-pixel-ui',
    'react'
  );
  const installedCoreDirectory = join(
    fixture,
    'node_modules',
    '@react-pixel-ui',
    'core'
  );
  const reactManifest = JSON.parse(
    await readFile(join(installedReactDirectory, 'package.json'), 'utf8')
  );
  const cjsBundle = await readFile(
    join(installedReactDirectory, reactManifest.main),
    'utf8'
  );
  const coreReadme = await readFile(join(installedCoreDirectory, 'README.md'), 'utf8');
  const reactReadme = await readFile(join(installedReactDirectory, 'README.md'), 'utf8');

  assert.match(cjsBundle.slice(0, 80), /["']use client["']/);
  assert.match(coreReadme, /Framework-agnostic pixel-art style engine/);
  assert.doesNotMatch(coreReadme, /### `<Pixel>`/);
  assert.match(reactReadme, /### `<Pixel>`/);
  process.stdout.write(`React ${reactVersion} package smoke test passed.\n`);
} finally {
  await rm(fixture, { recursive: true, force: true });
}
