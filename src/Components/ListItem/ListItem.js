import React from 'react';
import styles from './ListItem.module.css';
import * as u from '../../utils';

function ListItem({
  listItem,
  setListItemsModified,
  handleEditListItem,
  existingTags,
  tidyManualOrdersOnDelete,
}) {
  // const handleItemTitleChange = (e) => {
  //   const text = e.target.value;
  //   updateListItem(selectedList.listID, 'title', text);
  // };

  const deleteListItem = async () => {
    try {
      await u.deleteListItemByID(listItem.listItemID);
      try {
        tidyManualOrdersOnDelete(listItem.listItemID, listItem.parentID);
      } catch (error) {}
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
      <p className={styles.listItemTitle}>{listItem.title}</p>
      <button
        className={styles.editListItemButton}
        onClick={() => handleEditListItem(listItem)}
      >
        ✏️
      </button>
      {/* <button onClick={toggleSidebar}>》</button> */}
      <div className={styles.tagsContainer}>
        {listItem?.tags?.map((tag) => {
          const matchingTag = existingTags?.find(
            (existingTag) => existingTag.tagID === tag
          );
          return (
            <div
              className={styles.tag}
              key={`list-item-inner-${tag}`}
              style={{ backgroundColor: matchingTag?.color }}
            >
              {matchingTag?.name}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ListItem;
