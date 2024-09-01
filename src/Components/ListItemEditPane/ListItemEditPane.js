import React, { useState } from 'react';
import styles from './ListItemEditPane.module.css';
import TagSelector from '../TagSelector/TagSelector';
import DateSelector from '../DateSelector/DateSelector';
import CloseIcon from '../Icons/CloseIcon';

function ListItemEditPane({
  listItem,
  handleCloseEditPane,
  userUID,
  updateListItem,
  setListItemsModified,
  fetchTags,
  existingTags,
}) {
  const [listItemRenameText, setListItemRenameText] = useState(listItem.title);

  const handleTitleChange = (e) => {
    const text = e.target.value;
    setListItemRenameText(text);
    // updateListItem(listItem.listItemID, 'title', text);
  };

  const handleTitleOnBlur = () => {
    updateListItem(listItem.listItemID, 'title', listItemRenameText);
  };

  return (
    <div className={styles.container}>
      <div className={styles.titleAndCloseWrapper}>
        <input
          className={styles.listItemTitleInput}
          type="text"
          id="listItemTitle"
          onChange={(event) => handleTitleChange(event)}
          value={listItemRenameText}
          onBlur={handleTitleOnBlur}
        ></input>
        <div
          role="button"
          className={styles.closePaneButton}
          onClick={handleCloseEditPane}
        >
          <CloseIcon fill="white" width="24px" />
        </div>
      </div>
      <div className={styles.fieldWrapper}>
        <div className={styles.wrapperLabel}>Tags</div>
        <TagSelector
          userUID={userUID}
          listItem={listItem}
          updateListItem={updateListItem}
          setListItemsModified={setListItemsModified}
          fetchTags={fetchTags}
          existingTags={existingTags}
        />
      </div>

      <div className={styles.fieldWrapper}>
        <div className={styles.wrapperLabel}>Date</div>
        <DateSelector
          listItem={listItem}
          updateListItem={updateListItem}
          listItemID={listItem.listItemID}
        />
      </div>
    </div>
  );
}

export default ListItemEditPane;
