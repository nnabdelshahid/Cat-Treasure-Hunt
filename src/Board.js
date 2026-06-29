import React, { Component } from 'react';
import Boxes from './Boxes.js';

const DIFFICULTIES = {
  easy: {
    label: 'Easy',
    attempts: 7,
  },
  normal: {
    label: 'Normal',
    attempts: 5,
  },
  hard: {
    label: 'Hard',
    attempts: 4,
  },
};

const createTargets = () => {
  const catIndex = Math.floor(Math.random() * 9);
  let dogIndex = Math.floor(Math.random() * 9);

  while (dogIndex === catIndex) {
    dogIndex = Math.floor(Math.random() * 9);
  }

  return { catIndex, dogIndex };
};

const createBoxes = () => Array(9).fill('hidden');
const TREASURE_SPARKS = Array.from({ length: 12 }, (_, index) => index);
const PAW_TRAILS = Array.from({ length: 5 }, (_, index) => index);

class Board extends Component {
  constructor(props) {
    super(props);
    const targets = createTargets();

    this.state = {
      boxes: createBoxes(),
      difficulty: 'normal',
      attemptsLeft: DIFFICULTIES.normal.attempts,
      gameStatus: 'playing',
      message: 'Pick a box. The closer you get, the warmer the hint.',
      wins: 0,
      losses: 0,
      ...targets,
    };
  }

  getDistance = (index) => {
    const { catIndex } = this.state;
    const row = Math.floor(index / 3);
    const col = index % 3;
    const catRow = Math.floor(catIndex / 3);
    const catCol = catIndex % 3;

    return Math.abs(row - catRow) + Math.abs(col - catCol);
  };

  getHint = (index) => {
    const distance = this.getDistance(index);

    if (distance === 1) {
      return 'Very warm. The cat is next door.';
    }

    if (distance === 2) {
      return 'Warm. You are getting close.';
    }

    return 'Cold. Try another side of the board.';
  };

  restartGame = (difficulty = this.state.difficulty) => {
    const targets = createTargets();

    this.setState({
      boxes: createBoxes(),
      difficulty,
      attemptsLeft: DIFFICULTIES[difficulty].attempts,
      gameStatus: 'playing',
      message: 'Pick a box. The closer you get, the warmer the hint.',
      ...targets,
    });
  };

  boxLocation = (index) => {
    this.setState((prevState) => {
      if (prevState.gameStatus !== 'playing' || prevState.boxes[index] !== 'hidden') {
        return null;
      }

      const boxes = prevState.boxes.slice();

      if (index === prevState.catIndex) {
        boxes[index] = 'cat';
        return {
          boxes,
          gameStatus: 'won',
          message: 'You found the cat!',
          wins: prevState.wins + 1,
        };
      }

      if (index === prevState.dogIndex) {
        boxes[index] = 'dog';
        return {
          boxes,
          gameStatus: 'lost',
          message: 'The dog found you first.',
          losses: prevState.losses + 1,
        };
      }

      boxes[index] = 'empty';
      const attemptsLeft = prevState.attemptsLeft - 1;

      if (attemptsLeft <= 0) {
        boxes[prevState.catIndex] = 'cat';
        return {
          boxes,
          attemptsLeft: 0,
          gameStatus: 'lost',
          message: 'No boxes left. The cat was hiding here.',
          losses: prevState.losses + 1,
        };
      }

      return {
        boxes,
        attemptsLeft,
        message: this.getHint(index),
      };
    });
  };

  getResultDetails = () => {
    const { gameStatus, message } = this.state;

    if (gameStatus === 'playing') {
      return null;
    }

    if (gameStatus === 'won') {
      return {
        tone: 'won',
        mode: 'cat',
        icon: '😸',
        title: 'You found the cat!',
        text: 'The treasure chest bursts open and the cat jumps into the spotlight.',
      };
    }

    const dogFoundYou = message.toLowerCase().includes('dog');

    return {
      tone: 'lost',
      mode: dogFoundYou ? 'dog' : 'hidden',
      icon: dogFoundYou ? '🐕' : '😿',
      title: dogFoundYou ? 'The dog found you!' : 'The cat slipped away.',
      text: message,
    };
  };

  renderResultAnimation = () => {
    const details = this.getResultDetails();

    if (!details) {
      return null;
    }

    return (
      <section
        className={`result-scene result-scene--${details.tone} result-scene--${details.mode}`}
        aria-live="polite"
        aria-label={details.title}
      >
        <div className="treasure-stage" aria-hidden="true">
          <span className="stage-glow" />
          <div className="treasure-box">
            <span className="treasure-lid" />
            <span className="treasure-base" />
            <span className="treasure-lock" />
          </div>
          <div className="result-character">{details.icon}</div>
          {TREASURE_SPARKS.map((spark) => (
            <span key={`spark-${spark}`} className={`treasure-spark treasure-spark--${spark + 1}`} />
          ))}
          {PAW_TRAILS.map((trail) => (
            <span key={`trail-${trail}`} className={`paw-trail paw-trail--${trail + 1}`} />
          ))}
        </div>
        <div className="result-message">
          <span className="result-kicker">{details.tone === 'won' ? 'Treasure found' : 'Hunt ended'}</span>
          <h2>{details.title}</h2>
          <p>{details.text}</p>
        </div>
      </section>
    );
  };

  render() {
    const { attemptsLeft, boxes, difficulty, gameStatus, losses, message, wins } = this.state;

    return (
      <main className="hunt-shell">
        <section className="hunt-card" aria-labelledby="hunt-title">
          <div className="hunt-header">
            <div>
              <p className="eyebrow">Tiny treasure game</p>
              <h1 id="hunt-title">Find Your Cat</h1>
            </div>
            <div className={`status-card status-card--${gameStatus}`} aria-live="polite">
              {message}
            </div>
          </div>

          <div className="stats-bar" aria-label="Game stats">
            <div>
              <span>Boxes left</span>
              <strong>{attemptsLeft}</strong>
            </div>
            <div>
              <span>Wins</span>
              <strong>{wins}</strong>
            </div>
            <div>
              <span>Losses</span>
              <strong>{losses}</strong>
            </div>
          </div>

          <div className="difficulty-bar" aria-label="Difficulty">
            {Object.keys(DIFFICULTIES).map((key) => (
              <button
                type="button"
                key={key}
                className={difficulty === key ? 'is-active' : ''}
                onClick={() => this.restartGame(key)}
              >
                {DIFFICULTIES[key].label}
              </button>
            ))}
          </div>

          <div className="gamebox" role="grid" aria-label="Treasure boxes">
            {boxes.map((value, index) => (
              <Boxes
                key={index}
                value={value}
                index={index}
                isDisabled={gameStatus !== 'playing' || value !== 'hidden'}
                boxLocation={this.boxLocation}
              />
            ))}
          </div>

          {this.renderResultAnimation()}

          <div className="controls">
            <button type="button" className="primary-button" onClick={() => this.restartGame()}>
              New game
            </button>
          </div>
        </section>
      </main>
    );
  }
}

export default Board;
