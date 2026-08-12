/**
 * Сериализация отредактированного DOM статьи обратно в Markdown.
 *
 * Нужна визуальному режиму редактора: пользователь правит готовую статью, а на
 * сервер по-прежнему уходит `.md`-файл, поэтому старые статьи и API остаются
 * совместимыми.
 */

const BLOCK_TAGS = 'p,h1,h2,h3,h4,h5,h6,ul,ol,table,pre,blockquote,hr,div,img,video';

const children = (node: Node, fn: (child: ChildNode) => string): string =>
  Array.from(node.childNodes).map(fn).join('');

const inline = (node: ChildNode): string => {
  if (node.nodeType === Node.TEXT_NODE) return (node.nodeValue ?? '').replace(/\s+/g, ' ');
  if (node.nodeType !== Node.ELEMENT_NODE) return '';

  const element = node as HTMLElement;
  const tag = element.tagName.toLowerCase();
  const inner = children(element, inline);

  switch (tag) {
    case 'strong':
    case 'b':
      return inner.trim() ? `**${inner.trim()}**` : '';
    case 'em':
    case 'i':
      return inner.trim() ? `*${inner.trim()}*` : '';
    case 'del':
    case 's':
    case 'strike':
      return inner.trim() ? `~~${inner.trim()}~~` : '';
    case 'code':
      return `\`${inner}\``;
    case 'br':
      return '\n';
    case 'img':
      return `![${element.getAttribute('alt') ?? ''}](${element.getAttribute('src') ?? ''})`;
    case 'video': {
      const source = element.querySelector('source');
      const src = element.getAttribute('src') || source?.getAttribute('src') || '';
      return `![${element.getAttribute('aria-label') || 'Video'}](${src})`;
    }
    case 'a':
      return `[${inner.trim() || element.getAttribute('href') || ''}](${element.getAttribute('href') ?? ''})`;
    default:
      return inner;
  }
};

const block = (node: ChildNode): string => {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = (node.nodeValue ?? '').trim();
    return text ? `${text}\n\n` : '';
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return '';

  const element = node as HTMLElement;
  const tag = element.tagName.toLowerCase();

  if (/^h[1-6]$/.test(tag)) {
    return `${'#'.repeat(Number(tag[1]))} ${children(element, inline).trim()}\n\n`;
  }

  // Обёртки (например, div.tableWrapper вокруг таблицы) разбираем как блоки,
  // иначе таблица схлопнется в строку текста.
  if (tag === 'div' && element.querySelector(BLOCK_TAGS)) {
    return children(element, block);
  }

  if (tag === 'p' || tag === 'div') {
    const text = children(element, inline).trim();
    return text ? `${text}\n\n` : '';
  }

  if (tag === 'ul' || tag === 'ol') {
    const items = Array.from(element.children).map(
      (li, index) => `${tag === 'ol' ? `${index + 1}. ` : '- '}${children(li, inline).trim()}`,
    );
    return `${items.join('\n')}\n\n`;
  }

  if (tag === 'blockquote') {
    const inner = children(element, block).trim();
    return `${inner
      .split('\n')
      .map(line => `> ${line}`)
      .join('\n')}\n\n`;
  }

  if (tag === 'pre') {
    return `\`\`\`\n${(element.textContent ?? '').replace(/\n+$/, '')}\n\`\`\`\n\n`;
  }

  if (tag === 'hr') return '---\n\n';
  if (tag === 'img' || tag === 'video') return `${inline(element)}\n\n`;

  if (tag === 'table') {
    let out = '';
    const headCells = Array.from(element.querySelectorAll('thead th'));
    if (headCells.length) {
      out += `| ${headCells.map(cell => children(cell, inline).trim()).join(' | ')} |\n`;
      out += `|${headCells.map(() => ' --- ').join('|')}|\n`;
    }
    Array.from(element.querySelectorAll('tbody tr')).forEach(row => {
      const cells = Array.from((row as HTMLTableRowElement).cells);
      out += `| ${cells.map(cell => children(cell, inline).trim()).join(' | ')} |\n`;
    });
    return `${out}\n`;
  }

  return children(element, block);
};

const htmlToMarkdown = (root: HTMLElement): string =>
  `${children(root, block)
    .replace(/\n{3,}/g, '\n\n')
    .trim()}\n`;

export default htmlToMarkdown;
