import React, { useState, useEffect, useRef } from 'react';
import styles from './EventEditPane.module.css';
import CloseIcon from '../Icons/CloseIcon';
import TrashIcon from '../Icons/TrashIcon';
import TagsIcon from '../Icons/TagsIcon';
import DateIcon from '../Icons/DateIcon';
import EditIcon from '../Icons/EditIcon';
import DateSelector from '../DateSelector/DateSelector';
import * as u from '../../utils';
import TagSelector from '../TagSelector/TagSelector';
import ConfirmDeleteModal from '../ConfirmDeleteModal/ConfirmDeleteModal';
import Spinner from '../Spinner/Spinner';

function EventEditPane({
  event,
  handleStopEditing,
  handleEvents,
  handleOtherEventFields,
  existingTags,
  setExistingTags,
  handleEntities,
}) {
  const [listItem, setListItem] = useState(null);
  const [eventTitle, setEventTitle] = useState(event.title);
  const [eventStartDateTime, setEventStartDateTime] = useState(
    event.startDateTime
  );
  const [eventTags, setEventTags] = useState(event.tags);
  const [eventTimeSet, setEventTimeSet] = useState(event.timeSet);
  const [modified, setModified] = useState(false);
  const [saving, setSaving] = useState(false);

  const userUID = localStorage.getItem('firebaseID');

  useEffect(() => {
    const fetchListItem = async () => {
      try {
        const listItemForEvent = await u.fetchListItemById(
          userUID,
          event.listItemID
        );
        setListItem(listItemForEvent);
      } catch {
        // Handle error fetching listItem
      }
    };
    fetchListItem();
  }, []);

  useEffect(() => {
    console.log(eventStartDateTime);
    console.log(event.startDateTime);

    if (
      eventTitle !== event.title ||
      eventStartDateTime !== event.startDateTime ||
      eventTags !== event.tags ||
      eventTimeSet !== event.timeSet
    ) {
      setModified(true);
    }
  }, [eventTitle, eventStartDateTime, eventTags, eventTimeSet]);

  const eventEditRef = useRef(null);

  const inputRef = useRef(null);

  const handleBlur = () => {
    if (inputRef.current) {
      inputRef.current.scrollLeft = 0; // Scroll to the leftmost position
      inputRef.current.blur();
    }
  };

  // Handle click outside to stop editing
  const handleClickOutside = (event) => {
    // if (eventEditRef.current) {
    //   console.log('A');
    // }
    if (eventEditRef.current && !eventEditRef.current.contains(event.target)) {
      handleStopEditing(); // Call stop editing if clicked outside
    }

    if (inputRef.current && !inputRef.current.contains(event.target)) {
      handleBlur();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTitleChange = (e) => {
    setEventTitle(e.target.value);
  };

  const handleStartDateTimeChange = (updatedEventObj) => {
    const newStartDateTime = updatedEventObj.startDateTime;
    const newTimeSet = updatedEventObj.timeSet;
    setEventStartDateTime(newStartDateTime);
    setEventTimeSet(newTimeSet);
  };

  const handleTagsChange = (updatedTags) => {
    // ALSO NEED TO UPDATE .tags on the ListItem in STATE here (which is being passed into TagSelector), otherwise that's always gonna stay fixed and therefore stale values be used!
    console.log(updatedTags);
    // console.log(updatedTags);
    setEventTags(updatedTags);
  };

  useEffect(() => {
    console.log(listItem);
    if (listItem !== null) {
      const updatedListItem = { ...listItem, tags: eventTags };
      console.log(updatedListItem);
      setListItem(updatedListItem); // update local listItem (in state here) if tags change
    }
  }, [eventTags]);

  const handleStartSave = () => {
    console.log('!');
  };

  const handleConfirmSave = async () => {
    setSaving(true);
    const updatedEvent = {
      ...event, // this will include .eventID and .listItemID
      title: eventTitle,
      tags: eventTags,
      startDateTime: eventStartDateTime,
      timeSet: eventTimeSet,
    };
    // console.log(updatedEvent);
    await handleEntities.updateEventAndDates(
      ['title', 'tags', 'startDateTime'],
      updatedEvent
    );
    setSaving(false);
    handleStopEditing();
  };

  return (
    <div className={styles.eventEditPaneBackground}>
      {listItem ? (
        <div
          className={styles.eventEditPane}
          ref={eventEditRef}
          key={`eventEditPane-${event.eventID}`}
        >
          <div className={styles.fieldWrapper}>
            <div className={styles.wrapperLabel}>
              <EditIcon fill="#7f7f7f" width="16px" marginTop="0px" />
              <p className={styles.fieldLabelP}>Title</p>
            </div>
            <div className={styles.eventTitle}>
              <input
                type="text"
                placeholder={event.title}
                value={eventTitle}
                onChange={(e) => handleTitleChange(e)}
                ref={inputRef}
                onBlur={handleBlur}
              />
            </div>
          </div>

          <div className={styles.fieldWrapper}>
            <div className={styles.wrapperLabel}>
              <TagsIcon fill="#7f7f7f" />
              <p className={styles.fieldLabelP}>Tags</p>
            </div>
            <div className={styles.eventTags}>
              <TagSelector
                userUID={userUID}
                listItem={listItem}
                tags={eventTags}
                // event={event}
                handleEntities={handleEntities}
                existingTags={existingTags}
                setExistingTags={setExistingTags}
                type="event"
                customUpdate={handleTagsChange}
              />
            </div>
          </div>

          <div className={styles.fieldWrapper}>
            <div className={styles.wrapperLabel}>
              <DateIcon fill="#7f7f7f" />
              <p className={styles.fieldLabelP}>Date</p>
            </div>
            <div className={styles.eventDate}>
              <DateSelector
                type="event"
                date={listItem.dates.find((e) => e.eventID === event.eventID)}
                listItem={listItem}
                handleEntities={handleEntities}
                // inFocus={true}
                closeButton={true}
                handleCancel={handleStopEditing}
                customClickOff={handleStartDateTimeChange}
              />
            </div>
          </div>

          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '8px',
            }}
          >
            {modified ? (
              <button className={styles.saveButton} onClick={handleConfirmSave}>
                Save
              </button>
            ) : null}
            <button className={styles.cancelButton} onClick={handleStopEditing}>
              Cancel
            </button>
          </div>
          {saving ? (
            <div className={styles.saving}>
              <Spinner />
            </div>
          ) : null}
        </div>
      ) : (
        <div className={styles.saving} style={{ background: 'none' }}>
          <Spinner />
        </div>
      )}
    </div>
  );
}

export default EventEditPane;
