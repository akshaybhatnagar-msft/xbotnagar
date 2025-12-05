import { useState, useEffect, useRef } from 'react';
import MessageRenderer from './MessageRenderer';
import './ChatInterface.css';

function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [renderedContent, setRenderedContent] = useState(null);
  const [glitchText, setGlitchText] = useState('BOTNAGAR');
  const messagesEndRef = useRef(null);

  // Glitch effect for title
  useEffect(() => {
    const glitchChars = '▓▒░█▄▀▐│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬';
    const originalText = 'BOTNAGAR';

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (text = input) => {
    if (!text.trim() || isLoading) return;

    const userMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          systemPrompt: 'You are BotNagar, a helpful AI assistant powered by Claude Sonnet 4.5. When users ask you to create code, web pages, or documents, provide complete, well-formatted content that can be rendered.'
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                assistantMessage += parsed.text;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1].content = assistantMessage;
                  return newMessages;
                });

                checkAndRenderContent(assistantMessage);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, there was an error processing your request.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAndRenderContent = (content) => {
    const codeBlockRegex = /```(?:html|markdown|md)\n([\s\S]*?)```/i;
    const match = content.match(codeBlockRegex);

    if (match) {
      const contentType = match[0].match(/```(html|markdown|md)/i)?.[1]?.toLowerCase();
      const extractedContent = match[1];

      setRenderedContent({
        type: contentType === 'html' ? 'html' : 'markdown',
        content: extractedContent
      });
    } else if (content.includes('<!DOCTYPE html>') || content.includes('<html')) {
      const htmlMatch = content.match(/<!DOCTYPE html>[\s\S]*<\/html>/i) ||
                        content.match(/<html[\s\S]*<\/html>/i);
      if (htmlMatch) {
        setRenderedContent({
          type: 'html',
          content: htmlMatch[0]
        });
      }
    }
  };

  const suggestedPrompts = [
    { text: "python: fibonacci_sequence()", tag: "CODE" },
    { text: "quantum computing for humans", tag: "EXPLAIN" },
    { text: "build: responsive landing page", tag: "CREATE" },
    { text: "debug async/await patterns", tag: "DEBUG" }
  ];

  const handleSuggestionClick = (text) => {
    setInput(text);
    // Auto-focus the input
    document.querySelector('.message-input')?.focus();
  };

  return (
    <div className="chat-interface">
      <div className="scanline"></div>
      <div className="noise"></div>

      {/* Left Pane - Chat */}
      <div className="chat-pane">
        {/* Header */}
        <div className="chat-header">
          <div className="terminal-chrome">
            <span className="chrome-dot red"></span>
            <span className="chrome-dot yellow"></span>
            <span className="chrome-dot green"></span>
            <span className="terminal-title">neural_interface.exe</span>
          </div>
          <h1 className="chat-title" data-text={glitchText}>{glitchText}</h1>
          <div className="subtitle-wrapper">
            <span className="cursor-blink">▓</span>
            <p className="chat-subtitle">SONNET-4.5 // NEURAL SESSION</p>
          </div>
        </div>

        {/* Messages or Welcome Screen */}
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="welcome-screen">
              <div className="welcome-content">
                <div className="welcome-icon">→_</div>
                <h2 className="welcome-title">INITIALIZE NEURAL QUERY</h2>
                <p className="welcome-text">Begin your session by entering a command below</p>
              </div>

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
                      onClick={() => handleSuggestionClick(item.text)}
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
          ) : (
            <>
              {messages.map((message, index) => (
                <div key={index} className={`message ${message.role}`}>
                  <div className="message-avatar">
                    {message.role === 'user' ? 'U' : 'AI'}
                  </div>
                  <div className="message-content">
                    <MessageRenderer content={message.content} />
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                <div className="message assistant">
                  <div className="message-avatar">AI</div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="input-container">
          <div className="prompt-label">
            <span className="prompt-icon">{'>'}</span>
            <span className="prompt-text">COMMAND:</span>
          </div>
          <div className="input-row">
            <textarea
              className="message-input"
              placeholder="enter command..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              rows={1}
              disabled={isLoading}
            />
            <button
              className="send-button"
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isLoading}
            >
              <span className="button-text">EXECUTE</span>
              <span className="button-icon">→</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="footer-info">
          <span className="status-indicator"></span>
          <span className="status-text">SYSTEM_ONLINE</span>
          <span className="divider">|</span>
          <span className="latency">LATENCY: ~50ms</span>
        </div>
      </div>

      {/* Right Pane - Artifacts */}
      {renderedContent && (
        <div className="artifacts-pane">
          <div className="artifacts-header">
            <h3>// OUTPUT_RENDER</h3>
            <button
              className="close-pane-button"
              onClick={() => setRenderedContent(null)}
            >
              [X]
            </button>
          </div>
          <div className="artifacts-body">
            {renderedContent.type === 'html' ? (
              <iframe
                srcDoc={renderedContent.content}
                title="HTML Preview"
                sandbox="allow-scripts"
                className="html-preview"
              />
            ) : (
              <div className="markdown-preview">
                <MessageRenderer content={renderedContent.content} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatInterface;
