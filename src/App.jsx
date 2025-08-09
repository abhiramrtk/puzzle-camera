import React, { useEffect, useRef, useState } from 'react';

/**
 * Live camera -> puzzle (rectangular tiles).
 *
 * - Draws each piece into its own canvas by copying the right region
 *   from the current video frame (context.drawImage(video,...)).
 * - Pieces are draggable with pointer events.
 * - Pieces are updated every animation frame so the puzzle shows live video.
 *
 * This example focuses on clarity/robustness. See the "Upgrade" section
 * after the code for jigsaw-shaped edges.
 */

export default function App() {
  const videoRef = useRef(null);
  const [streamReady, setStreamReady] = useState(false);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setStreamReady(true);
        }
      } catch (err) {
        console.error('Camera error:', err);
        alert('Cannot access camera. Check permissions and that you are on HTTPS or localhost.');
      }
    }
    startCamera();

    return () => {
      // stop tracks when unmounting
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  return (
    <div className="app">
      {/* Hidden live video source (we draw from it into piece canvases) */}
      <video ref={videoRef} playsInline muted style={{ display: 'none' }} />
      <h1>Live Camera Jigsaw — Rectangular Pieces</h1>
      {streamReady ? (
        <PuzzleFromVideo videoRef={videoRef} rows={3} cols={4} />
      ) : (
        <div className="status">Starting camera…</div>
      )}
      <footer>
        Tip: drag a piece. Snap pieces near the correct spot. Resize rows/cols in code.
      </footer>
    </div>
  );
}

/* ---------------------
   PuzzleFromVideo component
   --------------------- */

function PuzzleFromVideo({ videoRef, rows = 3, cols = 3 }) {
  const containerRef = useRef(null);
  const [pieces, setPieces] = useState([]); // piece metadata: {id,row,col,w,h,homeX,homeY,x,y}
  const canvasesRef = useRef({}); // map id -> canvas DOM node
  const rafRef = useRef(null);

  // create pieces once video metadata is available
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoaded = () => {
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      const pieceW = Math.floor(vw / cols);
      const pieceH = Math.floor(vh / rows);

      const containerWidth = pieceW * cols;
      const containerHeight = pieceH * rows;
      if (containerRef.current) {
        containerRef.current.style.width = containerWidth + 'px';
        containerRef.current.style.height = containerHeight + 'px';
      }

      // build pieces with home coordinates (grid) and initial shuffled positions
      const arr = [];
      const shuffle = (v, max) => Math.floor(Math.random() * (max - v));
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const id = `${r}-${c}`;
          const homeX = c * pieceW;
          const homeY = r * pieceH;

          // initial (shuffled) position — keep inside container
          const x = Math.random() * (containerWidth - pieceW);
          const y = Math.random() * (containerHeight - pieceH);

          arr.push({
            id,
            row: r,
            col: c,
            w: pieceW,
            h: pieceH,
            homeX,
            homeY,
            x,
            y,
            locked: false,
          });
        }
      }
      setPieces(arr);
    };

    video.addEventListener('loadedmetadata', onLoaded);
    // in case metadata already loaded
    if (video.readyState >= 1) onLoaded();

    return () => video.removeEventListener('loadedmetadata', onLoaded);
  }, [videoRef, rows, cols]);

  // draw loop: copy each piece's subregion from the video into its canvas
  useEffect(() => {
    const video = videoRef.current;
    if (!video || pieces.length === 0) return;

    const draw = () => {
      for (const piece of pieces) {
        const cvs = canvasesRef.current[piece.id];
        if (!cvs) continue;
        const ctx = cvs.getContext('2d');
        // keep canvas size equal to piece size
        if (cvs.width !== piece.w || cvs.height !== piece.h) {
          cvs.width = piece.w;
          cvs.height = piece.h;
        }
        // clear and draw the relevant subimage from the video
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        // srcX/srcY are the piece's area in video coordinates
        const sx = piece.col * piece.w;
        const sy = piece.row * piece.h;
        ctx.drawImage(video, sx, sy, piece.w, piece.h, 0, 0, piece.w, piece.h);

        // optional: draw border
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 1;
        ctx.strokeRect(0.5, 0.5, piece.w - 1, piece.h - 1);
      }
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [videoRef, pieces]);

  // Dragging (pointer events)
  const draggingRef = useRef({ id: null, offsetX: 0, offsetY: 0 });

  useEffect(() => {
    // pointermove/up listeners attached to window for reliable tracking
    function onPointerMove(e) {
      const drag = draggingRef.current;
      if (!drag.id) return;
      setPieces(prev =>
        prev.map(p => (p.id === drag.id && !p.locked
          ? { ...p, x: e.clientX - drag.offsetX, y: e.clientY - drag.offsetY }
          : p))
      );
    }
    function onPointerUp(e) {
      const drag = draggingRef.current;
      if (!drag.id) return;
      // snap threshold (pixels)
      const snapThreshold = Math.max(20, Math.min(window.innerWidth, window.innerHeight) * 0.03);
      setPieces(prev =>
        prev.map(p => {
          if (p.id !== drag.id) return p;
          const dx = p.x - p.homeX;
          const dy = p.y - p.homeY;
          if (Math.hypot(dx, dy) < snapThreshold) {
            // snap into place and lock
            return { ...p, x: p.homeX, y: p.homeY, locked: true };
          }
          // else keep current position
          return p;
        })
      );

      draggingRef.current = { id: null, offsetX: 0, offsetY: 0 };
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    }

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, []);

  // On pointer down for a piece
  function handlePointerDown(e, piece) {
    // bring the piece to front by reordering pieces array (so it draws on top visually)
    setPieces(prev => {
      const others = prev.filter(p => p.id !== piece.id);
      const me = prev.find(p => p.id === piece.id);
      return [...others, me];
    });

    // compute offset from pointer to top-left of the piece's DOM position
    const rect = containerRef.current.getBoundingClientRect();
    const offsetX = e.clientX - (rect.left + piece.x);
    const offsetY = e.clientY - (rect.top + piece.y);
    draggingRef.current = { id: piece.id, offsetX, offsetY };

    // attach pointermove/up are handled globally in effect above (window listeners)
  }

  // winner check
  useEffect(() => {
    if (pieces.length === 0) return;
    const allLocked = pieces.every(p => p.locked);
    if (allLocked) {
      // simple solved action
      console.log('Puzzle solved!');
      // maybe show a visual confirmation: for simplicity just alert
      setTimeout(() => alert('You solved the puzzle!'), 200);
    }
  }, [pieces]);

  // Render piece canvases absolutely positioned
  return (
    <div className="puzzle-wrap">
      <div ref={containerRef} className="puzzle-container">
        {pieces.map(p => (
          <canvas
            key={p.id}
            ref={el => (canvasesRef.current[p.id] = el)}
            className="puzzle-piece"
            style={{
              width: p.w + 'px',
              height: p.h + 'px',
              transform: `translate(${p.x}px, ${p.y}px)`,
              zIndex: p.locked ? 1 : 1000, // non-locked pieces on top
              cursor: p.locked ? 'default' : 'grab',
            }}
            onPointerDown={e => {
              if (!p.locked) {
                (e.target).setPointerCapture?.(e.pointerId);
                handlePointerDown(e, p);
              }
            }}
            // prevent default to avoid text selection on drag
            onPointerMove={e => e.preventDefault()}
          />
        ))}
      </div>
    </div>
  );
}
