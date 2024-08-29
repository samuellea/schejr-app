import React, { useState, useEffect } from 'react';
import styles from './DateSelector.module.css';

function DateSelector({}) {
  const [isInFocus, setIsInFocus] = useState(false);
  const [todaysDate, setTodaysDate] = useState(null);

  useEffect(() => {
    const dateToday = new Date();
    console.log(dateToday.now());
  }, []);

  const handleToggleFocus = () => {
    if (!isInFocus) {
      setIsInFocus(true);
    } else {
      setIsInFocus(false);
    }
  };

  const inputContainerCombined = `${styles.inputContainer} ${
    isInFocus ? styles.isInFocus : null
  }`;

  return (
    <div className={styles.container}>
      <div
        className={inputContainerCombined}
        onClick={(e) => {
          e.stopPropagation();
          handleToggleFocus();
        }}
      >
        <p className={styles.emptyLabel}>Empty</p>
        {isInFocus ? <div className={styles.dropdown}>dddd</div> : null}
      </div>
    </div>
  );
}

export default DateSelector;
