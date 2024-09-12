import React from 'react';
import CloseIcon from '../Icons/CloseIcon';
import styles from './CustomCalendarContainer.module.css'; // Your component styles

function CustomCalendarContainer({
  children,
  className,
  showTimeInput,
  handleClearTime,
}) {
  return (
    <div
      className={className}
      style={{ display: 'flex', alignItems: 'center', position: 'relative' }}
    >
      <div style={{ flex: '1' }}>{children}</div>{' '}
      {showTimeInput ? (
        <button onClick={handleClearTime} className={styles.cancelTimeButton}>
          <CloseIcon fill="white" width="12px" />
        </button>
      ) : null}
    </div>
  );
}

export default CustomCalendarContainer;
