import React from 'react';
import styles from './ToggleSwitch.module.css';
import ChevronIcon from '../Icons/ChevronIcon';

function ToggleSwitch({ toggleValue, setToggleValue }) {
  const sliderCombined = `${styles.slider} ${styles.round}`;
  return (
    <div className={styles.container}>
      <input
        classname={styles.toggleInput}
        type="checkbox"
        checked={toggleValue}
        onChange={setToggleValue}
        id="switch"
      />
      <label classname={styles.toggleLabel} htmlFor="switch"></label>
    </div>
  );
}

export default ToggleSwitch;
