import React from 'react';
import styles from './ToggleSwitch.module.css';
import ChevronIcon from '../Icons/ChevronIcon';

function ToggleSwitch({ toggleValue, setToggleValue }) {
  const sliderCombined = `${styles.slider} ${styles.round}`;
  return (
    <div className={styles.container}>
      <label className={styles.switch}>
        <input
          type="checkbox"
          checked={toggleValue}
          onChange={setToggleValue}
        />
        <span className={sliderCombined}></span>
      </label>
    </div>
  );
}

export default ToggleSwitch;
