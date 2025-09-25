import React, { useState } from 'react';
import { usePixelCSS } from '@react-pixel-ui/react';
import './App.css';

function App() {
  const [pixelSize, setPixelSize] = useState(4);
  const [content, setContent] = useState('픽셀 렌더링!');

  // CSS 문자열을 픽셀화하는 훅 (새로운 방식: 배경만 픽셀화)
  const pixelResult = usePixelCSS(
    `
      background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
      border: 16px solid #333;
      border-radius: 48px;
      padding: 20px;
      color: white;
      font-size: 18px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
    `,
    {
      width: 300,
      height: 150,
      pixelSize
    }
  );

  
  const { pixelStyle } = pixelResult;

  return (
    <div className="demo-container">
      <h1>🎨 React Pixel UI - 배경 픽셀화 데모</h1>
      
      <div className="controls">
        <label>
          픽셀 크기: {pixelSize}px
          <input
            type="range"
            min="1"
            max="16"
            value={pixelSize}
            onChange={(e) => setPixelSize(Number(e.target.value))}
          />
        </label>
        
        <label>
          텍스트:
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </label>
      </div>

      <div className="demo-section">
        <h2>🎯 배경만 픽셀화, 텍스트는 선명하게!</h2>
        
        <div className="result-container">
          <div style={pixelStyle} className="pixel-result">
            {content}
          </div>
        </div>
        
        <div className="info">
          <p>✅ <strong>배경 픽셀화</strong>: 그라디언트와 테두리가 픽셀 아트로 변환</p>
          <p>✅ <strong>텍스트 선명도</strong>: 글자는 완벽하게 읽기 쉬움</p>
          <p>⚡ <strong>실시간 조정</strong>: 픽셀 크기 슬라이더로 즉시 변경</p>
        </div>
      </div>

      <div className="comparison">
        <h2>비교: 원본 vs 픽셀화</h2>
        <div className="comparison-grid">
          <div>
            <h3>원본</h3>
            <div
              style={{
                background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                border: '16px solid #333',
                borderRadius: '48px',
                padding: '20px',
                color: 'white',
                fontSize: '18px',
                fontWeight: 'bold',
                width: '300px',
                height: '150px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {content}
            </div>
          </div>
          
          <div>
            <h3>픽셀화 (픽셀 크기: {pixelSize}px)</h3>
            <div style={pixelStyle} className="pixel-result">
              {content}
            </div>
          </div>
        </div>
      </div>

      <div className="features">
        <h2>💡 핵심 특징</h2>
        <ul>
          <li>🎯 <strong>배경만 픽셀화</strong> - 텍스트는 선명하게 유지</li>
          <li>⚡ <strong>성능 최적화</strong> - 복잡한 텍스트 렌더링 제거</li>
          <li>📖 <strong>가독성 보장</strong> - 실용적인 픽셀 아트 효과</li>
          <li>🔧 <strong>간단한 구현</strong> - 저화질→고화질 확대 방식</li>
          <li>🚫 <strong>iframe 없음</strong> - 안정적이고 가벼운 렌더링</li>
        </ul>
        
        <div className="highlight">
          <strong>💡 핵심 아이디어:</strong> 
          <p>
            폰트는 픽셀화하지 않고, CSS의 시각적 요소들(배경, 테두리, 그라디언트)만 
            저화질 Canvas로 렌더링한 후 확대하여 backgroundImage로 사용하는 방식
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;