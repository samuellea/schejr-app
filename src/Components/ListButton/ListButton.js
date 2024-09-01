import React from 'react';
import styles from './ListButton.module.css';
import * as u from '../../utils';
import TagsIcon from '../Icons/TagsIcon';
import TrashIcon from '../Icons/TrashIcon';

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
      <TagsIcon />
      <p className={styles.listTitle}>{listName}</p>
      <div
        role="button"
        className={styles.deleteListButton}
        onClick={() => handleDeleteList(listID)}
      >
        <TrashIcon fill="#9b9b9b" width="16px" />
      </div>
    </div>
  );
}

export default ListButton;
