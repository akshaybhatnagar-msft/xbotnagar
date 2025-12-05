import { useEffect, useState } from 'react';
import './PulseVisualizer.css';

function PulseVisualizer({ 
  isThinking = false, 
  isStreaming = false, 
  isComplete = false,
  streamingIntensity = 0.5 
}) {
  const [particles, setParticles] = useState([]);
  const [animationState, setAnimationState] = useState('idle');

  // Determine animation state based on props
  useEffect(() => {
    if (isComplete) {
      setAnimationState('complete');
      // Reset to idle after completion animation
      const timeout = setTimeout(() => {
        setAnimationState('idle');
      }, 2000);
      return () => clearTimeout(timeout);
    } else if (isStreaming) {
      setAnimationState('streaming');
    } else if (isThinking) {
      setAnimationState('thinking');
    } else {
      setAnimationState('idle');
    }
  }, [isThinking, isStreaming, isComplete]);

  // Generate neural particles for enhanced effect
  useEffect(() => {
    if (animationState === 'streaming' || animationState === 'thinking') {
      const particleCount = animationState === 'streaming' ? 8 : 5;
      const newParticles = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        delay: Math.random() * 2,
        size: 2 + Math.random() * 4,
        color: ['#00f0ff', '#39ff14', '#ff10f0'][Math.floor(Math.random() * 3)],
        angle: (360 / particleCount) * i + Math.random() * 30
      }));
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [animationState]);

  if (animationState === 'idle') {
    return null;
  }

  return (
    <div className={`pulse-visualizer ${animationState}`}>
      {/* Main pulse rings */}
      <div className="pulse-ring pulse-ring-1" style={{
        animationDuration: animationState === 'streaming' ? `${1.5 - streamingIntensity * 0.5}s` : '2s'
      }} />
      <div className="pulse-ring pulse-ring-2" style={{
        animationDuration: animationState === 'streaming' ? `${2 - streamingIntensity * 0.6}s` : '2.5s'
      }} />
      <div className="pulse-ring pulse-ring-3" style={{
        animationDuration: animationState === 'streaming' ? `${2.5 - streamingIntensity * 0.8}s` : '3s'
      }} />
      
      {/* Central core */}
      <div className="pulse-core">
        <div className="core-inner" />
      </div>

      {/* Neural network particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="neural-particle"
          style={{
            '--particle-delay': `${particle.delay}s`,
            '--particle-size': `${particle.size}px`,
            '--particle-color': particle.color,
            '--particle-angle': `${particle.angle}deg`,
            '--streaming-intensity': streamingIntensity
          }}
        />
      ))}

      {/* Completion burst effect */}
      {animationState === 'complete' && (
        <>
          <div className="completion-burst" />
          <div className="completion-shockwave" />
          {/* Satisfaction sparkles */}
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={`sparkle-${i}`}
              className="completion-sparkle"
              style={{
                '--sparkle-angle': `${(360 / 12) * i}deg`,
                '--sparkle-delay': `${i * 0.1}s`
              }}
            />
          ))}
        </>
      )}

      {/* Data flow lines for streaming */}
      {animationState === 'streaming' && (
        <div className="data-flow-container">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={`flow-${i}`}
              className="data-flow-line"
              style={{
                '--flow-angle': `${90 * i}deg`,
                '--flow-intensity': streamingIntensity
              }}
            />
          ))}
        </div>
      )}

      {/* Neural sync grid for thinking */}
      {animationState === 'thinking' && (
        <div className="neural-grid">
          <div className="grid-line grid-horizontal" />
          <div className="grid-line grid-vertical" />
          <div className="grid-line grid-diagonal-1" />
          <div className="grid-line grid-diagonal-2" />
        </div>
      )}
    </div>
  );
}

export default PulseVisualizer;