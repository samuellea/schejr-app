import React, { useState, useEffect, useRef } from 'react';
import styles from './ListItemEditPane.module.css';
import TagSelector from '../TagSelector/TagSelector';
import DateSelector from '../DateSelector/DateSelector';
import ChevronIcon from '../Icons/ChevronIcon';
import TagsIcon from '../Icons/TagsIcon';
import DateIcon from '../Icons/DateIcon';
import SyncIcon from '../Icons/SyncIcon';
import ToggleSwitch from '../ToggleSwitch/ToggleSwitch';
import NotesIcon from '../Icons/NotesIcon';

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
  const [notesText, setNotesText] = useState(listItem.notes);

  const handleTitleChange = (e) => {
    const text = e.target.value;
    setListItemRenameText(text);
  };

  const handleTitleOnBlur = () => {
    updateListItem(listItem, 'title', listItemRenameText);
  };

  const handleNotesOnBlur = () => {
    updateListItem(listItem, 'notes', notesText);
  };

  useEffect(() => {
    if (!listItemEditID) {
      handleCloseEditPane();
    } else {
      const newListItem = listItems.find(
        (e) => e.listItemID === listItemEditID
      );
      setListItem(newListItem); // This should trigger a re-render if newListItem is different
    }
  }, [listItems, listItemEditID]);

  useEffect(() => {
    console.log('LISTITEMEDITPANE listItems changed, re-render!');
  }, [listItems]);

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
    setNotesText(e.target.value);
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
        <div className={styles.wrapperLabel}>
          <TagsIcon fill="#7f7f7f" />
          <p className={styles.fieldLabelP}>Tags</p>
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

      {!listItem.dates
        ? null
        : listItem.dates
            .sort(
              (a, b) => new Date(a.startDateTime) - new Date(b.startDateTime)
            )
            .map((date, i) => (
              <div
                className={styles.fieldWrapper}
                key={`new-selector-${date.eventID}`}
              >
                <div className={styles.fieldIndent} />
                <div className={styles.wrapperLabel}>
                  {i === 0 && (
                    <>
                      <DateIcon fill="#7f7f7f" />
                      <p className={styles.fieldLabelP}>Date</p>
                    </>
                  )}
                </div>
                <DateSelector
                  date={date}
                  listItem={listItem}
                  updateListItem={updateListItem}
                />
              </div>
            ))}
      <div
        className={styles.fieldWrapper}
        key={`new-selector-${listItem.dates?.length || 0}`}
      >
        <div className={styles.fieldIndent} />
        <div className={styles.wrapperLabel}>
          {!listItem.dates?.length ? (
            <>
              <DateIcon fill="#7f7f7f" />
              <p className={styles.fieldLabelP}>Date</p>
            </>
          ) : null}
        </div>
        <DateSelector listItem={listItem} updateListItem={updateListItem} />
      </div>

      <div className={styles.fieldWrapper}>
        <div className={styles.fieldIndent} />
        <div className={styles.wrapperLabel}>
          <SyncIcon fill="#7f7f7f" />
          <p className={styles.fieldLabelP}>Sync</p>
        </div>
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
        <div className={styles.wrapperLabel}>
          <NotesIcon fill="#7f7f7f" width="16px" />
          <p className={styles.fieldLabelP}>Notes</p>
        </div>
      </div>

      <div className={styles.fieldWrapper} style={{ alignItems: 'flex-start' }}>
        <div className={styles.fieldIndent} />
        <div className={styles.notesContainer}>
          <textarea
            className={styles.notesTextArea}
            placeholder="Add notes..."
            ref={textareaRef}
            onInput={handleInput}
            value={notesText}
            onBlur={handleNotesOnBlur}
          />
        </div>
      </div>
    </div>
  );
}

export default ListItemEditPane;
