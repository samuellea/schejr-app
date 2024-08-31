import React from 'react';
import styles from './ListButton.module.css';
import * as u from '../../utils';

function ListButton({
  listName,
  createdAt,
  listID,
  setListsModified,
  handleSelectListButton,
  selected,
  handleDeleteList,
}) {
  const combined = `${styles.container} ${selected ? styles.selected : null}`;

  return (
    <div className={combined} onClick={() => handleSelectListButton(listID)}>
      <p>{listName}</p>
      <button onClick={() => handleDeleteList(listID)}>Delete</button>
    </div>
  );
}

export default ListButton;
