import React, { useState, useEffect, useRef } from 'react';
import styles from './EventEditPane.module.css';
import CloseIcon from '../Icons/CloseIcon';
import TrashIcon from '../Icons/TrashIcon';
import DateSelector from '../DateSelector/DateSelector';
import * as u from '../../utils';
import TagSelector from '../TagSelector/TagSelector';
import EventTagSelector from '../TagSelector/EventTagSelector';

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
              <EventTagSelector
                userUID={userUID}
                listItem={listItem}
                event={event}
                handleEntities={handleEntities}
                existingTags={existingTags}
                setExistingTags={setExistingTags}
              />
            </div>
          </div>

          <div className={styles.datepicker}>
            <DateSelector
              type="standalone"
              date={listItem.dates.find((e) => e.eventID === event.eventID)}
              listItem={listItem}
              handleEntities={handleEntities}
              inFocus={true}
              closeButton={true}
              handleCancel={handleStopEditing}
            />
          </div>
        </div>
      ) : (
        <h4>Loading...</h4>
      )}
    </div>
  );
}

export default EventEditPane;
