import { readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const outputDirectory = new URL('../dist/', import.meta.url);
const serverDirectory = new URL('.ssr/', outputDirectory);
const entryFile = (await readdir(serverDirectory)).find((file) =>
  /^entry-server\.(?:mjs|js)$/.test(file)
);

if (!entryFile) {
  throw new Error('The demo SSR bundle could not be found.');
}

const { render } = await import(pathToFileURL(new URL(entryFile, serverDirectory).pathname).href);
const htmlFile = new URL('index.html', outputDirectory);
const template = await readFile(htmlFile, 'utf8');
const appHtml = render();
const html = template.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

if (html === template) {
  throw new Error('The demo root placeholder could not be found.');
}

await writeFile(htmlFile, html);
await rm(serverDirectory, { recursive: true, force: true });
