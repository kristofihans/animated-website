import React, { useEffect, useState } from 'react';

const ScrollCard = ({ children, progress, start, end, isFirst = false, isLast = false, direction = 'left', className = '' }) => {
  const sign = direction === 'left' ? 1 : -1;
  let x = -100 * sign; // default offscreen (if left: -100. if right: +100)
  let opacity = 0;

  if (progress >= start && progress <= end) {
    const seg = (progress - start) / (end - start); // 0.0 to 1.0 within this segment
    
    if (isFirst) {
      // Moves from center (0) to edge (+120 or -120)
      x = sign * seg * 120; // drift direction
      opacity = 1 - seg * 2; // fades out in the first half of its segment
    } else if (isLast) {
      // Moves from source (-100 or +100) to center (0)
      x = (-100 * sign) + (sign * seg * 200); 
      // Cap at 0 so it stops in the center
      if ((sign === 1 && x > 0) || (sign === -1 && x < 0)) x = 0;
      
      // Fade in at the start of its segment, stays visible
      opacity = seg < 0.3 ? seg * 3.33 : 1; 
    } else {
      // Moves from source (-120 or +120) to opposite side (+120 or -120) smoothly
      x = (-120 * sign) + (sign * seg * 240);
      
      // Fade in (0 to 0.3), fully visible (0.3 to 0.7), fade out (0.7 to 1.0)
      if (seg < 0.3) opacity = seg * 3.33;
      else if (seg > 0.7) opacity = (1 - seg) * 3.33;
      else opacity = 1;
    }
  } else if (progress > end) {
    x = 100 * sign; // drifted off to the opposite edge
  }

  // Optimize performance: don't render off-screen cards
  const display = opacity <= 0 && x !== 0 ? 'none' : 'block';

  return (
    <div 
      className={`glass-card ${className}`}
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: `translate(calc(-50% + ${x}vw), -50%)`,
        opacity: Math.max(0, opacity),
        display,
        margin: 0,
        zIndex: 50
      }}
    >
      {children}
    </div>
  );
};

const ContentOverlay = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToPercentage = (targetProgress) => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({
      top: maxScroll * targetProgress,
      behavior: 'smooth'
    });
  };

  const navButtonStyles = {
    padding: '1rem 2.5rem',
    fontSize: '1.125rem',
    marginTop: '1.5rem',
    cursor: 'pointer',
    background: '#ffffff',
    color: '#000000',
    border: 'none',
    fontWeight: '600',
    borderRadius: '2rem',
    fontFamily: 'Inter, sans-serif',
    transition: 'all 0.3s ease'
  };

  return (
    <div className="content-overlay" style={{ height: '450vh' }}>
      
      {/* 0.0 to 0.20 */}
      <ScrollCard progress={scrollProgress} start={0} end={0.20} isFirst={true} direction="left" className="hero-card">
        <h1 className="title"> Explore beautiful places</h1>
        <p className="subtitle">Precision Architecture. Panoramic Vistas.</p>
        <button 
          style={navButtonStyles} 
          onMouseOver={e => e.currentTarget.style.background = '#e0e0e0'}
          onMouseOut={e => e.currentTarget.style.background = '#ffffff'}
          onClick={() => scrollToPercentage(0.30)}
        >
          Discover More ↓
        </button>
      </ScrollCard>

      {/* 0.15 to 0.45 */}
      <ScrollCard progress={scrollProgress} start={0.15} end={0.45} direction="right" className="detail-card">
        <h2>You deserve it</h2>
        <p>Every curve and angle has been meticulously crafted to harmonize with the surrounding cityscape.</p>
        <ul className="amenity-list">
          <li>15 Foot Ceilings</li>
          <li>Floor-to-ceiling smart glass</li>
          <li>Automated climate zones</li>
        </ul>
        <button 
          style={navButtonStyles}
          onMouseOver={e => e.currentTarget.style.background = '#e0e0e0'}
          onMouseOut={e => e.currentTarget.style.background = '#ffffff'}
          onClick={() => scrollToPercentage(0.55)}
        >
          Next Section →
        </button>
      </ScrollCard>

      {/* 0.40 to 0.70 */}
      <ScrollCard progress={scrollProgress} start={0.40} end={0.70} direction="left" className="detail-card">
        <h2>We have financing plans</h2>
        <p>Experience living above the clouds. An exclusive full-floor residence offering unparalleled privacy.</p>
        <button 
          style={navButtonStyles}
          onMouseOver={e => e.currentTarget.style.background = '#e0e0e0'}
          onMouseOut={e => e.currentTarget.style.background = '#ffffff'}
          onClick={() => scrollToPercentage(1.0)}
        >
          View Final Offer →
        </button>
      </ScrollCard>

      {/* 0.65 to 1.0 */}
      <ScrollCard progress={scrollProgress} start={0.65} end={1.0} direction="right" isLast={true} className="call-to-action">
        <h2>What are you waiting for?</h2>
        <p>Schedule a private viewing of the remaining residences.</p>
        <button className="cta-button">Inquire Now</button>
      </ScrollCard>
      
    </div>
  );
};

export default ContentOverlay;
