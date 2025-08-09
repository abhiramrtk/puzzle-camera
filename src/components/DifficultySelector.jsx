import PropTypes from 'prop-types';
import '../styles/DifficultySelector.css';

const DifficultySelector = ({ onSelectDifficulty }) => {
  return (
    <div className="difficulty-selection">
      <h2>Sliding Puzzle Game</h2>
      <p>Select your difficulty level to start the game</p>
      <div className="difficulty-buttons">
        <button onClick={() => onSelectDifficulty('easy')}>
          Easy (3×3)
        </button>
        <button onClick={() => onSelectDifficulty('medium')}>
          Medium (3×4)
        </button>
        <button onClick={() => onSelectDifficulty('hard')}>
          Hard (4×4)
        </button>
      </div>
    </div>
  );
};

DifficultySelector.propTypes = {
  onSelectDifficulty: PropTypes.func.isRequired,
};

export default DifficultySelector;
