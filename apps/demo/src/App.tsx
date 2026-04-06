import { useState } from 'react';
import { Pixel, usePixelRef, PixelButton, PixelConfigProvider } from '@react-pixel-ui/react';
import './App.css';

function App() {
  const [pixelSize, setPixelSize] = useState(6);

  // Playground state
  const [pgPixelSize, setPgPixelSize] = useState(6);
  const [pgBg, setPgBg] = useState('linear-gradient(135deg, #ff6b6b, #4ecdc4)');
  const [pgRadius, setPgRadius] = useState(20);
  const [pgBorder, setPgBorder] = useState(3);
  const [pgBorderColor, setPgBorderColor] = useState('#2d3436');
  const [pgWidth, setPgWidth] = useState(300);
  const [pgHeight, setPgHeight] = useState(120);

  return (
    <PixelConfigProvider config={{ pixelSize }}>
      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">v2.0</div>
        <h1>React Pixel UI</h1>
        <p>
          Wrap any element with <code>&lt;Pixel&gt;</code> and your CSS becomes pixel art.
          Tailwind, inline styles, CSS modules — all supported. No Canvas.
        </p>
        <div className="hero-boxes">
          {[
            { bg: 'linear-gradient(135deg, #ff8906, #e53170)', bc: '#b8441a', label: '<Pixel>' },
            { bg: 'linear-gradient(135deg, #a29bfe, #6c5ce7)', bc: '#4a3580', label: 'Gradient' },
            { bg: 'linear-gradient(135deg, #55efc4, #00b894)', bc: '#007a5e', label: 'Shadow' },
          ].map((item, i) => (
            <Pixel size={pixelSize} key={i}>
              <div style={{
                background: item.bg, border: `3px solid ${item.bc}`, borderRadius: 12,
                width: 140, height: 56,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: 13,
                boxShadow: i === 2 ? '4px 4px 0 rgba(0,0,0,0.3)' : undefined,
              }}>
                {item.label}
              </div>
            </Pixel>
          ))}
        </div>
      </section>

      <div className="container">
        {/* Global pixel size control */}
        <div className="controls">
          <div className="control-item">
            <span>Pixel Size</span>
            <span className="value">{pixelSize}px</span>
            <input type="range" min="2" max="16" value={pixelSize}
              onChange={(e) => setPixelSize(Number(e.target.value))} />
          </div>
        </div>

        {/* Install */}
        <section className="section">
          <div className="section-label">Get Started</div>
          <h2 className="section-title">Installation</h2>
          <div className="code-block">
            <span className="comment"># npm</span>{'\n'}
            npm install @react-pixel-ui/react{'\n\n'}
            <span className="comment"># pnpm</span>{'\n'}
            pnpm add @react-pixel-ui/react{'\n\n'}
            <span className="comment"># yarn</span>{'\n'}
            yarn add @react-pixel-ui/react
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 12 }}>
            Requires React 18+. <code>@react-pixel-ui/core</code> is installed automatically.
          </p>
        </section>

        {/* Primary API */}
        <section className="section">
          <div className="section-label">Primary API</div>
          <h2 className="section-title">&lt;Pixel&gt; — Wrap any element</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
            Wrap any element and its CSS is automatically converted to pixel art.
            Works with inline styles, Tailwind, CSS modules.
          </p>
          <div className="comparison-grid">
            <div className="comparison-card">
              <h3>Original CSS</h3>
              <div style={{
                background: 'linear-gradient(135deg, #ff6b6b, #4ecdc4)',
                border: '4px solid #2d3436', borderRadius: 24,
                width: 260, height: 110,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: 18,
              }}>
                Normal div
              </div>
            </div>
            <div className="comparison-card">
              <h3>Wrapped with &lt;Pixel&gt;</h3>
              <Pixel size={pixelSize}>
                <div style={{
                  background: 'linear-gradient(135deg, #ff6b6b, #4ecdc4)',
                  border: '4px solid #2d3436', borderRadius: 24,
                  width: 260, height: 110,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 18,
                  boxShadow: '6px 6px 0 rgba(0,0,0,0.3)',
                }}>
                  Pixel Art!
                </div>
              </Pixel>
            </div>
          </div>
          <div className="code-block">
            <span className="keyword">import</span> {'{ '}<span className="component">Pixel</span>{' }'} <span className="keyword">from</span> <span className="string">'@react-pixel-ui/react'</span>;{'\n\n'}
            &lt;<span className="component">Pixel</span> <span className="prop">size</span>={'{'}<span className="number">6</span>{'}'}&gt;{'\n'}
            {'  '}&lt;<span className="component">div</span> <span className="prop">style</span>={'{{ '}{'\n'}
            {'    '}background: <span className="string">'linear-gradient(135deg, #ff6b6b, #4ecdc4)'</span>,{'\n'}
            {'    '}borderRadius: <span className="number">24</span>,{'\n'}
            {'    '}border: <span className="string">'4px solid #333'</span>,{'\n'}
            {'  }}'}&gt;{'\n'}
            {'    '}Pixel Art!{'\n'}
            {'  '}&lt;/<span className="component">div</span>&gt;{'\n'}
            &lt;/<span className="component">Pixel</span>&gt;
          </div>
        </section>

        {/* Hook API */}
        <section className="section">
          <div className="section-label">Hook API</div>
          <h2 className="section-title">usePixelRef — Ref-based</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
            For maximum flexibility. Attach to any element without a wrapper.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <RefHookDemo pixelSize={pixelSize} />
          </div>
          <div className="code-block">
            <span className="keyword">const</span> pixelRef = <span className="component">usePixelRef</span>({'{ '}<span className="prop">pixelSize</span>: <span className="number">6</span>{' }'});{'\n\n'}
            &lt;<span className="component">div</span> <span className="prop">ref</span>={'{pixelRef}'}{'\n'}
            {'  '}<span className="prop">style</span>={'{{ '}{'\n'}
            {'    '}background: <span className="string">'linear-gradient(...)'</span>,{'\n'}
            {'    '}borderRadius: <span className="number">20</span>,{'\n'}
            {'    '}border: <span className="string">'3px solid #b8256e'</span>,{'\n'}
            {'  }}'}{'\n'}
            &gt;{'\n'}
            {'  '}Content{'\n'}
            &lt;/<span className="component">div</span>&gt;
          </div>
        </section>

        {/* Playground */}
        <section className="section">
          <div className="section-label">Interactive</div>
          <h2 className="section-title">Playground</h2>
          <div className="playground">
            <div className="playground-preview">
              <Pixel size={pgPixelSize} key={`${pgPixelSize}-${pgBg}-${pgRadius}-${pgBorder}-${pgBorderColor}-${pgWidth}-${pgHeight}`}>
                <div style={{
                  background: pgBg,
                  borderRadius: pgRadius,
                  border: `${pgBorder}px solid ${pgBorderColor}`,
                  width: pgWidth, height: pgHeight,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 16,
                  boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
                }}>
                  Playground
                </div>
              </Pixel>
            </div>
            <div className="playground-controls">
              <label>
                <span>Pixel Size: {pgPixelSize}px</span>
                <input type="range" min="2" max="20" value={pgPixelSize} onChange={e => setPgPixelSize(Number(e.target.value))} />
              </label>
              <label>
                <span>Background</span>
                <select value={pgBg} onChange={e => setPgBg(e.target.value)}>
                  <option value="linear-gradient(135deg, #ff6b6b, #4ecdc4)">Red → Teal</option>
                  <option value="linear-gradient(180deg, #a29bfe, #6c5ce7)">Purple vertical</option>
                  <option value="linear-gradient(45deg, #ff8906, #e53170)">Orange → Pink</option>
                  <option value="linear-gradient(90deg, #55efc4, #0984e3)">Green → Blue</option>
                  <option value="linear-gradient(135deg, #fd79a8, #e84393)">Pink</option>
                  <option value="linear-gradient(135deg, #2d3436, #636e72)">Dark</option>
                  <option value="#ff6b6b">Solid red</option>
                  <option value="#6c5ce7">Solid purple</option>
                  <option value="#00b894">Solid green</option>
                </select>
              </label>
              <label>
                <span>Border Radius: {pgRadius}px</span>
                <input type="range" min="0" max="60" value={pgRadius} onChange={e => setPgRadius(Number(e.target.value))} />
              </label>
              <label>
                <span>Border Width: {pgBorder}px</span>
                <input type="range" min="0" max="12" value={pgBorder} onChange={e => setPgBorder(Number(e.target.value))} />
              </label>
              <label>
                <span>Border Color</span>
                <input type="color" value={pgBorderColor} onChange={e => setPgBorderColor(e.target.value)} />
              </label>
              <label>
                <span>Width: {pgWidth}px</span>
                <input type="range" min="120" max="500" value={pgWidth} onChange={e => setPgWidth(Number(e.target.value))} />
              </label>
              <label>
                <span>Height: {pgHeight}px</span>
                <input type="range" min="40" max="200" value={pgHeight} onChange={e => setPgHeight(Number(e.target.value))} />
              </label>
            </div>
          </div>
        </section>

        {/* Showcase */}
        <section className="section">
          <div className="section-label">Gallery</div>
          <h2 className="section-title">Showcase</h2>
          <div className="showcase-grid">
            {[
              { bg: '#dfe6e9', bc: '#2d3436', r: 16, bw: 3, color: '#2d3436', label: 'Card' },
              { bg: 'linear-gradient(180deg, #a29bfe, #6c5ce7)', bc: '#4a3580', r: 12, bw: 2, color: '#fff', label: 'Purple' },
              { bg: 'linear-gradient(135deg, #fd79a8, #e84393)', bc: '#b8256e', r: 16, bw: 3, color: '#fff', label: 'Pink', shadow: true },
              { bg: 'linear-gradient(135deg, #2d3436, #636e72)', bc: '#636e72', r: 16, bw: 2, color: '#dfe6e9', label: 'Dark', shadow: true },
              { bg: 'linear-gradient(90deg, #55efc4, #0984e3)', bc: '#007a5e', r: 20, bw: 3, color: '#fff', label: 'Ocean' },
              { bg: 'linear-gradient(45deg, #ff8906, #e53170)', bc: '#b8441a', r: 8, bw: 2, color: '#fff', label: 'Sunset' },
              { bg: '#ffeaa7', bc: '#e17055', r: 12, bw: 3, color: '#2d3436', label: 'Warm' },
              { bg: 'linear-gradient(180deg, #74b9ff, #0984e3)', bc: '#0652DD', r: 24, bw: 3, color: '#fff', label: 'Sky' },
            ].map((item, i) => (
              <ShowcaseItem label={item.label} key={i}>
                <Pixel size={pixelSize}>
                  <div style={{
                    background: item.bg, border: `${item.bw}px solid ${item.bc}`,
                    borderRadius: item.r, width: 150, height: 60,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: item.color, fontWeight: 600, fontSize: 13,
                    boxShadow: item.shadow ? '4px 4px 0 rgba(0,0,0,0.3)' : undefined,
                  }}>
                    {item.label}
                  </div>
                </Pixel>
              </ShowcaseItem>
            ))}
          </div>
        </section>

        {/* Buttons */}
        <section className="section">
          <div className="section-label">Components</div>
          <h2 className="section-title">PixelButton</h2>
          <div className="button-row">
            <PixelButton variant="primary" width={140} height={44} borderRadius={8}>Primary</PixelButton>
            <PixelButton variant="secondary" width={140} height={44} borderRadius={8}>Secondary</PixelButton>
            <PixelButton variant="danger" width={140} height={44} borderRadius={8}>Danger</PixelButton>
          </div>
        </section>

        {/* Usage Guide */}
        <section className="section">
          <div className="section-label">Documentation</div>
          <h2 className="section-title">Usage Guide</h2>

          <h3 className="subsection-title">1. Basic Usage</h3>
          <p className="doc-text">
            Wrap any element with <code>&lt;Pixel&gt;</code>. It reads computed CSS and converts
            <code>background</code>, <code>border-radius</code>, <code>border</code>, and <code>box-shadow</code> to pixel art.
          </p>
          <div className="code-block">
            <span className="keyword">import</span> {'{ '}<span className="component">Pixel</span>{' }'} <span className="keyword">from</span> <span className="string">'@react-pixel-ui/react'</span>;{'\n\n'}
            &lt;<span className="component">Pixel</span> <span className="prop">size</span>={'{'}<span className="number">6</span>{'}'}&gt;{'\n'}
            {'  '}&lt;<span className="component">div</span> <span className="prop">className</span>=<span className="string">"your-existing-classes"</span>&gt;{'\n'}
            {'    '}Works with Tailwind, CSS modules, inline styles{'\n'}
            {'  '}&lt;/<span className="component">div</span>&gt;{'\n'}
            &lt;/<span className="component">Pixel</span>&gt;
          </div>

          <h3 className="subsection-title">2. Hook API</h3>
          <p className="doc-text">
            Use <code>usePixelRef</code> when you need a ref-based approach without wrapping.
          </p>
          <div className="code-block">
            <span className="keyword">import</span> {'{ '}<span className="component">usePixelRef</span>{' }'} <span className="keyword">from</span> <span className="string">'@react-pixel-ui/react'</span>;{'\n\n'}
            <span className="keyword">function</span> <span className="component">MyComponent</span>() {'{'}{'\n'}
            {'  '}<span className="keyword">const</span> ref = <span className="component">usePixelRef</span>({'{ '}<span className="prop">pixelSize</span>: <span className="number">6</span>{' }'});{'\n'}
            {'  '}<span className="keyword">return</span> &lt;<span className="component">div</span> <span className="prop">ref</span>={'{ref}'} <span className="prop">style</span>={'{{ ... }}'}&gt;...&lt;/<span className="component">div</span>&gt;{'\n'}
            {'}'}
          </div>

          <h3 className="subsection-title">3. Global Config</h3>
          <p className="doc-text">
            Set defaults for all <code>&lt;Pixel&gt;</code> and <code>usePixelRef</code> instances.
          </p>
          <div className="code-block">
            <span className="keyword">import</span> {'{ '}<span className="component">PixelConfigProvider</span>{' }'} <span className="keyword">from</span> <span className="string">'@react-pixel-ui/react'</span>;{'\n\n'}
            &lt;<span className="component">PixelConfigProvider</span> <span className="prop">config</span>={'{{ '}<span className="prop">pixelSize</span>: <span className="number">6</span>{' }}'}&gt;{'\n'}
            {'  '}&lt;<span className="component">App</span> /&gt;{'\n'}
            &lt;/<span className="component">PixelConfigProvider</span>&gt;
          </div>

          <h3 className="subsection-title">4. Explicit Components</h3>
          <p className="doc-text">
            <code>PixelBox</code> and <code>PixelButton</code> take explicit props instead of reading CSS.
          </p>
          <div className="code-block">
            &lt;<span className="component">PixelBox</span>{'\n'}
            {'  '}<span className="prop">width</span>={'{'}<span className="number">280</span>{'}'} <span className="prop">height</span>={'{'}<span className="number">120</span>{'}'} <span className="prop">pixelSize</span>={'{'}<span className="number">6</span>{'}'}{'\n'}
            {'  '}<span className="prop">borderRadius</span>={'{'}<span className="number">16</span>{'}'} <span className="prop">borderWidth</span>={'{'}<span className="number">3</span>{'}'}{'\n'}
            {'  '}<span className="prop">borderColor</span>=<span className="string">"#333"</span>{'\n'}
            {'  '}<span className="prop">background</span>=<span className="string">"linear-gradient(45deg, #ff6b6b, #4ecdc4)"</span>{'\n'}
            /&gt;
          </div>
        </section>

        {/* How it works */}
        <section className="section">
          <div className="section-label">Under the hood</div>
          <h2 className="section-title">How it works</h2>
          <div className="features-grid">
            <FeatureCard icon="auto" title="Auto-detection" desc="getComputedStyle reads your CSS. Tailwind, inline, CSS modules — all work." />
            <FeatureCard icon="clip" title="Staircase Corners" desc="clip-path: polygon() via Bresenham circle algorithm." />
            <FeatureCard icon="image" title="Pixel Gradients" desc="Tiny BMP + image-rendering: pixelated. True square blocks." />
            <FeatureCard icon="shadow" title="Hard Shadows" desc="drop-shadow(blur=0) follows the clip-path contour." />
            <FeatureCard icon="observe" title="Live Updates" desc="MutationObserver + ResizeObserver track style changes." />
            <FeatureCard icon="ssr" title="SSR Compatible" desc="Pure math. Zero browser APIs in core." />
          </div>
        </section>

        {/* Footer */}
        <div className="install-bar">
          <code>npm install @react-pixel-ui/react</code>
          <span style={{ color: 'var(--text-muted)' }}>|</span>
          <a href="https://github.com/Todari/react-pixel-ui" target="_blank" rel="noopener" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 13 }}>
            GitHub
          </a>
          <span style={{ color: 'var(--text-muted)' }}>|</span>
          <a href="https://www.npmjs.com/package/@react-pixel-ui/react" target="_blank" rel="noopener" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 13 }}>
            npm
          </a>
        </div>
      </div>
    </PixelConfigProvider>
  );
}

function ShowcaseItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="showcase-item">
      {children}
      <span>{label}</span>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  const icons: Record<string, string> = {
    auto: '\u2728', clip: '\u2702', image: '\u25A6', shadow: '\u2592',
    observe: '\u21BB', ssr: '\u2601',
  };
  return (
    <div className="feature-card">
      <div className="feature-icon">{icons[icon] || '\u25A0'}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

function RefHookDemo({ pixelSize }: { pixelSize: number }) {
  const pixelRef = usePixelRef({ pixelSize });
  return (
    <div ref={pixelRef} style={{
      background: 'linear-gradient(135deg, #fd79a8, #e84393)',
      border: '3px solid #b8256e', borderRadius: 20,
      width: 240, height: 80,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: 15,
      boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
    }}>
      usePixelRef
    </div>
  );
}

export default App;
