import React from 'react';
import styles from './ToggleSwitch.module.css';

function ToggleSwitch({ toggleValue, setToggleValue }) {
  return (
    <div className={styles.container}>
      <input
        className={styles.toggleInput}
        type="checkbox"
        checked={toggleValue}
        onChange={setToggleValue}
        id="switch"
      />
      <label className={styles.toggleLabel} htmlFor="switch"></label>
    </div>
  );
}

export default ToggleSwitch;
