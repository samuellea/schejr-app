import React, { useState } from 'react';
import styles from './TagOptions.module.css';

function TagOptions({ tag, tagColorOptions }) {
  const [tagNameText, setTagNameText] = useState('');

  const handleInputChange = (e) => {
    const text = e.target.value;
    setTagNameText(text);
  };

  const handleDeleteTag = () => {};

  const colorNameLookup = {
    '#373737': 'Light Gray',
    '#5a5a5a': 'Gray',
    '#603b2c': 'Brown',
    '#654c1c': 'Orange',
    '#835e33': 'Yellow',
    '#2b5940': 'Green',
    '#28456c': 'Blue',
    '#493064': 'Purple',
    '#69314C': 'Pink',
    '#6E3630': 'Red',
  };

  return (
    <div
      className={styles.container}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div className={styles.tagNameInputContainer}>
        <input
          className={styles.tagNameInput}
          onChange={handleInputChange}
          value={tagNameText}
        />
      </div>

      <div
        className={`${styles.tagOptionsButton} ${styles.deleteTagButton}`}
        onClick={handleDeleteTag}
      >
        <div className={styles.deleteIconContainer}>🗑️</div>
        <div className={styles.deleteLabel}>Delete</div>
      </div>
      <div className={styles.coloursSectionDivider}>Colours</div>

      {tagColorOptions.map((color) => (
        <div
          className={`${styles.tagOptionsButton} ${styles.colourOptionButton}`}
        >
          <div
            className={styles.colourBox}
            style={{ backgroundColor: color }}
          ></div>
          <div className={styles.colourLabel}>{colorNameLookup[color]}</div>
        </div>
      ))}
    </div>
  );
}

export default TagOptions;
