import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MessageRenderer from './MessageRenderer';
import './ChatView.css';

function ChatView() {
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showContentPane, setShowContentPane] = useState(false);
  const [renderedContent, setRenderedContent] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (location.state?.initialPrompt) {
      handleSendMessage(location.state.initialPrompt);
    }
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
          systemPrompt: 'You are Claude, a helpful AI assistant. When users ask you to create code, web pages, or documents, provide complete, well-formatted content that can be rendered.'
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
      setShowContentPane(true);
    } else if (content.includes('<!DOCTYPE html>') || content.includes('<html')) {
      const htmlMatch = content.match(/<!DOCTYPE html>[\s\S]*<\/html>/i) ||
                        content.match(/<html[\s\S]*<\/html>/i);
      if (htmlMatch) {
        setRenderedContent({
          type: 'html',
          content: htmlMatch[0]
        });
        setShowContentPane(true);
      }
    }
  };

  return (
    <div className="chat-view">
      <div className={`chat-pane ${showContentPane ? 'split' : 'full'}`}>
        <div className="chat-header">
          <button className="back-button" onClick={() => navigate('/')}>
            ← BACK
          </button>
          <h2>// NEURAL_SESSION</h2>
          {showContentPane && (
            <button
              className="toggle-pane-button"
              onClick={() => setShowContentPane(!showContentPane)}
            >
              {showContentPane ? '[HIDE_RENDER]' : '[SHOW_RENDER]'}
            </button>
          )}
        </div>

        <div className="messages-container">
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
        </div>

        <div className="input-container">
          <textarea
            className="message-input"
            placeholder="Type your message..."
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
            SEND
          </button>
        </div>
      </div>

      {showContentPane && renderedContent && (
        <div className="content-pane">
          <div className="content-pane-header">
            <h3>// OUTPUT_RENDER</h3>
            <button
              className="close-pane-button"
              onClick={() => setShowContentPane(false)}
            >
              [X]
            </button>
          </div>
          <div className="content-pane-body">
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

export default ChatView;
