import React, { useState } from 'react';
import { usePixelCSS, PixelCSSProvider } from '@react-pixel-ui/react';
import './App.css';

function PixelatedBox() {
  const [css, setCSS] = useState(`
    background: linear-gradient(45deg, #ff0000, #00ff00);
    border: 2px solid #000;
    border-radius: 8px;
    padding: 20px;
    color: white;
    font-size: 16px;
    width: 200px;
    height: 100px;
  `);

  const [unitPixel, setUnitPixel] = useState(4);
  const [smooth, setSmooth] = useState(false);
  const [updateMode, setUpdateMode] = useState<'realtime' | 'debounced' | 'manual'>('debounced');

  const [pixelCSS, pixelRef] = usePixelCSS(css, {
    unitPixel,
    smooth,
    quality: 'medium',
    updateMode,
    fallbackToCSSFilter: true,
  });

  return (
    <div className="demo-container">
      <h1>React Pixel UI Demo</h1>
      
      <div className="controls">
        <div className="control-group">
          <label>CSS:</label>
          <textarea
            value={css}
            onChange={(e) => setCSS(e.target.value)}
            rows={8}
            cols={50}
          />
        </div>
        
        <div className="control-group">
          <label>Pixel 크기: {unitPixel}</label>
          <input
            type="range"
            min="1"
            max="10"
            value={unitPixel}
            onChange={(e) => setUnitPixel(Number(e.target.value))}
          />
        </div>
        
        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={smooth}
              onChange={(e) => setSmooth(e.target.checked)}
            />
            부드러운 렌더링
          </label>
        </div>
        
        <div className="control-group">
          <label>업데이트 모드:</label>
          <select
            value={updateMode}
            onChange={(e) => setUpdateMode(e.target.value as any)}
          >
            <option value="realtime">실시간</option>
            <option value="debounced">디바운스</option>
            <option value="manual">수동</option>
          </select>
        </div>
      </div>
      
      <div className="result">
        <h3>Pixelated Result:</h3>
        <div ref={pixelRef} style={pixelCSS}>
          Pixelated Content
        </div>
      </div>
      
      <div className="original">
        <h3>Original CSS:</h3>
        <div style={parseCSS(css)}>
          Original Content
        </div>
      </div>
    </div>
  );
}

function parseCSS(cssString: string): React.CSSProperties {
  const styles: React.CSSProperties = {};
  const styleRegex = /([a-zA-Z-]+)\s*:\s*([^;]+);/g;
  let match;
  
  while ((match = styleRegex.exec(cssString)) !== null) {
    const [, property, value] = match;
    const camelCaseProperty = property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    styles[camelCaseProperty as keyof React.CSSProperties] = value.trim() as any;
  }
  
  return styles;
}

function App() {
  return (
    <PixelCSSProvider>
      <PixelatedBox />
    </PixelCSSProvider>
  );
}

export default App; 