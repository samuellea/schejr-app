import React from 'react';
import styles from './ListItemEditPane.module.css';
import TagSelector from '../TagSelector/TagSelector';

function ListItemEditPane({ listItem, handleCloseEditPane }) {
  return (
    <div className={styles.container}>
      <button onClick={handleCloseEditPane}>《</button>
      <h1>Edit</h1>
      <TagSelector />
    </div>
  );
}

export default ListItemEditPane;
