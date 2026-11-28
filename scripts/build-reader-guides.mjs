import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const origin = 'https://www.bangla24.news';
const publishedName = /^[a-z0-9]+(?:-[a-z0-9]+)*\.html$/;
const unpublishedName = /^(?:draft|preview|demo)(?:-|\.html$)/;

function attributes(tag) {
  return Object.fromEntries(
    [...tag.matchAll(/([^\s"'<>/=]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g)]
      .map(([, name, double, single, plain]) => [name.toLowerCase(), double ?? single ?? plain])
  );
}

export function indexableGuidePaths(directory) {
  return readdirSync(directory, { withFileTypes: true })
    .filter(entry => entry.isFile() && publishedName.test(entry.name) && !unpublishedName.test(entry.name))
    .map(({ name }) => {
      const path = '/blog/' + name;
      const html = readFileSync(join(directory, name), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
      const head = html.match(/^[\s\S]*?(?=<body\b)/i)?.[0] ?? html;
      const tags = [...head.matchAll(/<(meta|link)\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi)];
      const metadata = tags.map(([tag, type]) => ({ type: type.toLowerCase(), ...attributes(tag) }));
      const excluded = metadata.some(tag => tag.type === 'meta' &&
        /^(?:robots|[\w-]*bot(?:-[\w-]+)?)$/i.test(tag.name ?? '') &&
        /\b(?:noindex|none)\b/i.test(tag.content ?? ''));
      const canonicals = metadata.filter(tag => tag.type === 'link' &&
        (tag.rel ?? '').toLowerCase().split(/\s+/).includes('canonical'));
      return !excluded && canonicals.length === 1 && canonicals[0].href === origin + path ? path : null;
    })
    .filter(Boolean)
    .sort();
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const paths = indexableGuidePaths(fileURLToPath(new URL('../public/blog/', import.meta.url)));
  writeFileSync(new URL('../lib/reader-guides.generated.ts', import.meta.url),
    '// Generated from published HTML guides by scripts/build-reader-guides.mjs.\n' +
    'export const readerGuidePaths = ' + JSON.stringify(paths, null, 2) + ' as const;\n');
}
