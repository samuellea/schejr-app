import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import styles from './DateSelector.module.css'; // Your component styles
import * as u from '../../utils';
import * as h from '../../helpers';
import 'react-datepicker/dist/react-datepicker.css';
import ClockIcon from '../Icons/ClockIcon';
import CloseIcon from '../Icons/CloseIcon';
import { nanoid } from 'nanoid';
import PlusIcon from '../Icons/PlusIcon';
import ConfirmDeleteModal from '../ConfirmDeleteModal/ConfirmDeleteModal';
import DateIcon from '../Icons/DateIcon';

function DateSelector({ date, listItem, updateListItem }) {
  const [startDateTime, setStartDateTime] = useState(
    date?.startDateTime ? new Date(date.startDateTime) : null
  );
  const [timeSet, setTimeSet] = useState(date?.timeSet || false);
  const [isInFocus, setIsInFocus] = useState(false);
  const [showTimeSelect, setShowTimeSelect] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const containerRef = useRef(null);
  const datePickerRef = useRef(null);

  const userUID = localStorage.getItem('firebaseID');

  const handleClickOff = async () => {
    const isoDateUTC = startDateTime?.toISOString();
    if (!date) {
      // FIRST create new EVENT obj
      const newEventObj = {
        createdBy: userUID,
        listItemID: listItem.listItemID,
        startDateTime: isoDateUTC, // ISO 8601 UTC format
        timeSet: timeSet,
        title: listItem.title,
      };
      const newEventID = await u.createNewEvent(userUID, newEventObj);
      // // THEN add it to .dates on listItem, in state and on db
      const newDateObj = {
        ...newEventObj,
        eventID: newEventID,
      };
      const updatedDates = [...(listItem.dates || []), newDateObj];
      updateListItem(listItem, 'dates', updatedDates);
    } else {
      // FIRST update the EVENT obj
      const { eventID, ...restOfDate } = date;
      const updatedEvent = {
        ...restOfDate,
        startDateTime: isoDateUTC, // ISO 8601 UTC format
        timeSet: timeSet,
      };
      await u.patchEventByID(userUID, date.eventID, updatedEvent);
      // THEN update it in .dates on listItem, in state and on db
      const updatedDateObj = {
        ...date,
        startDateTime: isoDateUTC, // ISO 8601 UTC format
        timeSet: timeSet,
      };
      const updatedDates = listItem.dates
        .filter((e) => e.eventID !== date.eventID)
        .concat(updatedDateObj);
      updateListItem(listItem, 'dates', updatedDates);
    }
    setIsInFocus(false);
  };

  const handleClickOutside = (event) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(event.target) &&
      datePickerRef.current &&
      !datePickerRef.current.contains(event.target)
    ) {
      handleClickOff();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [date, startDateTime, timeSet, listItem]); // Include dependencies to ensure handlers are up-to-date

  const isPastDate = (date) => {
    const today = new Date();
    return date < today.setHours(0, 0, 0, 0);
  };

  const handleChange = (date) => {
    setStartDateTime(date); // JS Date obj
    setShowTimeSelect(false);
  };

  const handleAddTime = () => {
    setShowTimeSelect(true);
  };

  const handleTimeBlockClick = (value) => {
    const updatedDateTime = new Date(startDateTime);
    updatedDateTime.setHours(value.hour24);
    updatedDateTime.setMinutes(value.minute);
    setStartDateTime(updatedDateTime);
    setTimeSet(true);
    setShowTimeSelect(false);
  };

  const handleClear = (event) => {
    event.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleCancelDeleteDate = () => {
    setShowDeleteModal(false);
  };

  const handleConfirmDeleteDate = async () => {
    // FIRST delete EVENT obj
    await u.deleteEventByID(userUID, date.eventID);
    // THEN remove it from .dates on listItem, in state and on db
    const updatedDates = listItem.dates.filter(
      (e) => e.eventID !== date.eventID
    );
    updateListItem(listItem, 'dates', updatedDates);
    setShowDeleteModal(false);
    setTimeSet(false);
    setStartDateTime(null);
  };

  const handleClearTime = (event) => {
    event.stopPropagation();
    const resetToMidnight = new Date(startDateTime);
    resetToMidnight.setHours(0);
    resetToMidnight.setMinutes(0);
    setStartDateTime(resetToMidnight);
    setTimeSet(false);
  };

  const timeButtonCombined = `${
    startDateTime ? styles.timeButtonExistingDate : ''
  } ${timeSet ? styles.timeButtonExistingTime : ''} ${styles.bottomButton}`;

  return (
    <div className={styles.container} ref={containerRef}>
      <div
        className={`${styles.inputContainer} ${
          isInFocus ? styles.isInFocus : ''
        }`}
        onClick={() => setIsInFocus(true)}
      >
        {startDateTime ? (
          <>
            <div className={styles.dateLabels}>
              <DateIcon fill="white" />
              <p className={styles.startLabel}>{h.formatDate(startDateTime)}</p>
              <div
                className={styles.deleteDateButton}
                role="button"
                onClick={(e) => handleClear(e)}
              >
                <CloseIcon fill="#FFFFFFBF" width="12px" />
              </div>
            </div>
            {timeSet && (
              <div className={styles.timeLabel}>
                <ClockIcon width="15px" fill="white" />
                <p>{h.dateTimeTo12Hour(startDateTime)}</p>
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyLabel}>
            {listItem.dates?.length > 0 && (
              <PlusIcon fill="white" width="14px" margin="0px 0px 0px 0px" />
            )}
            <p>Add date</p>
          </div>
        )}
      </div>
      {isInFocus && (
        <div className={styles.dropdown} ref={datePickerRef}>
          <DatePicker
            selected={startDateTime}
            onChange={(date) => handleChange(date)}
            inline
            calendarClassName={styles.rastaStripes}
            dayClassName={(date) => (isPastDate(date) ? styles.pastDay : '')}
          />
          {startDateTime && (
            <div className={styles.timeContainer}>
              <div
                className={timeButtonCombined}
                id="timeButton"
                onClick={handleAddTime}
              >
                <ClockIcon
                  width="18px"
                  fill={startDateTime ? 'white' : '#7f7f7f'}
                  margin="0px 3px 2px 0px"
                />
                <p className={styles.bottomButtonLabel}>
                  {timeSet ? h.dateTimeTo12Hour(startDateTime) : 'Time'}
                </p>
                {timeSet ? (
                  <div
                    className={styles.clearTimeButton}
                    role="button"
                    onClick={(event) => handleClearTime(event)}
                  >
                    <CloseIcon width="14px" fill="white" />
                  </div>
                ) : null}
              </div>
              {showTimeSelect ? (
                <div className={styles.timeInput}>
                  <div className={styles.unitContainer}>
                    {h.times.map((e) => (
                      <div
                        className={styles.unitBlock}
                        onClick={() => handleTimeBlockClick(e)}
                        key={e.display12}
                      >
                        {e.display12}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
          {date ? (
            <div
              className={styles.bottomButton}
              onClick={(event) => handleClear(event)}
            >
              <p className={styles.bottomButtonLabel}>Clear</p>
            </div>
          ) : null}
        </div>
      )}
      {showDeleteModal && (
        <ConfirmDeleteModal
          message="Are you sure you want to delete this date / time?"
          handleCancel={handleCancelDeleteDate}
          handleConfirm={handleConfirmDeleteDate}
        />
      )}
    </div>
  );
}

export default DateSelector;
