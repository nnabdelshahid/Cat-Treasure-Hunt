import React from 'react';

const contentByValue = {
  hidden: 'Gift',
  empty: 'X',
  cat: 'Cat',
  dog: 'Dog',
};

const visualByValue = {
  hidden: '🎁',
  empty: 'X',
  cat: '😸',
  dog: '🐕',
};

function Boxes({ boxLocation, index, isDisabled, value }) {
  return (
    <button
      type="button"
      className={`box box--${value}`}
      onClick={() => boxLocation(index)}
      disabled={isDisabled}
      aria-label={`Box ${index + 1}: ${contentByValue[value]}`}
    >
      {visualByValue[value]}
    </button>
  );
}

export default Boxes;
