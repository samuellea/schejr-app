import React, { useState, useEffect } from 'react';
import styles from './ListItem.module.css';
import * as u from '../../utils';
import * as h from '../../helpers';
import TrashIcon from '../Icons/TrashIcon';
import EditIcon from '../Icons/EditIcon';

function ListItem({
  listItem,
  setListItemsModified,
  handleEditListItem,
  existingTags,
  deleteListItem,
  updateListItem,
}) {
  const [listItemRenameText, setListItemRenameText] = useState(listItem.title);

  const handleTitleChange = (e) => {
    const text = e.target.value;
    setListItemRenameText(text);
  };

  const handleTitleOnBlur = () => {
    updateListItem(listItem, 'title', listItemRenameText);
  };

  useEffect(() => {
    setListItemRenameText(listItem.title);
  }, [listItem]);

  return (
    <div className={styles.container}>
      <button
        className={styles.deleteListItemButton}
        onClick={() => deleteListItem(listItem)}
      >
        <TrashIcon fill="white" width="16px" />
      </button>
      <button
        className={styles.editListItemButton}
        onClick={() => handleEditListItem(listItem)}
      >
        <EditIcon fill="white" width="16px" />
      </button>
      <div className={styles.titleTagsDatesWrapper}>
        {/* <p className={styles.listItemTitle}>{listItem.title}</p> */}
        <input
          className={styles.listItemTitle}
          onChange={handleTitleChange}
          onBlur={handleTitleOnBlur}
          value={listItemRenameText}
        />
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
        <div className={styles.dateContainer}>{h.dateLabel(listItem.date)}</div>
      </div>
    </div>
  );
}

export default ListItem;
