import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  const [prompt, setPrompt] = useState('');
  const [glitchText, setGlitchText] = useState('CLAUDE');
  const navigate = useNavigate();

  useEffect(() => {
    const glitchChars = '▓▒░█▄▀▐│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬';
    const originalText = 'CLAUDE';

    const glitch = () => {
      let iterations = 0;
      const interval = setInterval(() => {
        setGlitchText(originalText.split('').map((char, index) => {
          if (index < iterations) {
            return originalText[index];
          }
          return glitchChars[Math.floor(Math.random() * glitchChars.length)];
        }).join(''));

        if (iterations >= originalText.length) {
          clearInterval(interval);
        }
        iterations += 1/3;
      }, 30);
    };

    glitch();
    const glitchInterval = setInterval(glitch, 8000);
    return () => clearInterval(glitchInterval);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      navigate('/chat', { state: { initialPrompt: prompt } });
    }
  };

  const suggestedPrompts = [
    { text: "python: fibonacci_sequence()", tag: "CODE" },
    { text: "quantum computing for humans", tag: "EXPLAIN" },
    { text: "build: responsive landing page", tag: "CREATE" },
    { text: "debug async/await patterns", tag: "DEBUG" }
  ];

  return (
    <div className="home-page">
      <div className="scanline"></div>
      <div className="noise"></div>

      <div className="home-container">
        <div className="home-header">
          <div className="terminal-chrome">
            <span className="chrome-dot red"></span>
            <span className="chrome-dot yellow"></span>
            <span className="chrome-dot green"></span>
            <span className="terminal-title">neural_interface.exe</span>
          </div>

          <h1 className="home-title" data-text={glitchText}>{glitchText}</h1>
          <div className="subtitle-wrapper">
            <span className="cursor-blink">▓</span>
            <p className="home-subtitle">SONNET-4.5 // NEURAL INTERFACE v2.0</p>
          </div>
        </div>

        <div className="prompt-section">
          <div className="prompt-label">
            <span className="prompt-icon">{'>'}</span>
            <span className="prompt-text">INITIALIZE_QUERY:</span>
          </div>

          <form onSubmit={handleSubmit} className="prompt-form">
            <textarea
              className="prompt-input"
              placeholder="enter command..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              rows={3}
              autoFocus
            />
            <button
              type="submit"
              className="submit-button"
              disabled={!prompt.trim()}
            >
              <span className="button-text">EXECUTE</span>
              <span className="button-icon">→</span>
            </button>
          </form>

          <div className="suggested-prompts">
            <div className="prompts-header">
              <span className="prompts-label">// QUICK_ACCESS</span>
              <span className="prompts-count">[{suggestedPrompts.length}]</span>
            </div>
            <div className="prompts-grid">
              {suggestedPrompts.map((item, index) => (
                <button
                  key={index}
                  className="suggested-prompt-card"
                  onClick={() => setPrompt(item.text)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="prompt-tag">{item.tag}</span>
                  <span className="prompt-content">{item.text}</span>
                  <span className="prompt-arrow">→</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="footer-info">
          <span className="status-indicator"></span>
          <span className="status-text">SYSTEM_ONLINE</span>
          <span className="divider">|</span>
          <span className="latency">LATENCY: ~50ms</span>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
