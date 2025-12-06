import { useState, useEffect, useRef } from 'react';
import './NeuralTypingIndicator.css';

function NeuralTypingIndicator({ isVisible, complexity = 0.5, soundEnabled = false }) {
  const [statusText, setStatusText] = useState('');
  const [isGlitching, setIsGlitching] = useState(false);
  const [nodeStates, setNodeStates] = useState([]);
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);

  // Status messages that cycle during AI processing
  const statusMessages = [
    'NEURAL_NET_PROCESSING...',
    'SYNAPSES_FIRING...',
    'QUANTUM_ENTANGLING...',
    'DEEP_LEARNING_ACTIVE...',
    'PATTERN_RECOGNITION...',
    'MEMORY_BANKS_ACCESSED...',
    'CONSCIOUSNESS_STREAM...',
    'NEURAL_PATHWAYS_LIT...',
    'THINKING_MODULES_SYNC...',
    'COGNITION_AMPLIFIED...'
  ];

  // Glitch characters for corruption effect
  const glitchChars = '█▓▒░▄▀▐│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌';

  // Initialize neural network nodes
  useEffect(() => {
    const nodes = [];
    const nodeCount = Math.max(8, Math.floor(12 * (0.5 + complexity)));
    
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        id: i,
        x: 20 + Math.random() * 260, // Within SVG bounds
        y: 20 + Math.random() * 60,
        size: 3 + Math.random() * 4,
        pulseDelay: Math.random() * 2,
        connectionDelay: Math.random() * 3,
        intensity: 0.3 + Math.random() * 0.7
      });
    }
    setNodeStates(nodes);
  }, [complexity]);

  // Status text cycling and glitch effects
  useEffect(() => {
    if (!isVisible) return;

    let messageIndex = 0;
    let glitchTimeout;

    const cycleMessages = () => {
      if (!isVisible) return;
      
      const currentMessage = statusMessages[messageIndex];
      setStatusText(currentMessage);
      
      // Random chance to glitch the message
      if (Math.random() < 0.3) {
        glitchTimeout = setTimeout(() => {
          setIsGlitching(true);
          
          // Apply glitch corruption
          const glitchedMessage = currentMessage
            .split('')
            .map(char => {
              if (Math.random() < 0.2) {
                return glitchChars[Math.floor(Math.random() * glitchChars.length)];
              }
              return char;
            })
            .join('');
          
          setStatusText(glitchedMessage);
          
          // Restore original message
          setTimeout(() => {
            setStatusText(currentMessage);
            setIsGlitching(false);
          }, 150);
        }, 500 + Math.random() * 1500);
      }
      
      messageIndex = (messageIndex + 1) % statusMessages.length;
    };

    cycleMessages();
    const interval = setInterval(cycleMessages, 2000 + Math.random() * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(glitchTimeout);
    };
  }, [isVisible]);

  // Audio feedback system
  useEffect(() => {
    if (!isVisible || !soundEnabled) return;

    const initAudio = () => {
      try {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        console.warn('Web Audio API not supported');
      }
    };

    const playBeep = () => {
      if (!audioContextRef.current) return;
      
      try {
        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
        
        oscillator.frequency.setValueAtTime(800 + Math.random() * 400, audioContextRef.current.currentTime);
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0.02, audioContextRef.current.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.1);
        
        oscillator.start();
        oscillator.stop(audioContextRef.current.currentTime + 0.1);
      } catch (e) {
        // Silently fail if audio context is blocked
      }
    };

    initAudio();
    
    // Play beeps at random intervals
    const beepInterval = setInterval(() => {
      if (Math.random() < 0.3) {
        playBeep();
      }
    }, 500);

    return () => {
      clearInterval(beepInterval);
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
      }
    };
  }, [isVisible, soundEnabled]);

  if (!isVisible) return null;

  // Generate connections between nearby nodes
  const generateConnections = () => {
    const connections = [];
    nodeStates.forEach((node1, i) => {
      nodeStates.forEach((node2, j) => {
        if (i < j) {
          const distance = Math.sqrt(
            Math.pow(node1.x - node2.x, 2) + Math.pow(node1.y - node2.y, 2)
          );
          
          // Connect nodes that are reasonably close
          if (distance < 80 && Math.random() < 0.4) {
            connections.push({
              x1: node1.x,
              y1: node1.y,
              x2: node2.x,
              y2: node2.y,
              delay: Math.random() * 2,
              intensity: Math.min(node1.intensity, node2.intensity)
            });
          }
        }
      });
    });
    return connections;
  };

  const connections = generateConnections();

  return (
    <div className="neural-typing-indicator">
      {/* Background effects */}
      <div className="neural-bg-effects">
        <div className="neural-scanline"></div>
        <div className="neural-noise"></div>
      </div>

      {/* Main neural network visualization */}
      <div className="neural-network-container">
        <svg className="neural-network" viewBox="0 0 300 100">
          {/* Define gradients and effects */}
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/> 
              </feMerge>
            </filter>
            
            <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8">
                <animate attributeName="stop-opacity" values="0.2;0.8;0.2" dur="2s" repeatCount="indefinite" />
              </stop>
              <stop offset="50%" stopColor="#39ff14" stopOpacity="1">
                <animate attributeName="stop-opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="#ff10f0" stopOpacity="0.8">
                <animate attributeName="stop-opacity" values="0.2;0.8;0.2" dur="2.5s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
          </defs>

          {/* Neural connections */}
          {connections.map((connection, index) => (
            <line
              key={`connection-${index}`}
              x1={connection.x1}
              y1={connection.y1}
              x2={connection.x2}
              y2={connection.y2}
              className="neural-connection"
              stroke="url(#connectionGradient)"
              strokeWidth="1"
              filter="url(#glow)"
              style={{
                animationDelay: `${connection.delay}s`,
                opacity: connection.intensity
              }}
            >
              <animate
                attributeName="stroke-width"
                values="0.5;2;0.5"
                dur="3s"
                repeatCount="indefinite"
                begin={`${connection.delay}s`}
              />
            </line>
          ))}

          {/* Neural nodes */}
          {nodeStates.map((node) => (
            <g key={`node-${node.id}`}>
              {/* Node glow effect */}
              <circle
                cx={node.x}
                cy={node.y}
                r={node.size + 2}
                className="neural-node-glow"
                style={{
                  animationDelay: `${node.pulseDelay}s`
                }}
              />
              
              {/* Main node */}
              <circle
                cx={node.x}
                cy={node.y}
                r={node.size}
                className="neural-node"
                filter="url(#glow)"
                style={{
                  animationDelay: `${node.pulseDelay}s`,
                  opacity: node.intensity
                }}
              >
                <animate
                  attributeName="r"
                  values={`${node.size};${node.size + 2};${node.size}`}
                  dur="2s"
                  repeatCount="indefinite"
                  begin={`${node.pulseDelay}s`}
                />
              </circle>
              
              {/* Pulse ring */}
              <circle
                cx={node.x}
                cy={node.y}
                r={node.size}
                className="neural-node-pulse"
                style={{
                  animationDelay: `${node.pulseDelay}s`
                }}
              >
                <animate
                  attributeName="r"
                  values={`${node.size};${node.size + 8};${node.size + 15}`}
                  dur="3s"
                  repeatCount="indefinite"
                  begin={`${node.pulseDelay}s`}
                />
                <animate
                  attributeName="opacity"
                  values="0.8;0.3;0"
                  dur="3s"
                  repeatCount="indefinite"
                  begin={`${node.pulseDelay}s`}
                />
              </circle>
            </g>
          ))}
        </svg>
      </div>

      {/* Status text display */}
      <div className="neural-status">
        <div className="status-prefix">[AI]</div>
        <div className={`status-text ${isGlitching ? 'glitching' : ''}`}>
          {statusText}
        </div>
        <div className="status-cursor">█</div>
      </div>

      {/* Circuit pattern overlay */}
      <div className="circuit-overlay">
        <div className="circuit-line horizontal-1"></div>
        <div className="circuit-line horizontal-2"></div>
        <div className="circuit-line vertical-1"></div>
        <div className="circuit-line vertical-2"></div>
        <div className="circuit-node node-1"></div>
        <div className="circuit-node node-2"></div>
        <div className="circuit-node node-3"></div>
      </div>
    </div>
  );
}

export default NeuralTypingIndicator;