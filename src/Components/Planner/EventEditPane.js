import React, { useState, useEffect, useRef } from 'react';
import styles from './EventEditPane.module.css';
import CloseIcon from '../Icons/CloseIcon';
import TrashIcon from '../Icons/TrashIcon';
import DateSelector from '../DateSelector/DateSelector';
import * as u from '../../utils';

function EventEditPane({ event, handleStopEditing, handleEvents }) {
  const [listItem, setListItem] = useState(null);

  useEffect(() => {
    const fetchListItem = async () => {
      try {
        const listItemForEvent = await u.fetchListItemById(event.listItemID);
        const plusExplicitID = {
          ...listItemForEvent,
          listItemID: event.listItemID,
        };
        setListItem(plusExplicitID);
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

  return (
    <div className={styles.eventEditPaneBackground}>
      {listItem ? (
        <div
          className={styles.eventEditPane}
          ref={eventEditRef}
          key={`eventEditPane-${event.eventID}`}
        >
          <div className={styles.fields}>
            <div className={styles.datepicker}>
              <DateSelector
                type="standalone"
                date={listItem.dates.find((e) => e.eventID === event.eventID)}
                listItem={listItem}
                handleEvents={handleEvents}
                inFocus={true}
                closeButton={true}
                handleCancel={handleStopEditing}
              />
            </div>
          </div>
        </div>
      ) : (
        <h4>Loading...</h4>
      )}
    </div>
  );
}

export default EventEditPane;
