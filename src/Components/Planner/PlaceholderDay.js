import React from 'react';
import styles from './PlaceholderDay.module.css';

// Using forwardRef to pass the ref down the tree
const PlaceholderDay = ({
  date,
  dateEvents,
  viewMonth,
  events,
  handleEvents,
  existingTags,
  setExistingTags,
  handleEntities,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.dayHeader}>
        <div className={styles.titlePlaceholder} />
      </div>
    </div>
  );
};

export default PlaceholderDay;
