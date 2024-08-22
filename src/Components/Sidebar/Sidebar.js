import React from 'react';
import styles from './Sidebar.module.css';
import ListButton from '../ListButton/ListButton';

function Sidebar() {
  return (
    <div className={styles.container}>
      <div className={styles.listsHeader}>
        <p>Lists</p>
        <button onClick={() => {}}>Add</button>
      </div>
      {/* <ListButton listName={'List 1'} /> */}
    </div>
  );
}

export default Sidebar;

/*

 */
