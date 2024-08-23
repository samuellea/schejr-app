import React from 'react';
import styles from './TopBar.module.css';

function TopBar({ toggleSidebar }) {
  return (
    <div className={styles.container}>
      <button onClick={toggleSidebar}>》</button>
    </div>
  );
}

export default TopBar;
