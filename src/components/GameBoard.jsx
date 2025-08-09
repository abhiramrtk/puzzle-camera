import PropTypes from 'prop-types';
import '../styles/GameBoard.css';

const GameBoard = ({ 
  canvasRef, 
  canvasSize, 
  handleCanvasClick, 
  cameraError 
}) => {
  return (
    <div className="game-board">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onClick={handleCanvasClick}
      />
      {cameraError && (
        <div className="camera-error">
          {cameraError}
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
};

export default GameBoard;
