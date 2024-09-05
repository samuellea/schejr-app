import React, { useState, useEffect, useRef } from 'react';
import styles from './ListItemEditPane.module.css';
import TagSelector from '../TagSelector/TagSelector';
import DateSelector from '../DateSelector/DateSelector';
import ChevronIcon from '../Icons/ChevronIcon';
import ToggleSwitch from '../ToggleSwitch/ToggleSwitch';

function ListItemEditPane({
  listItemEditID,
  listItems,
  setListItems,
  handleCloseEditPane,
  userUID,
  updateListItem,
  // fetchTags,
  existingTags,
  setExistingTags,
  syncWithGCal,
  handleSetSyncWithGCal,
}) {
  // title is locked in here - so DateSelector wont recieve
  const [listItem, setListItem] = useState(
    listItems.find((e) => e.listItemID === listItemEditID)
  );
  const [listItemRenameText, setListItemRenameText] = useState(listItem.title);
  const [commentText, setCommentText] = useState(listItem.comment);

  const handleTitleChange = (e) => {
    const text = e.target.value;
    setListItemRenameText(text);
  };

  const handleTitleOnBlur = () => {
    updateListItem(listItem, 'title', listItemRenameText);
  };

  const handleCommentOnBlur = () => {
    updateListItem(listItem, 'comment', commentText);
  };

  useEffect(() => {
    if (!listItemEditID) {
      console.log(listItemEditID);
      handleCloseEditPane();
    } else {
      console.log('listItems changed!');
      const listItem = listItems.find((e) => e.listItemID === listItemEditID);
      setListItem(listItem);
    }
  }, [listItems, listItemEditID]);

  const textareaRef = useRef(null);

  // Function to adjust the height based on content
  const adjustHeight = (element) => {
    if (element) {
      element.style.height = 'auto'; // Reset height to auto to get the full content height
      element.style.height = `${element.scrollHeight}px`; // Set height to scrollHeight
    }
  };

  // Handle input to adjust height
  const handleInput = (e) => {
    if (textareaRef.current) {
      adjustHeight(textareaRef.current);
    }
    setCommentText(e.target.value);
  };

  // Adjust height on mount and whenever content changes
  useEffect(() => {
    adjustHeight(textareaRef.current);
  }, []);

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
        <div className={styles.wrapperLabel} id={styles.tagsFieldLabel}>
          <p className={styles.tagsLabelP}>Tags</p>
        </div>
        <TagSelector
          userUID={userUID}
          listItem={listItem}
          updateListItem={updateListItem}
          // fetchTags={fetchTags}
          existingTags={existingTags}
          setExistingTags={setExistingTags}
          listItems={listItems}
          setListItems={setListItems}
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
        <span className={styles.syncExplanation}>
          {syncWithGCal
            ? 'Synchronizing all your dates with Google Calendar'
            : 'Turn on to synchronize all your dates with Google Calendar'}
        </span>
      </div>
      <div className={styles.fieldWrapper}>
        <div className={styles.fieldIndent} />
        <div className={styles.dividerLine} />
      </div>

      <div className={styles.fieldWrapper}>
        <div className={styles.fieldIndent} />
        <div className={styles.wrapperLabel}>Comment</div>
      </div>

      <div className={styles.fieldWrapper} style={{ alignItems: 'flex-start' }}>
        <div className={styles.fieldIndent} style={{ minWidth: '55px' }} />
        <div className={styles.commentContainer}>
          <textarea
            className={styles.commentTextArea}
            placeholder="Add a comment..."
            ref={textareaRef}
            onInput={handleInput}
            value={commentText}
            onBlur={handleCommentOnBlur}
          />
        </div>
      </div>
    </div>
  );
}

export default ListItemEditPane;
