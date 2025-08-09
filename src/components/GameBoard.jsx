import PropTypes from 'prop-types';
import '../styles/GameBoard.css';

const GameBoard = ({ 
  canvasRef, 
  canvasSize, 
  handleCanvasClick, 
  cameraError,
  isInitializing 
}) => {
  return (
    <div className="game-board">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onClick={handleCanvasClick}
      />
      {isInitializing && (
        <div className="camera-loading">
          <div className="loading-spinner"></div>
          <p>Initializing camera...</p>
        </div>
      )}
      {cameraError && !isInitializing && (
        <div className="camera-error">
          <p>{cameraError}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

GameBoard.propTypes = {
  canvasRef: PropTypes.object.isRequired,
  canvasSize: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }).isRequired,
  handleCanvasClick: PropTypes.func.isRequired,
  cameraError: PropTypes.string,
  isInitializing: PropTypes.bool,
};

export default GameBoard;
