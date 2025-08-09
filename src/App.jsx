import { useEffect, useRef, useState } from 'react'
import './App.css'

function App() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [pieces, setPieces] = useState([])
  const [emptyIndex, setEmptyIndex] = useState(11) // Bottom-right piece is empty initially
  const gridSize = { rows: 3, cols: 4 }
  const totalPieces = gridSize.rows * gridSize.cols

  const shuffleArray = (array) => {
    // Only shuffle positions that create a solvable puzzle
    let shuffled = [...array];
    for (let i = shuffled.length - 2; i > 0; i--) {
      // Don't include the empty piece in shuffling
      if (!shuffled[i].isEmpty) {
        const j = Math.floor(Math.random() * i);
        if (!shuffled[j].isEmpty) {
          // Swap positions, not IDs
          const currentPosTemp = shuffled[i].currentPos;
          shuffled[i].currentPos = shuffled[j].currentPos;
          shuffled[j].currentPos = currentPosTemp;
        }
      }
    }
    return shuffled;
  }

  useEffect(() => {
    // Initialize piece positions (0 to 11 in order)
    const initialPieces = Array.from({ length: totalPieces }, (_, i) => ({
      id: i,
      currentPos: i,
      isEmpty: i === emptyIndex
    }))
    
    // Shuffle the pieces while keeping the empty piece at its position
    const shuffledPieces = shuffleArray(initialPieces);
    setPieces(shuffledPieces);

    // Camera setup
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        })
        .catch(err => console.error("Camera error:", err))
    }

    return () => {
      const stream = videoRef.current?.srcObject
      stream?.getTracks().forEach(track => track.stop())
    }
  }, [])

  const canMove = (pieceIndex) => {
    const row = Math.floor(pieceIndex / gridSize.cols)
    const col = pieceIndex % gridSize.cols
    const emptyRow = Math.floor(emptyIndex / gridSize.cols)
    const emptyCol = emptyIndex % gridSize.cols

    return (
      (row === emptyRow && Math.abs(col - emptyCol) === 1) ||
      (col === emptyCol && Math.abs(row - emptyRow) === 1)
    )
  }

  const handlePieceClick = (index) => {
    if (!canMove(index)) return

    setPieces(prevPieces => {
      const newPieces = [...prevPieces]
      // Swap clicked piece with empty piece
      const temp = newPieces[index]
      newPieces[index] = newPieces[emptyIndex]
      newPieces[emptyIndex] = temp
      return newPieces
    })
    setEmptyIndex(index)
  }

  useEffect(() => {
    const drawFrame = () => {
      if (!videoRef.current || !canvasRef.current) return

      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      const pieceWidth = canvas.width / gridSize.cols
      const pieceHeight = canvas.height / gridSize.rows

      // Clear the canvas first
      context.clearRect(0, 0, canvas.width, canvas.height)

      // Draw pieces in their shuffled positions
      pieces.forEach((piece) => {
        if (piece.isEmpty) {
          // Draw dark rectangle for empty piece
          const targetRow = Math.floor(piece.currentPos / gridSize.cols)
          const targetCol = piece.currentPos % gridSize.cols
          context.fillStyle = 'rgba(0, 0, 0, 0.7)'
          context.fillRect(
            targetCol * pieceWidth,
            targetRow * pieceHeight,
            pieceWidth,
            pieceHeight
          )
        } else {
          // Draw piece in its current position
          const sourceRow = Math.floor(piece.id / gridSize.cols)
          const sourceCol = piece.id % gridSize.cols
          const targetRow = Math.floor(piece.currentPos / gridSize.cols)
          const targetCol = piece.currentPos % gridSize.cols

          // Draw only the piece's portion of the video
          const sx = sourceCol * pieceWidth
          const sy = sourceRow * pieceHeight
          const dx = targetCol * pieceWidth
          const dy = targetRow * pieceHeight

          context.drawImage(
            videoRef.current,
            sx, sy, pieceWidth, pieceHeight,  // source coordinates
            dx, dy, pieceWidth, pieceHeight   // destination coordinates
          )
        }
      })

      // Draw grid lines
      context.strokeStyle = 'white'
      context.lineWidth = 2

      // Vertical lines
      for (let i = 1; i < gridSize.cols; i++) {
        context.beginPath()
        context.moveTo(i * pieceWidth, 0)
        context.lineTo(i * pieceWidth, canvas.height)
        context.stroke()
      }

      // Horizontal lines
      for (let i = 1; i < gridSize.rows; i++) {
        context.beginPath()
        context.moveTo(0, i * pieceHeight)
        context.lineTo(canvas.width, i * pieceHeight)
        context.stroke()
      }

      requestAnimationFrame(drawFrame)
    }

    drawFrame()
  }, [pieces])

  return (
    <div className="puzzle-container">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        style={{ display: 'none' }}
      />
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        onClick={(e) => {
          const rect = canvasRef.current.getBoundingClientRect()
          const x = e.clientX - rect.left
          const y = e.clientY - rect.top
          const col = Math.floor(x / (640 / gridSize.cols))
          const row = Math.floor(y / (480 / gridSize.rows))
          const index = row * gridSize.cols + col
          handlePieceClick(index)
        }}
      />
    </div>
  )
}

export default App
