import React, { useEffect, useRef, useState } from 'react';

const FRAME_COUNT = 192;

const ImageSequenceRenderer = () => {
  const canvasRef = useRef(null);
  const [images, setImages] = useState([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const frameIndexRef = useRef(0);

  // Preload Images
  useEffect(() => {
    const loadedImages = [];
    let loaded = 0;

    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      const numStr = i.toString().padStart(4, '0');
      img.src = `/frames/${numStr}.jpg`;
      img.onload = () => {
        loaded++;
        setLoadedCount(loaded);
      };
      loadedImages.push(img);
    }
    
    setImages(loadedImages);
  }, []);

  // Set up Scroll Animation
  useEffect(() => {
    if (loadedCount < 1) return; // Wait until at least first frame is loaded

    const handleScroll = () => {
      const scrollTop = document.documentElement.scrollTop;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      
      const scrollFraction = maxScroll > 0 ? scrollTop / maxScroll : 0;
      
      const frameIndex = Math.min(
        FRAME_COUNT - 1,
        Math.floor(scrollFraction * FRAME_COUNT)
      );

      // Only re-render if the frame actually changed
      if (frameIndex !== frameIndexRef.current) {
        frameIndexRef.current = frameIndex;
        requestAnimationFrame(() => renderFrame(frameIndex));
      }
    };

    const renderFrame = (index) => {
      const canvas = canvasRef.current;
      const image = images[index];
      
      if (!canvas || !image || !image.complete) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Handle High DPI displays
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      // Object Fill "Cover" Logic
      const imgRatio = image.width / image.height;
      const canvasRatio = canvas.width / canvas.height;
      let renderW, renderH, renderX, renderY;

      if (imgRatio > canvasRatio) {
        renderH = canvas.height;
        renderW = image.width * (renderH / image.height);
        renderX = (canvas.width - renderW) / 2;
        renderY = 0;
      } else {
        renderW = canvas.width;
        renderH = image.height * (renderW / image.width);
        renderX = 0;
        renderY = (canvas.height - renderH) / 2;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, renderX, renderY, renderW, renderH);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    
    // Initial Render
    handleScroll();
    // Render frame 0 explicitly in case scroll is 0
    renderFrame(frameIndexRef.current);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [images, loadedCount]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full object-cover -z-10 bg-black"
        style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -10, backgroundColor: 'black' }}
      />
      
      {/* Loading Overlay */}
      {loadedCount < FRAME_COUNT && (
        <div className="loading-screen" style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', color: '#fff', transition: 'opacity 0.5s ease-out', opacity: loadedCount > FRAME_COUNT * 0.9 ? 0 : 1, pointerEvents: 'none' }}>
           <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.5rem', marginBottom: '1rem', letterSpacing: '0.05em' }}>Loading Experience</h2>
           <div style={{ width: '200px', height: '4px', background: '#333', borderRadius: '4px', overflow: 'hidden' }}>
             <div style={{ width: `${(loadedCount / FRAME_COUNT) * 100}%`, height: '100%', background: '#fff', transition: 'width 0.1s linear' }}></div>
           </div>
        </div>
      )}
    </>
  );
};

export default ImageSequenceRenderer;
