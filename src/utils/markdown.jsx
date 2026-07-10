import React from 'react';

/**
 * Parses frontmatter and body from a markdown string.
 * Example structure:
 * ---
 * title: "My Title"
 * date: "2026-07-10"
 * ---
 * Body content here
 */
export function parseMarkdown(mdString) {
  if (!mdString) return { metadata: {}, content: "" };

  const normalized = mdString.replace(/\r\n/g, '\n');
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = normalized.match(frontmatterRegex);

  if (!match) {
    return { metadata: {}, content: normalized };
  }

  const yamlBlock = match[1];
  const content = match[2].trim();
  const metadata = {};

  const lines = yamlBlock.split('\n');
  lines.forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > -1) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();

      // Strip surrounding quotes
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      // Parse arrays (e.g. tags: ["a", "b"])
      if (value.startsWith('[') && value.endsWith(']')) {
        try {
          // Replace single quotes with double quotes for valid JSON
          const jsonVal = value.replace(/'/g, '"');
          value = JSON.parse(jsonVal);
        } catch {
          // Fallback splits
          value = value.slice(1, -1).split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
        }
      }

      metadata[key] = value;
    }
  });

  return { metadata, content };
}

/**
 * Helper to parse inline styles in a string (bold, italic, links, inline code)
 */
function renderInlineFormatting(text) {
  if (typeof text !== 'string') return text;

  // Pattern for links [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  // Pattern for bold **text**
  const boldRegex = /\*\*([^*]+)\*\*/g;
  // Pattern for italic *text*
  const italicRegex = /\*([^*]+)\*/g;
  // Pattern for inline code `code`
  const codeRegex = /`([^`]+)`/g;

  let parts = [{ type: 'text', content: text }];

  // 1. Process Links
  parts = parts.flatMap(part => {
    if (part.type !== 'text') return part;
    const result = [];
    let lastIndex = 0;
    let match;
    linkRegex.lastIndex = 0;

    while ((match = linkRegex.exec(part.content)) !== null) {
      if (match.index > lastIndex) {
        result.push({ type: 'text', content: part.content.substring(lastIndex, match.index) });
      }
      result.push({ type: 'link', text: match[1], url: match[2] });
      lastIndex = linkRegex.lastIndex;
    }
    if (lastIndex < part.content.length) {
      result.push({ type: 'text', content: part.content.substring(lastIndex) });
    }
    return result;
  });

  // 2. Process Bold
  parts = parts.flatMap(part => {
    if (part.type !== 'text') return part;
    const result = [];
    let lastIndex = 0;
    let match;
    boldRegex.lastIndex = 0;

    while ((match = boldRegex.exec(part.content)) !== null) {
      if (match.index > lastIndex) {
        result.push({ type: 'text', content: part.content.substring(lastIndex, match.index) });
      }
      result.push({ type: 'bold', content: match[1] });
      lastIndex = boldRegex.lastIndex;
    }
    if (lastIndex < part.content.length) {
      result.push({ type: 'text', content: part.content.substring(lastIndex) });
    }
    return result;
  });

  // 3. Process Italic
  parts = parts.flatMap(part => {
    if (part.type !== 'text') return part;
    const result = [];
    let lastIndex = 0;
    let match;
    italicRegex.lastIndex = 0;

    while ((match = italicRegex.exec(part.content)) !== null) {
      if (match.index > lastIndex) {
        result.push({ type: 'text', content: part.content.substring(lastIndex, match.index) });
      }
      result.push({ type: 'italic', content: match[1] });
      lastIndex = italicRegex.lastIndex;
    }
    if (lastIndex < part.content.length) {
      result.push({ type: 'text', content: part.content.substring(lastIndex) });
    }
    return result;
  });

  // 4. Process Inline Code
  parts = parts.flatMap(part => {
    if (part.type !== 'text') return part;
    const result = [];
    let lastIndex = 0;
    let match;
    codeRegex.lastIndex = 0;

    while ((match = codeRegex.exec(part.content)) !== null) {
      if (match.index > lastIndex) {
        result.push({ type: 'text', content: part.content.substring(lastIndex, match.index) });
      }
      result.push({ type: 'inline-code', content: match[1] });
      lastIndex = codeRegex.lastIndex;
    }
    if (lastIndex < part.content.length) {
      result.push({ type: 'text', content: part.content.substring(lastIndex) });
    }
    return result;
  });

  // Map to JSX
  return parts.map((part, index) => {
    switch (part.type) {
      case 'bold':
        return <strong key={index}>{part.content}</strong>;
      case 'italic':
        return <em key={index}>{part.content}</em>;
      case 'inline-code':
        return <code key={index} className="inline-code">{part.content}</code>;
      case 'link':
        return (
          <a
            key={index}
            href={part.url}
            target="_blank"
            rel="noopener noreferrer"
            className="markdown-link"
          >
            {part.text}
          </a>
        );
      default:
        return part.content;
    }
  });
}

/**
 * Translates Markdown body content into React components
 */
export function renderMarkdownToJSX(content) {
  if (!content) return null;

  const normalized = content.replace(/\r\n/g, '\n');
  const blocks = [];
  const lines = normalized.split('\n');

  let inCodeBlock = false;
  let codeLang = '';
  let codeLines = [];
  let listItems = [];
  let listType = null; // 'ul' or 'ol'

  const flushList = () => {
    if (listItems.length > 0) {
      const ListTag = listType;
      const currentListItems = [...listItems];
      const currentKey = `list-${blocks.length}`;
      blocks.push(
        <ListTag key={currentKey} className="markdown-list">
          {currentListItems.map((item, idx) => (
            <li key={idx}>{renderInlineFormatting(item)}</li>
          ))}
        </ListTag>
      );
      listItems = [];
      listType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle code blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        const codeText = codeLines.join('\n');
        const currentKey = `code-${blocks.length}`;
        blocks.push(
          <div key={currentKey} className="markdown-code-block-wrapper">
            {codeLang && <div className="code-lang-label">{codeLang}</div>}
            <pre className="markdown-pre">
              <code className={`language-${codeLang || 'text'}`}>{codeText}</code>
            </pre>
          </div>
        );
        codeLines = [];
        codeLang = '';
        inCodeBlock = false;
      } else {
        // Start of code block
        flushList();
        inCodeBlock = true;
        codeLang = line.replace('```', '').trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    const trimmed = line.trim();

    // Handle headings
    if (trimmed.startsWith('#')) {
      flushList();
      if (trimmed.length === 0) continue;

      let level = 0;
      while (trimmed[level] === '#') {
        level++;
      }
      const headerText = trimmed.slice(level).trim();
      const Tag = `h${Math.min(level + 1, 6)}`; // Offset standard headings by 1
      const currentKey = `heading-${blocks.length}`;
      blocks.push(<Tag key={currentKey} className="markdown-heading">{renderInlineFormatting(headerText)}</Tag>);
      continue;
    }

    // Handle Unordered Lists (* or - or +)
    const ulMatch = line.match(/^(\s*)([-*+])\s+(.*)$/);
    if (ulMatch) {
      if (listType === 'ol') {
        flushList();
      }
      listType = 'ul';
      listItems.push(ulMatch[3]);
      continue;
    }

    // Handle Ordered Lists (1. or 2.)
    const olMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);
    if (olMatch) {
      if (listType === 'ul') {
        flushList();
      }
      listType = 'ol';
      listItems.push(olMatch[3]);
      continue;
    }

    // Empty lines trigger block flush/paragraph break
    if (trimmed === '') {
      flushList();
      continue;
    }

    // Normal paragraph text
    if (listType) {
      // Continuation of a list item
      listItems[listItems.length - 1] += ' ' + trimmed;
    } else {
      // Check if the previous block was a paragraph we should append to
      // (to support multi-line paragraphs in markdown)
      if (blocks.length > 0 && blocks[blocks.length - 1].type === 'p') {
        const prevBlock = blocks.pop();
        const combinedText = prevBlock.props.children + ' ' + line;
        blocks.push(
          <p key={prevBlock.key} className="markdown-paragraph">
            {renderInlineFormatting(combinedText)}
          </p>
        );
      } else {
        const currentKey = `p-${blocks.length}`;
        blocks.push(
          <p key={currentKey} className="markdown-paragraph">
            {renderInlineFormatting(line)}
          </p>
        );
      }
    }
  }

  // Flush any final list items
  flushList();

  return <div className="markdown-content">{blocks}</div>;
}
