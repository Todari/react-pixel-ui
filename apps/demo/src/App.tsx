import { useState } from 'react';
import { Pixel, usePixelRef, PixelBox, PixelButton, PixelConfigProvider } from '@react-pixel-ui/react';
import './App.css';

function App() {
  const [pixelSize, setPixelSize] = useState(4);

  return (
    <PixelConfigProvider config={{ pixelSize }}>
      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">v2.0 &mdash; Pure CSS</div>
        <h1>React Pixel UI</h1>
        <p>
          Wrap any element with <code>&lt;Pixel&gt;</code> and your CSS becomes pixel art.
          Tailwind, inline styles, CSS modules &mdash; all supported.
        </p>
        <div className="hero-boxes">
          <Pixel size={pixelSize}>
            <div style={{
              background: 'linear-gradient(135deg, #ff8906, #e53170)',
              border: '3px solid #b8441a',
              borderRadius: 12,
              width: 140, height: 56,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 13,
            }}>
              &lt;Pixel&gt;
            </div>
          </Pixel>
          <Pixel size={pixelSize}>
            <div style={{
              background: 'linear-gradient(135deg, #a29bfe, #6c5ce7)',
              border: '3px solid #4a3580',
              borderRadius: 12,
              width: 140, height: 56,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 13,
            }}>
              Gradient
            </div>
          </Pixel>
          <Pixel size={pixelSize}>
            <div style={{
              background: 'linear-gradient(135deg, #55efc4, #00b894)',
              border: '3px solid #007a5e',
              borderRadius: 12,
              width: 140, height: 56,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 13,
              boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
            }}>
              Shadow
            </div>
          </Pixel>
        </div>
      </section>

      <div className="container">
        {/* Controls */}
        <div className="controls">
          <div className="control-item">
            <span>Pixel Size</span>
            <span className="value">{pixelSize}px</span>
            <input type="range" min="2" max="16" value={pixelSize}
              onChange={(e) => setPixelSize(Number(e.target.value))} />
          </div>
        </div>

        {/* Primary: <Pixel> wrapper */}
        <section className="section">
          <div className="section-label">Primary API</div>
          <h2 className="section-title">&lt;Pixel&gt; — Wrap any element</h2>
          <div className="comparison-grid">
            <div className="comparison-card">
              <h3>Original CSS</h3>
              <div style={{
                background: 'linear-gradient(135deg, #ff6b6b, #4ecdc4)',
                border: '4px solid #2d3436',
                borderRadius: 24,
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
                  border: '4px solid #2d3436',
                  borderRadius: 24,
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
            <span className="comment">{'// Just wrap your existing element'}</span>{'\n'}
            &lt;<span className="component">Pixel</span> <span className="prop">size</span>=<span className="number">{'{4}'}</span>&gt;{'\n'}
            {'  '}&lt;<span className="component">div</span> <span className="prop">style</span>={'{{ '}background: <span className="string">'linear-gradient(...)'</span>, borderRadius: <span className="number">24</span>, border: <span className="string">'4px solid #333'</span>{' }}'}>{'\n'}
            {'    '}Pixel Art!{'\n'}
            {'  '}&lt;/<span className="component">div</span>&gt;{'\n'}
            &lt;/<span className="component">Pixel</span>&gt;
          </div>
        </section>

        {/* Secondary: usePixelRef */}
        <section className="section">
          <div className="section-label">Hook API</div>
          <h2 className="section-title">usePixelRef — Ref-based</h2>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <RefHookDemo pixelSize={pixelSize} />
          </div>
          <div className="code-block">
            <span className="keyword">const</span> pixelRef = <span className="component">usePixelRef</span>({'{ '}<span className="prop">pixelSize</span>: <span className="number">{pixelSize}</span>{' }'});{'\n\n'}
            &lt;<span className="component">div</span> <span className="prop">ref</span>={'{pixelRef}'} <span className="prop">className</span>=<span className="string">"bg-red-500 rounded-xl border-2"</span>&gt;{'\n'}
            {'  '}Any element{'\n'}
            &lt;/<span className="component">div</span>&gt;
          </div>
        </section>

        {/* Showcase */}
        <section className="section">
          <div className="section-label">Examples</div>
          <h2 className="section-title">Showcase</h2>
          <div className="showcase-grid">
            <ShowcaseItem label="Solid color">
              <Pixel size={pixelSize}>
                <div style={{
                  background: '#dfe6e9',
                  border: '3px solid #2d3436',
                  borderRadius: 16,
                  width: 170, height: 68,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 600, color: '#2d3436',
                }}>
                  Card
                </div>
              </Pixel>
            </ShowcaseItem>
            <ShowcaseItem label="Vertical gradient">
              <Pixel size={pixelSize}>
                <div style={{
                  background: 'linear-gradient(180deg, #a29bfe, #6c5ce7)',
                  border: '2px solid #4a3580',
                  borderRadius: 12,
                  width: 170, height: 68,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 600,
                }}>
                  Purple
                </div>
              </Pixel>
            </ShowcaseItem>
            <ShowcaseItem label="With shadow">
              <Pixel size={pixelSize}>
                <div style={{
                  background: 'linear-gradient(135deg, #fd79a8, #e84393)',
                  border: '3px solid #b8256e',
                  borderRadius: 16,
                  width: 170, height: 68,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 600,
                  boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
                }}>
                  Shadow
                </div>
              </Pixel>
            </ShowcaseItem>
            <ShowcaseItem label="Dark theme">
              <Pixel size={pixelSize}>
                <div style={{
                  background: 'linear-gradient(135deg, #2d3436, #636e72)',
                  border: '2px solid #636e72',
                  borderRadius: 16,
                  width: 170, height: 68,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#dfe6e9', fontWeight: 600,
                  boxShadow: '4px 4px 0 rgba(0,0,0,0.5)',
                }}>
                  Dark
                </div>
              </Pixel>
            </ShowcaseItem>
          </div>
        </section>

        {/* PixelBox & PixelButton (legacy explicit API) */}
        <section className="section">
          <div className="section-label">Components</div>
          <h2 className="section-title">PixelBox & PixelButton</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: 14 }}>
            Explicit prop-based API. Use when you prefer direct configuration.
          </p>
          <div className="showcase-grid" style={{ marginBottom: 24 }}>
            <PixelBox
              width={180} height={68} borderRadius={12}
              borderWidth={3} borderColor="#e17055" background="#ffeaa7"
              shadow={{ x: 4, y: 4, color: 'rgba(0,0,0,0.15)' }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#2d3436' }}
            >
              PixelBox
            </PixelBox>
          </div>
          <div className="button-row">
            <PixelButton variant="primary" width={140} height={44} borderRadius={8}>Primary</PixelButton>
            <PixelButton variant="secondary" width={140} height={44} borderRadius={8}>Secondary</PixelButton>
            <PixelButton variant="danger" width={140} height={44} borderRadius={8}>Danger</PixelButton>
          </div>
        </section>

        {/* Features */}
        <section className="section">
          <div className="section-label">Under the hood</div>
          <h2 className="section-title">How it works</h2>
          <div className="features-grid">
            <FeatureCard icon="auto" title="Auto-detection" desc="Reads getComputedStyle from your element. Tailwind, inline styles, CSS modules — all work." />
            <FeatureCard icon="clip" title="Staircase Corners" desc="clip-path: polygon() with Bresenham circle algorithm for pixel-perfect corners." />
            <FeatureCard icon="image" title="Pixel Gradients" desc="2D grid sampling into tiny BMP + image-rendering: pixelated. True square blocks." />
            <FeatureCard icon="shadow" title="Hard Shadows" desc="drop-shadow(blur=0) follows the clip-path contour for retro shadow effects." />
            <FeatureCard icon="observe" title="Live Updates" desc="MutationObserver + ResizeObserver + event listeners. Hover, focus, resize — all tracked." />
            <FeatureCard icon="ssr" title="SSR Compatible" desc="All computation is pure math. Elements pixelate on hydration, no layout shift." />
          </div>
        </section>

        {/* Install */}
        <div className="install-bar">
          <span>Get started</span>
          <code>npm install @react-pixel-ui/react</code>
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
    <div
      ref={pixelRef}
      style={{
        background: 'linear-gradient(135deg, #fd79a8, #e84393)',
        border: '3px solid #b8256e',
        borderRadius: 20,
        width: 240, height: 80,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 700, fontSize: 15,
        boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
      }}
    >
      usePixelRef
    </div>
  );
}

export default App;
