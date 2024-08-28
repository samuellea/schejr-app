import React, { useState, useEffect, useRef } from 'react';
import styles from './TagOptions.module.css';

function TagOptions({
  tag,
  tagColorOptions,
  handleUpdateExistingTag,
  onChildClickOutside,
}) {
  const [tagRenameText, setTagRenameText] = useState(tag.name);

  const tagOptionsRef = useRef(null);
  const hasMounted = useRef(false);
  const tagRenameTextRef = useRef(tagRenameText);

  useEffect(() => {
    tagRenameTextRef.current = tagRenameText;
  }, [tagRenameText]);

  const handleInputChange = (e) => {
    const text = e.target.value;
    setTagRenameText(text);
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

  const hitEnter = (event) => {
    if (event.key === 'Enter') {
      handleUpdateExistingTag(tag, 'name', tagRenameTextRef.current);
    }
  };

  const handleClickOffChild = (event) => {
    if (hasMounted.current) {
      // Only handle clicks outside if the component has already mounted
      event.stopPropagation(); // Stop the event from bubbling up to the parent
      console.log('Child component click outside logic triggered');
      // console.log('tag.name: ', tag.name);
      // console.log('tagRenameText: ', tagRenameTextRef.current);
      handleUpdateExistingTag(tag, 'name', tagRenameTextRef.current);
      onChildClickOutside(); // Notify the parent that the child's logic has been executed
    }
  };

  useEffect(() => {
    // Mark the component as mounted
    hasMounted.current = true;

    const handleClickOutside = (event) => {
      if (
        tagOptionsRef.current &&
        !tagOptionsRef.current.contains(event.target)
      ) {
        handleClickOffChild(event);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [onChildClickOutside]); // Depend on onChildClickOutside

  return (
    <div
      className={styles.container}
      onClick={(e) => {
        e.stopPropagation();
      }}
      ref={tagOptionsRef}
    >
      <div className={styles.tagNameInputContainer}>
        <input
          className={styles.tagNameInput}
          onChange={handleInputChange}
          value={tagRenameText}
          onKeyDown={hitEnter}
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
