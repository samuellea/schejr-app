import React from 'react';
import styles from './TopBar.module.css';
import ChevronIcon from '../Icons/ChevronIcon';

function TopBar({ toggleSidebar }) {
  return (
    <div className={styles.container}>
      <div
        role="button"
        className={styles.listsHeaderButton}
        onClick={toggleSidebar}
      >
        <ChevronIcon fill="white" width="16px" flip />
      </div>
    </div>
  );
}

export default TopBar;
