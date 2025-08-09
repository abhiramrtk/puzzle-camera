import PropTypes from 'prop-types';
import '../styles/GameHeader.css';

const GameHeader = ({ difficulty, onBack }) => {
  return (
    <div className="game-header">
      <button className="back-button" onClick={onBack}>
        Change Difficulty
      </button>
      <span className="difficulty-label">
        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Mode
      </span>
    </div>
  );
};

GameHeader.propTypes = {
  difficulty: PropTypes.string.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default GameHeader;
