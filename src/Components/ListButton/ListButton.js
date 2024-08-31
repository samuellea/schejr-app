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
}) {
  const combined = `${styles.container} ${selected ? styles.selected : null}`;

  const deleteList = async () => {
    try {
      await u.deleteListByID(listID);
      setListsModified(true);
    } catch (error) {
      console.error('Failed to delete list:', error);
      // You can show an error message to the user, log the error, etc.
    }
  };
  return (
    <div className={combined} onClick={() => handleSelectListButton(listID)}>
      <p>{listName}</p>
      <button onClick={deleteList}>Delete</button>
    </div>
  );
}

export default ListButton;
