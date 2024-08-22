import React from 'react';
import styles from './MainArea.module.css';

function MainArea({ selectedList, updateList }) {
  const handleTitleChange = (e) => {
    const text = e.target.value;
    updateList(selectedList.listID, 'title', text);
  };

  return (
    <div className={styles.container}>
      <input
        className={styles.listTitleInput}
        type="text"
        id="listTitle"
        onChange={(event) => handleTitleChange(event)}
      ></input>
    </div>
  );
}

export default MainArea;
