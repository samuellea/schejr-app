import React, { useState, useEffect } from 'react';
import styles from './ListItemEditPane.module.css';
import TagSelector from '../TagSelector/TagSelector';
import DateSelector from '../DateSelector/DateSelector';
import ChevronIcon from '../Icons/ChevronIcon';
import ToggleSwitch from '../ToggleSwitch/ToggleSwitch';

function ListItemEditPane({
  listItemEditID,
  listItems,
  handleCloseEditPane,
  userUID,
  updateListItem,
  fetchTags,
  existingTags,
  syncWithGCal,
  handleSetSyncWithGCal,
}) {
  const listItem = listItems.find((e) => e.listItemID === listItemEditID); // title is locked in here - so DateSelector wont recieve
  const [listItemRenameText, setListItemRenameText] = useState(listItem.title);

  const handleTitleChange = (e) => {
    const text = e.target.value;
    setListItemRenameText(text);
  };

  const handleTitleOnBlur = () => {
    console.log('about to call updateListItem!');
    updateListItem(listItem, 'title', listItemRenameText);
  };

  useEffect(() => {
    console.log('listItems changed!');
    console.log(listItems);
    console.log(listItem);
  }, [listItems]);

  return (
    <div className={styles.container}>
      <div className={styles.titleAndCloseWrapper}>
        <div className={styles.closeWrapper}>
          <div
            role="button"
            className={styles.closePaneButton}
            onClick={handleCloseEditPane}
          >
            <ChevronIcon fill="white" width="28px" />
          </div>
        </div>
        <input
          className={styles.listItemTitleInput}
          type="text"
          id="listItemTitle"
          onChange={(event) => handleTitleChange(event)}
          value={listItemRenameText}
          onBlur={handleTitleOnBlur}
        ></input>
      </div>
      <div className={styles.fieldWrapper}>
        <div className={styles.fieldIndent} />
        <div className={styles.wrapperLabel}>Tags</div>
        <TagSelector
          userUID={userUID}
          listItem={listItem}
          updateListItem={updateListItem}
          fetchTags={fetchTags}
          existingTags={existingTags}
        />
      </div>

      <div className={styles.fieldWrapper}>
        <div className={styles.fieldIndent} />
        <div className={styles.wrapperLabel}>Date</div>
        <DateSelector
          listItem={listItem}
          updateListItem={updateListItem}
          listItemID={listItem.listItemID}
        />
      </div>
      <div className={styles.fieldWrapper}>
        <div className={styles.fieldIndent} />
        <div className={styles.wrapperLabel}>Sync</div>
        <ToggleSwitch
          syncWithGCal={syncWithGCal}
          handleSetSyncWithGCal={handleSetSyncWithGCal}
        />
      </div>
    </div>
  );
}

export default ListItemEditPane;
