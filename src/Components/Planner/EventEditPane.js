import React, { useState, useEffect, useRef } from 'react';
import styles from './EventEditPane.module.css';
import CloseIcon from '../Icons/CloseIcon';
import TrashIcon from '../Icons/TrashIcon';
import DateSelector from '../DateSelector/DateSelector';
import * as u from '../../utils';
import TagSelector from '../TagSelector/TagSelector';

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

  const handleClickOutside = (event) => {
    if (eventEditRef.current && !eventEditRef.current.contains(event.target)) {
      setTimeout(() => {
        handleStopEditing();
      }, 250);
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
    setEventTags(updatedTags);
  };

  const handleStartSave = () => {};

  const handleConfirmSave = async () => {
    setSaving(true);
    const updatedEvent = {
      ...event, // this will include .eventID and .listItemID
      title: eventTitle,
      tags: eventTags,
      startDateTime: eventStartDateTime,
      timeSet: eventTimeSet,
    };
    /*
    await handleEntities.updateEventAndDates('title', updatedListItem);

    await handleEntities.updateEventAndDates('tags', updatedListItem);
    
    await handleEntities.updateEventAndDates(
      'startDateTime',
      updatedEventObj
    );

    */
  };

  return (
    <div className={styles.eventEditPaneBackground}>
      {listItem ? (
        <div
          className={styles.eventEditPane}
          ref={eventEditRef}
          key={`eventEditPane-${event.eventID}`}
        >
          <div className={styles.field}>
            <div className={styles.eventTitle}>
              <input
                type="text"
                placeholder={event.title}
                value={eventTitle}
                onChange={(e) => handleTitleChange(e)}
              />
            </div>
          </div>

          <div className={styles.field}>
            <div className={styles.eventTags}>
              <TagSelector
                userUID={userUID}
                listItem={listItem}
                event={event}
                handleEntities={handleEntities}
                existingTags={existingTags}
                setExistingTags={setExistingTags}
                type="event"
                customUpdate={handleTagsChange}
              />
            </div>
          </div>

          <div className={styles.field}>
            <div className={styles.eventDate}>
              <div className={styles.datepicker}>
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
          </div>

          {modified ? (
            <div
              className={styles.field}
              style={{ justifyContent: 'flex-end' }}
            >
              <button className={styles.saveButton} onClick={handleStartSave}>
                Save
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <h4>Loading...</h4>
      )}
    </div>
  );
}

export default EventEditPane;
