import { useState, useEffect } from 'react';

export const useGameLogic = (canvasRef, videoRef, canvasSize) => {
  const [pieces, setPieces] = useState([]);
  const [emptyIndex, setEmptyIndex] = useState(null);
  const [gridSize, setGridSize] = useState({ rows: 3, cols: 4 });

  const shuffleArray = (array, rows, cols, initialEmptyIndex) => {
    let shuffled = [...array];
    let currentEmptyIndex = initialEmptyIndex;
    
    // Make 50 random valid moves to shuffle
    for (let i = 0; i < 50; i++) {
      const possibleMoves = [];
      const emptyRow = Math.floor(currentEmptyIndex / cols);
      const emptyCol = currentEmptyIndex % cols;
      
      const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      
      directions.forEach(([dx, dy]) => {
        const newRow = emptyRow + dx;
        const newCol = emptyCol + dy;
        
        if (newRow >= 0 && newRow < rows && 
            newCol >= 0 && newCol < cols) {
          possibleMoves.push(newRow * cols + newCol);
        }
      });
      
      if (possibleMoves.length > 0) {
        const randomMoveIndex = Math.floor(Math.random() * possibleMoves.length);
        const newEmptyIndex = possibleMoves[randomMoveIndex];
        
        const pieceToMove = shuffled.find(p => p.currentPos === newEmptyIndex);
        const emptyPiece = shuffled.find(p => p.isEmpty);
        
        if (pieceToMove && emptyPiece) {
          const tempPos = pieceToMove.currentPos;
          pieceToMove.currentPos = emptyPiece.currentPos;
          emptyPiece.currentPos = tempPos;
          currentEmptyIndex = newEmptyIndex;
        }
      }
    }
    
    return { shuffled, finalEmptyIndex: currentEmptyIndex };
  };

  const initializePuzzle = (level) => {
    let rows, cols, lastIndex;
    switch(level) {
      case 'easy':
        rows = 3; cols = 3; lastIndex = 8;
        break;
      case 'medium':
        rows = 3; cols = 4; lastIndex = 11;
        break;
      case 'hard':
        rows = 4; cols = 4; lastIndex = 15;
        break;
      default:
        return;
    }

    setGridSize({ rows, cols });

    const total = rows * cols;
    const initialPieces = Array.from({ length: total }, (_, i) => ({
      id: i,
      currentPos: i,
      isEmpty: i === lastIndex
    }));
    
    const { shuffled, finalEmptyIndex } = shuffleArray(initialPieces, rows, cols, lastIndex);
    setPieces(shuffled);
    setEmptyIndex(finalEmptyIndex);
  };

  const canMove = (pieceIndex) => {
    const row = Math.floor(pieceIndex / gridSize.cols);
    const col = pieceIndex % gridSize.cols;
    const emptyRow = Math.floor(emptyIndex / gridSize.cols);
    const emptyCol = emptyIndex % gridSize.cols;

    return (
      (row === emptyRow && Math.abs(col - emptyCol) === 1) ||
      (col === emptyCol && Math.abs(row - emptyRow) === 1)
    );
  };

  const handlePieceClick = (index) => {
    if (!canMove(index)) return;

    setPieces(prevPieces => {
      const newPieces = [...prevPieces];
      const clickedPiece = newPieces.find(p => p.currentPos === index);
      const emptyPiece = newPieces.find(p => p.isEmpty);

      if (clickedPiece && emptyPiece) {
        // Swap positions
        const tempPos = clickedPiece.currentPos;
        clickedPiece.currentPos = emptyPiece.currentPos;
        emptyPiece.currentPos = tempPos;
        setEmptyIndex(index); // Update empty index after confirming the swap
      }
      
      return newPieces;
    });
  };

  const drawFrame = () => {
    if (!canvasRef.current || !canvasSize.width || !canvasSize.height) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const pieceWidth = canvas.width / gridSize.cols;
    const pieceHeight = canvas.height / gridSize.rows;

    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw pieces
    pieces.forEach((piece) => {
      if (piece.isEmpty) {
        const targetRow = Math.floor(piece.currentPos / gridSize.cols);
        const targetCol = piece.currentPos % gridSize.cols;
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fillRect(
          targetCol * pieceWidth,
          targetRow * pieceHeight,
          pieceWidth,
          pieceHeight
        );
      } else if (videoRef.current?.readyState >= 2) {
        const sourceRow = Math.floor(piece.id / gridSize.cols);
        const sourceCol = piece.id % gridSize.cols;
        const targetRow = Math.floor(piece.currentPos / gridSize.cols);
        const targetCol = piece.currentPos % gridSize.cols;

        context.drawImage(
          videoRef.current,
          sourceCol * (videoRef.current.videoWidth / gridSize.cols),
          sourceRow * (videoRef.current.videoHeight / gridSize.rows),
          videoRef.current.videoWidth / gridSize.cols,
          videoRef.current.videoHeight / gridSize.rows,
          targetCol * pieceWidth,
          targetRow * pieceHeight,
          pieceWidth,
          pieceHeight
        );
      }
    });

    // Draw grid
    const lineWidth = Math.max(1, Math.min(canvasSize.width, canvasSize.height) / 200);
    context.strokeStyle = 'white';
    context.lineWidth = lineWidth;

    // Vertical lines
    for (let i = 1; i < gridSize.cols; i++) {
      context.beginPath();
      context.moveTo(i * pieceWidth, 0);
      context.lineTo(i * pieceWidth, canvas.height);
      context.stroke();
    }

    // Horizontal lines
    for (let i = 1; i < gridSize.rows; i++) {
      context.beginPath();
      context.moveTo(0, i * pieceHeight);
      context.lineTo(canvas.width, i * pieceHeight);
      context.stroke();
    }

    requestAnimationFrame(drawFrame);
  };

  return {
    pieces,
    gridSize,
    handlePieceClick,
    initializePuzzle,
    drawFrame
  };
};
