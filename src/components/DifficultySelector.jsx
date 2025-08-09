import PropTypes from 'prop-types';
import '../styles/DifficultySelector.css';

const DifficultySelector = ({ onSelectDifficulty }) => {
  return (
    <div className="difficulty-selection">
      <div className="title-container">
        <h1>🧩 Puzzle Camera</h1>
        <h2>its just a simple game!</h2>
      </div>
      <p>Choose your challenge level and solve the puzzle using your camera feed</p>
      <div className="difficulty-buttons">
        <button 
          className="difficulty-btn easy"
          onClick={() => onSelectDifficulty('easy')}
        >
          <span className="btn-icon">🟢</span>
          <span className="btn-text">
            <strong>Easy Mode</strong>
            <small>3×3 Grid</small>
          </span>
        </button>
        <button 
          className="difficulty-btn medium"
          onClick={() => onSelectDifficulty('medium')}
        >
          <span className="btn-icon">🟡</span>
          <span className="btn-text">
            <strong>Medium Mode</strong>
            <small>3×4 Grid</small>
          </span>
        </button>
        <button 
          className="difficulty-btn hard"
          onClick={() => onSelectDifficulty('hard')}
        >
          <span className="btn-icon">🔴</span>
          <span className="btn-text">
            <strong>Hard Mode</strong>
            <small>4×4 Grid</small>
          </span>
        </button>
      </div>
      <div className="footer-text">
        <p>✨ have fun solving puzzles! ✨</p>
      </div>
    </div>
  );
};

DifficultySelector.propTypes = {
  onSelectDifficulty: PropTypes.func.isRequired,
};

export default DifficultySelector;
