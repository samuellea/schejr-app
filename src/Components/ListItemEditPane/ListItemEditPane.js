import React, { useState } from 'react';
import styles from './ListItemEditPane.module.css';
import TagSelector from '../TagSelector/TagSelector';
import DateSelector from '../DateSelector/DateSelector';
import CloseIcon from '../Icons/CloseIcon';
import ChevronIcon from '../Icons/ChevronIcon';
import ToggleSwitch from '../ToggleSwitch/ToggleSwitch';

function ListItemEditPane({
  listItem,
  handleCloseEditPane,
  userUID,
  updateListItem,
  setListItemsModified,
  fetchTags,
  existingTags,
  syncWithGCal,
  handleSetSyncWithGCal,
}) {
  const [listItemRenameText, setListItemRenameText] = useState(listItem.title);

  const handleTitleChange = (e) => {
    const text = e.target.value;
    setListItemRenameText(text);
  };

  const handleTitleOnBlur = () => {
    console.log('about to call updateListItem!');
    updateListItem(listItem, 'title', listItemRenameText);
  };

  return (
    <div className={styles.container}>
      <div className={styles.titleAndCloseWrapper}>
        <div className={styles.closeWrapper}>
          <div
            role="button"
            className={styles.closePaneButton}
            onClick={handleCloseEditPane}
          >
            {/* <CloseIcon fill="white" width="24px" /> */}
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
          setListItemsModified={setListItemsModified}
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
