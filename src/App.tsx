import { FontInspector } from './FontInspector';

const TOKEN_MAP = {
  'Playfair Display': { token: 'font-display', role: 'Display / Heading' },
  'Inter':            { token: 'font-sans',    role: 'UI / Body' },
  'Fira Code':        { token: 'font-mono',    role: 'Code / Data' },
};

export function App() {
  return (
    <div className="demo">
      <header>
        <h1>Font Inspector</h1>
        <p className="lead">
          Hover any element to inspect its computed font properties.
          Press <kbd>Shift+F</kbd> or click <strong>Aa</strong> to toggle.
        </p>
      </header>

      <section>
        <h2>Display heading</h2>
        <p className="sub">Playfair Display · 700</p>
        <p className="body-text">
          The quick brown fox jumps over the lazy dog. Sphinx of black quartz,
          judge my vow. Pack my box with five dozen liquor jugs.
        </p>
      </section>

      <section>
        <h2>UI / Body</h2>
        <p className="sub">Inter · 400 / 600</p>
        <p className="body-text">
          Regular body copy at 16px with a comfortable 1.6 line-height. Ideal
          for long-form reading, descriptions, and interface text.{' '}
          <strong>This is semibold (600) for emphasis.</strong>
        </p>
        <ul>
          <li>List item one</li>
          <li>List item two</li>
          <li>List item three</li>
        </ul>
      </section>

      <section>
        <h2>Code / Mono</h2>
        <p className="sub">Fira Code · 400</p>
        <pre><code>{`const inspect = (el: Element) => {
  const cs = getComputedStyle(el);
  return cs.fontFamily.split(',')[0].trim();
};`}</code></pre>
      </section>

      <section>
        <h2>Mixed weights</h2>
        <p className="sub">Inter at all weights</p>
        <div className="weight-grid">
          {[300, 400, 500, 600, 700].map(w => (
            <div key={w} className="weight-row" style={{ fontWeight: w }}>
              <span className="weight-label">{w}</span>
              <span>The quick brown fox</span>
            </div>
          ))}
        </div>
      </section>

      <FontInspector tokenMap={TOKEN_MAP} />
    </div>
  );
}
