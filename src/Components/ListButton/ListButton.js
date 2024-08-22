import React from 'react';
import styles from './ListButton.module.css';

function ListButton({ listName }) {
  const deleteListButton = () => {};
  return (
    <div className={styles.container}>
      <p>{listName}</p>
      <button onClick={deleteListButton}>Delete</button>
    </div>
  );
}

export default ListButton;
