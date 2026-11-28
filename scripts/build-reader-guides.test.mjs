import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { indexableGuidePaths } from './build-reader-guides.mjs';

test('new canonical guides are discovered without another list; drafts and aliases stay out', () => {
  const root = mkdtempSync(join(tmpdir(), 'bangla24-guides-'));
  const tag = name => '<link href="https://www.bangla24.news/blog/' + name + '.html" rel="canonical">';
  const put = (name, html) => writeFileSync(join(root, name + '.html'), html);
  try {
    put('existing-guide', tag('existing-guide'));
    put('draft-secret', tag('draft-secret'));
    put('hide-guide', tag('hide-guide') + "<meta content='follow, noindex' name='robots'>");
    put('hidden-from-google', tag('hidden-from-google') + '<meta name=googlebot content=none>');
    put('alternate-guide', tag('existing-guide'));
    put('duplicate-canonical', tag('duplicate-canonical') + tag('existing-guide'));
    put('body-only-link', '<body>' + tag('body-only-link') + '</body>');
    put('commented-out', '<!-- ' + tag('commented-out') + ' -->');
    assert.deepEqual(indexableGuidePaths(root), ['/blog/existing-guide.html']);
    put('new-guide', tag('new-guide'));
    assert.deepEqual(indexableGuidePaths(root), ['/blog/existing-guide.html', '/blog/new-guide.html']);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
