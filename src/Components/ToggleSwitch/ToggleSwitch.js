import React from 'react';
import styles from './ToggleSwitch.module.css';
import ChevronIcon from '../Icons/ChevronIcon';

function ToggleSwitch({ syncWithGCal, handleSetSyncWithGCal }) {
  const sliderCombined = `${styles.slider} ${styles.round}`;
  return (
    <div className={styles.container}>
      <label class={styles.switch}>
        <input
          type="checkbox"
          checked={syncWithGCal}
          onChange={handleSetSyncWithGCal}
        />
        <span className={sliderCombined}></span>
      </label>
    </div>
  );
}

export default ToggleSwitch;
