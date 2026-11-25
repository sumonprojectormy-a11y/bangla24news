// The supported Markdown subset is rendered entirely as React text nodes.
export default function ArticleText({
  text
}: {
  text: string;
}) {
  function inline(line: string) {
    return line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((s, i) => s.startsWith('**') && s.endsWith('**') ? <strong key={i}>
    {s.slice(2, -2)}
  </strong> : s.startsWith('*') && s.endsWith('*') ? <em key={i}>
    {s.slice(1, -1)}
  </em> : s);
  }
  return <div className="prose">
    {text.trim().split(/\n\s*\n/).map((block, i) => {
      const lines = block.split('\n');
      if (lines.every(l => l.startsWith('- '))) return <ul key={i}>
      {lines.map((l, j) => <li key={j}>
        {inline(l.slice(2))}
      </li>)}
    </ul>;
      if (block.startsWith('### ')) return <h3 key={i}>
      {inline(block.slice(4))}
    </h3>;
      if (block.startsWith('## ')) return <h2 key={i}>
      {inline(block.slice(3))}
    </h2>;
      if (block.startsWith('> ')) return <blockquote key={i}>
      {inline(block.slice(2))}
    </blockquote>;
      return <p className="whitespace-pre-line" key={i}>
      {inline(block)}
    </p>;
    })}
  </div>;
}
