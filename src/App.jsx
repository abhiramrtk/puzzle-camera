import { useEffect, useRef, useState } from 'react'
import './styles/App.css'
import DifficultySelector from './components/DifficultySelector'
import GameBoard from './components/GameBoard'
import GameHeader from './components/GameHeader'
import { useGameLogic } from './hooks/useGameLogic'
import { useCamera } from './hooks/useCamera'
import { useCanvas } from './hooks/useCanvas'

function App() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [difficulty, setDifficulty] = useState(null)
  
  const { canvasSize, updateCanvasSize } = useCanvas(containerRef);
  const { cameraError, isInitializing, initializeCamera, stopCamera } = useCamera(videoRef, canvasSize);
  const { 
    pieces, 
    gridSize, 
    handlePieceClick,
    initializePuzzle,
    drawFrame 
  } = useGameLogic(canvasRef, videoRef, canvasSize);

  const handleDifficultySelect = (level) => {
    setDifficulty(level);
    initializePuzzle(level);
    initializeCamera();
  };

  const handleBack = () => {
    setDifficulty(null);
    stopCamera();
  };

  const handleCanvasClick = (e) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasSize.width / rect.width;
    const scaleY = canvasSize.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const col = Math.floor(x / (canvasSize.width / gridSize.cols));
    const row = Math.floor(y / (canvasSize.height / gridSize.rows));
    
    if (col >= 0 && col < gridSize.cols && row >= 0 && row < gridSize.rows) {
      const index = row * gridSize.cols + col;
      handlePieceClick(index);
    }
  };

  useEffect(() => {
    if (difficulty) {
      drawFrame();
    }
  }, [difficulty, pieces, canvasSize]);

  return (
    <div className="app-container" ref={containerRef}>
      <div className="game-container">
        {!difficulty ? (
          <DifficultySelector onSelectDifficulty={handleDifficultySelect} />
        ) : (
          <>
            <GameHeader 
              difficulty={difficulty} 
              onBack={handleBack}
            />
            <GameBoard
              canvasRef={canvasRef}
              canvasSize={canvasSize}
              handleCanvasClick={handleCanvasClick}
              cameraError={cameraError}
              isInitializing={isInitializing}
            />
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              controls={false}
              webkit-playsinline="true"
              x5-playsinline="true"
              className="hidden-video"
              style={{
                position: 'absolute',
                top: '-9999px',
                left: '-9999px',
                width: '1px',
                height: '1px',
                opacity: 0,
                pointerEvents: 'none'
              }}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default App