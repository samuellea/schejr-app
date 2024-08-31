import React from 'react';
import styles from './ListItem.module.css';
import * as u from '../../utils';

function ListItem({
  listItem,
  setListItemsModified,
  handleEditListItem,
  existingTags,
  deleteListItem,
}) {
  // const handleItemTitleChange = (e) => {
  //   const text = e.target.value;
  //   updateListItem(selectedList.listID, 'title', text);
  // };

  return (
    <div className={styles.container}>
      <button
        className={styles.deleteListItemButton}
        onClick={() => deleteListItem(listItem)}
      >
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
