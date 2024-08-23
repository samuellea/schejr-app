import React from 'react';
import styles from './MainArea.module.css';
import List from '../List/List';

function MainArea({ selectedList, updateList, userUID }) {
  // will show either the selected List, or if a list item is selected, a List Item expanded view
  return (
    <div className={styles.container}>
      {selectedList ? (
        <List
          selectedList={selectedList}
          updateList={updateList}
          userUID={userUID}
        />
      ) : null}
    </div>
  );
}

export default MainArea;
