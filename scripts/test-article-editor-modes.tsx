import assert from 'node:assert/strict';
import { rm } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { build } from 'esbuild';
import { JSDOM } from 'jsdom';
import React from 'react';
import { fireEvent, render } from '@testing-library/react';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://portal.test/' });
Object.assign(globalThis, {
  window: dom.window,
  document: dom.window.document,
  Node: dom.window.Node,
  HTMLElement: dom.window.HTMLElement,
  KeyboardEvent: dom.window.KeyboardEvent,
  MouseEvent: dom.window.MouseEvent,
});
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: dom.window.navigator });
globalThis.requestAnimationFrame = callback => setTimeout(callback, 0) as unknown as number;
// jsdom не реализует execCommand; визуальный режим проверяется через правку DOM.
dom.window.document.execCommand = () => true;

const bundle = async (entry: string, name: string) => {
  const outfile = path.resolve(`scripts/.${name}-test-bundle.mjs`);
  await build({
    entryPoints: [path.resolve(entry)],
    bundle: true,
    platform: 'node',
    format: 'esm',
    packages: 'external',
    loader: { '.scss': 'empty' },
    jsx: 'automatic',
    outfile,
  });
  return outfile;
};

const markdownModePath = await bundle(
  'src/features/md-editor/ui/MarkdownMode.tsx',
  'markdown-mode',
);
const visualModePath = await bundle('src/features/md-editor/ui/VisualMode.tsx', 'visual-mode');
const serializerPath = await bundle(
  'src/features/md-editor/lib/htmlToMarkdown.ts',
  'html-to-markdown',
);
const articlePath = await bundle(
  'src/shared/ui/article-content/ArticleContent.tsx',
  'article-content',
);

const { default: MarkdownMode } = await import(markdownModePath);
const { default: VisualMode } = await import(visualModePath);
const { default: htmlToMarkdown } = await import(serializerPath);
const { default: ArticleContent } = await import(articlePath);

const ARTICLE_MARKDOWN = [
  '# Заголовок статьи',
  '',
  'Абзац со **выделением** и [ссылкой](https://letovo.ru/).',
  '',
  '- первый пункт',
  '- второй пункт',
  '',
  '| Модуль | Формат |',
  '| --- | --- |',
  '| Введение | онлайн |',
  '',
  '![Видео](https://cdn.test/clip.mp4)',
  '',
  '[Программа (PDF)](https://cdn.test/program.pdf)',
  '',
  'Это [secret link](https://cdn.test/hidden) внутри текста.',
  '',
].join('\n');

test('режим разметки: панель форматирования вставляет Markdown и отдаёт его наружу', () => {
  let value = 'обычный текст';
  const handleChange = (next: string) => {
    value = next;
  };
  const { getByLabelText, rerender, unmount } = render(
    <MarkdownMode value={value} onChange={handleChange} />,
  );

  const textarea = getByLabelText('Текст статьи в разметке Markdown') as HTMLTextAreaElement;
  textarea.setSelectionRange(0, value.length);
  fireEvent.click(getByLabelText('Жирный (Ctrl+B)'));
  assert.equal(value, '**обычный текст**');

  rerender(<MarkdownMode value={value} onChange={handleChange} />);
  textarea.setSelectionRange(0, 0);
  fireEvent.click(getByLabelText('Маркированный список'));
  assert.ok(value.startsWith('- '), `ожидался список, получено: ${value}`);

  unmount();
});

test('режим разметки: Ctrl+B работает с клавиатуры', () => {
  let value = 'слово';
  const { getByLabelText, unmount } = render(
    <MarkdownMode
      value={value}
      onChange={(next: string) => {
        value = next;
      }}
    />,
  );
  const textarea = getByLabelText('Текст статьи в разметке Markdown') as HTMLTextAreaElement;
  textarea.setSelectionRange(0, 5);
  fireEvent.keyDown(textarea, { key: 'b', ctrlKey: true });
  assert.equal(value, '**слово**');
  unmount();
});

test('визуальный режим: статья открывается как HTML и сохраняется обратно в Markdown', () => {
  let value = ARTICLE_MARKDOWN;
  const { container, unmount } = render(
    <VisualMode
      value={value}
      onChange={(next: string) => {
        value = next;
      }}
      syncKey={1}
    />,
  );

  const editable = container.querySelector('[contenteditable]') as HTMLElement;
  assert.ok(editable, 'редактируемая область должна существовать');
  // Статья пришла из Markdown уже как готовый HTML статьи.
  assert.ok(editable.querySelector('h1'), 'заголовок должен отрендериться');
  assert.ok(editable.querySelector('table'), 'таблица должна отрендериться');
  assert.ok(editable.querySelector('video'), 'видео должно отрендериться');

  const heading = editable.querySelector('h1') as HTMLElement;
  heading.textContent = 'Новый заголовок';
  fireEvent.input(editable);

  assert.match(value, /^# Новый заголовок/m);
  assert.match(value, /\| Модуль \| Формат \|/);
  // Подпись видео переживает круг: alt → aria-label → alt.
  assert.match(value, /!\[Видео\]\(https:\/\/cdn\.test\/clip\.mp4\)/);
  assert.match(value, /\[ссылкой\]\(https:\/\/letovo\.ru\/\)/);
  assert.ok(!/<[a-z]/i.test(value), `в Markdown не должно остаться HTML-тегов: ${value}`);

  unmount();
});

test('сериализатор сохраняет структуру статьи при пересохранении', () => {
  const host = document.createElement('div');
  const { container, unmount } = render(
    <ArticleContent content={ARTICLE_MARKDOWN} interactive={false} />,
  );
  host.innerHTML = container.innerHTML;

  const markdown = htmlToMarkdown(host);
  assert.match(markdown, /^# Заголовок статьи/m);
  assert.match(markdown, /^- первый пункт$/m);
  assert.match(markdown, /\| Введение \| онлайн \|/);
  assert.match(markdown, /\[Программа \(PDF\)\]\(https:\/\/cdn\.test\/program\.pdf\)/);
  assert.match(markdown, /\[secret link\]\(https:\/\/cdn\.test\/hidden\)/);
  unmount();
});

test('превью и опубликованная статья рисуются одним компонентом с одинаковой разметкой', () => {
  const published = render(<ArticleContent content={ARTICLE_MARKDOWN} />);
  const preview = render(<ArticleContent content={ARTICLE_MARKDOWN} interactive={false} />);

  const strip = (html: string) => html.replace(/\s+/g, ' ').trim();
  // В тестах scss-модули пустые, поэтому обёртки со стилевым классом нет —
  // сравниваем сами контейнеры рендера.
  const publishedArticle = published.container;
  const previewArticle = preview.container;

  // Отличается только обёртка-лайтбокс вокруг картинок; текстовая структура совпадает.
  assert.equal(strip(previewArticle.textContent ?? ''), strip(publishedArticle.textContent ?? ''));
  assert.ok(previewArticle.querySelector('table'));
  assert.ok(previewArticle.querySelector('video'));
  assert.equal(
    previewArticle.querySelector('a[href="https://cdn.test/hidden"]')?.textContent,
    'secret link',
  );

  published.unmount();
  preview.unmount();
});

test('опасные адреса не попадают в статью', () => {
  const { container, unmount } = render(
    <ArticleContent content={'[клик](javascript:alert(1))\n\n<img src="x" onerror="alert(1)">'} />,
  );
  const link = container.querySelector('a');
  assert.equal(link?.getAttribute('href'), '#');
  assert.equal(container.querySelector('img[onerror]'), null);
  unmount();
});

test.after(async () => {
  await Promise.all(
    [markdownModePath, visualModePath, serializerPath, articlePath].map(file =>
      rm(file, { force: true }),
    ),
  );
});
