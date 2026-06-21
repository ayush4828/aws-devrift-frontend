/**
 * MarkdownRenderer.jsx
 * Lightweight markdown → JSX renderer (no external library needed)
 * Supports: h1-h3, bold, italic, code, bullet/numbered lists, blockquotes, hr, paragraphs
 */

const MarkdownRenderer = ({ content, className = "ai-markdown" }) => {
  if (!content) return null;

  const renderInline = (text) => {
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    text = text.replace(/`(.+?)`/g, '<code>$1</code>');
    return text;
  };

  const lines  = content.split("\n");
  const result = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (/^---+$/.test(line.trim())) {
      result.push(<hr key={i} />);
      i++;
      continue;
    }

    if (line.startsWith("### ")) {
      result.push(
        <h3 key={i} dangerouslySetInnerHTML={{ __html: renderInline(line.slice(4)) }} />
      );
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      result.push(
        <h2 key={i} dangerouslySetInnerHTML={{ __html: renderInline(line.slice(3)) }} />
      );
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      result.push(
        <h1 key={i} dangerouslySetInnerHTML={{ __html: renderInline(line.slice(2)) }} />
      );
      i++;
      continue;
    }

    if (line.startsWith("> ")) {
      result.push(
        <blockquote key={i} dangerouslySetInnerHTML={{ __html: renderInline(line.slice(2)) }} />
      );
      i++;
      continue;
    }



    if (/^[-*] /.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        items.push(
          <li key={i} dangerouslySetInnerHTML={{ __html: renderInline(lines[i].slice(2)) }} />
        );
        i++;
      }
      result.push(<ul key={`ul-${i}`}>{items}</ul>);
      continue;
    }

    if (/^\d+\. /.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(
          <li key={i} dangerouslySetInnerHTML={{ __html: renderInline(lines[i].replace(/^\d+\. /, "")) }} />
        );
        i++;
      }
      result.push(<ol key={`ol-${i}`}>{items}</ol>);
      continue;
    }

    if (line.trim() === "") {
      i++;
      continue;
    }

    result.push(
      <p key={i} dangerouslySetInnerHTML={{ __html: renderInline(line) }} />
    );
    i++;
  }

  return <div className={className}>{result}</div>;
};

export default MarkdownRenderer;
