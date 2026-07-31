import { mkdtemp, readdir, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';

const repositoryRoot = new URL('../', import.meta.url).pathname;
const fixture = await mkdtemp(join(tmpdir(), 'react-pixel-ui-next-'));

function run(command, args, cwd = repositoryRoot) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: '1',
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
      name: 'react-pixel-ui-next-smoke',
      private: true,
      scripts: { build: 'next build' },
    })
  );
  run(
    'npm',
    [
      'install',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
      'next@16.2.12',
      'react@19.2.8',
      'react-dom@19.2.8',
      coreArchive,
      reactArchive,
    ],
    fixture
  );

  const appDirectory = join(fixture, 'app');
  await mkdir(appDirectory);
  await writeFile(
    join(appDirectory, 'layout.js'),
    `export default function Layout({ children }) {
      return <html><body>{children}</body></html>;
    }`
  );
  await writeFile(
    join(appDirectory, 'page.js'),
    `import { Pixel } from '@react-pixel-ui/react';
    export default function Page() {
      return <Pixel size={6}><main style={{ background: '#ff8906' }}>Next smoke</main></Pixel>;
    }`
  );

  run('npm', ['run', 'build'], fixture);
  process.stdout.write('Next.js 16 package smoke test passed.\n');
} finally {
  await rm(fixture, { recursive: true, force: true });
}
