import React, { useState, useEffect, useRef } from 'react';
import styles from './TagSelector.module.css';

function TagSelector({}) {
  const [isInFocus, setIsInFocus] = useState(false);

  const inputRef = useRef(null);

  const inputContainerCombined = `${styles.inputContainer} ${
    isInFocus ? styles.isInFocus : null
  }`;

  const inputCombined = `${isInFocus ? styles.isInFocus : null}`;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setIsInFocus(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={inputContainerCombined}>
        <input
          className={inputCombined}
          ref={inputRef}
          onClick={(e) => {
            e.stopPropagation();
            setIsInFocus(true);
          }}
        />
      </div>
    </div>
  );
}

export default TagSelector;
