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
import * as u from '../../utils';

function ListItemEditPane({
  // listItemEditID,
  listItem,
  listItems,
  setListItems,
  handleCloseEditPane,
  userUID,
  // updateListItem,
  // fetchTags,
  existingTags,
  setExistingTags,
  syncWithGCal,
  handleSetSyncWithGCal,
  handleEntities,
}) {
  // title is locked in here - so DateSelector wont recieve
  // const [listItem, setListItem] = useState(listItem);
  const [listItemRenameText, setListItemRenameText] = useState(listItem.title);
  const [notesText, setNotesText] = useState(listItem.notes);

  const handleTitleChange = (e) => {
    const text = e.target.value;
    setListItemRenameText(text);
  };

  const handleTitleOnBlur = async () => {
    const updatedListItem = { ...listItem, title: listItemRenameText };
    await handleEntities.updateEventAndDates(['title'], updatedListItem);
  };

  const handleNotesOnBlur = async () => {
    const updatedListItem = { ...listItem, notes: notesText };
    await handleEntities.patchListItemNotes(updatedListItem);
  };
  const textarea1Ref = useRef(null);
  const textarea2Ref = useRef(null);

  // Function to adjust the height based on content
  // const adjustHeight = (element) => {
  //   if (element) {
  //     element.style.height = 'auto'; // Reset height to auto to get the full content height
  //     element.style.height = `${element.scrollHeight}px`; // Set height to scrollHeight
  //   }
  // };

  // Handle input to adjust height
  const handleInput = (e) => {
    // if (textareaRef.current) {
    //   adjustHeight(textareaRef.current);
    // }
    setNotesText(e.target.value);
  };

  // Adjust height on mount and whenever content changes
  // useEffect(() => {
  //   adjustHeight(textareaRef.current);
  // }, []);

  const adjustHeight = () => {
    const textarea = textarea1Ref.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Reset the height
      textarea.style.height = `${textarea.scrollHeight}px`; // Set height to scroll height
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [listItemRenameText]);

  return (
    <div className={styles.container}>
    <div className={styles.contentWrapper}>

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
        <textarea
          ref={textarea1Ref}
          className={styles.listItemTitleInput}
          type="text"
          id="listItemTitle"
          onChange={(event) => handleTitleChange(event)}
          value={listItemRenameText}
          onBlur={handleTitleOnBlur}
          style={{
            width: '100%',
            resize: 'none', // Prevents manual resizing
            overflow: 'hidden', // Prevents scrollbars
          }}
        ></textarea>
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
          tags={listItem.tags}
          // updateListItem={updateListItem}
          // fetchTags={fetchTags}
          existingTags={existingTags}
          setExistingTags={setExistingTags}
          listItems={listItems}
          setListItems={setListItems}
          handleEntities={handleEntities}
          type="listItem"
        />
      </div>

      {!listItem.dates
        ? null
        : listItem.dates
            .sort(
              (a, b) => new Date(a.startDateTime) - new Date(b.startDateTime)
            )
            .map((date, i) => {
              // console.log(date);
              return (
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
                    type="listItem"
                    date={date}
                    listItem={listItem}
                    handleEntities={handleEntities}
                  />
                </div>
              );
            })}
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
        <DateSelector
          type="listItem"
          listItem={listItem}
          handleEntities={handleEntities}
        />
      </div>

      <div className={styles.fieldWrapper}>
        <div className={styles.fieldIndent} />
        <div className={styles.wrapperLabel}>
          <SyncIcon fill="#7f7f7f" />
          <p className={styles.fieldLabelP}>Sync</p>
        </div>
        <div className={styles.toggleSwitchWrapper}>
          <ToggleSwitch
            toggleValue={syncWithGCal}
            setToggleValue={handleSetSyncWithGCal}
          />
        </div>
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
            ref={textarea2Ref}
            onInput={handleInput}
            value={notesText}
            onBlur={handleNotesOnBlur}
          />
        </div>
      </div>
    </div>
    </div>

  );
}

export default ListItemEditPane;
