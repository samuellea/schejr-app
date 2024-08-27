import React from 'react';
import styles from './ListItem.module.css';
import * as u from '../../utils';

function ListItem({ listItem, setListItemsModified, handleEditListItem }) {
  // const handleItemTitleChange = (e) => {
  //   const text = e.target.value;
  //   updateListItem(selectedList.listID, 'title', text);
  // };

  const deleteListItem = async () => {
    try {
      await u.deleteListItemByID(listItem.listItemID);
      setListItemsModified(true);
    } catch (error) {
      console.error('Failed to delete list item:', error);
      // You can show an error message to the user, log the error, etc.
    }
  };

  return (
    <div className={styles.container}>
      <button className={styles.deleteListItemButton} onClick={deleteListItem}>
        🗑
      </button>
      <p>{listItem.title}</p>
      <button
        className={styles.editListItemButton}
        onClick={() => handleEditListItem(listItem)}
      >
        ✏️
      </button>
      {/* <button onClick={toggleSidebar}>》</button> */}
    </div>
  );
}

export default ListItem;
