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

function DateSelector({
  type,
  date,
  listItem,
  handleEntities,
  inFocus = false,
  closeButton = false,
  // handleCancel = () => {},
  customClickOff = () => {},
}) {
  const [startDateTime, setStartDateTime] = useState(
    date?.startDateTime ? new Date(date.startDateTime) : null
  );
  const [timeSet, setTimeSet] = useState(date?.timeSet || false);
  const [isInFocus, setIsInFocus] = useState(inFocus);
  const [showTimeSelect, setShowTimeSelect] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const containerRef = useRef(null);
  const datePickerRef = useRef(null);

  const userUID = localStorage.getItem('firebaseID');

  const handleClickOff = async () => {
    if (!startDateTime) {
      return setIsInFocus(false);
    }
    // handle if no date has actually been selected - don't want to update ANYTHING
    const isoDateUTC = startDateTime?.toISOString();
    if (!date) {
      //
      // FIRST create new EVENT obj
      const newEventObj = {
        createdBy: userUID,
        listItemID: listItem.listItemID,
        listID: listItem.parentID,
        startDateTime: isoDateUTC, // ISO 8601 UTC format
        timeSet: timeSet,
        title: listItem.title,
        tags: listItem.tags?.length ? listItem.tags : null,
      };
      // await handleEvents('create', newEventObj, listItem);
      await handleEntities.createEventAndDate(newEventObj);
    } else {
      // FIRST update the EVENT obj
      const updatedEventObj = {
        ...date,
        startDateTime: isoDateUTC, // ISO 8601 UTC format
        timeSet: timeSet,
      };
      if (type === 'listItem') {
        await handleEntities.updateEventAndDates(
          ['startDateTime'],
          updatedEventObj
        );
      }
      if (type === 'event') {
        customClickOff(updatedEventObj);
      }
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
    if (date) {
      // console.log(date?.startDateTime);
      setStartDateTime(new Date(date.startDateTime));
      setTimeSet(date.timeSet);
    }
  }, [date?.startDateTime, date?.timeSet]);

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
    await handleEntities.deleteEventAndDate(date);
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

  const handleInternalClick = (event) => {
    event.stopPropagation(); // Prevent event from bubbling up to other listeners
    // Additional logic for clicks inside, if needed
  };

  return (
    <div
      className={styles.container}
      ref={containerRef}
      onClick={handleInternalClick} // Prevents clicks inside from triggering outside logic
    >
      <div
        className={`${styles.inputContainer} ${
          isInFocus ? styles.isInFocus : ''
        }`}
        onClick={() => setIsInFocus(true)}
        style={{ width: type === 'listItem' ? '100%' : null }}
      >
        {startDateTime ? (
          <>
            <div className={styles.dateLabels}>
              <DateIcon fill="white" />
              <p className={styles.startLabel}>{h.formatDate(startDateTime)}</p>
              {type === 'listItem' ? (
                <div
                  className={styles.deleteDateButton}
                  role="button"
                  onClick={(e) => handleClear(e)}
                >
                  <CloseIcon fill="#FFFFFFBF" width="12px" />
                </div>
              ) : (
                <div className={styles.noCloseButtonPadder} />
              )}
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
        <div
          className={styles.dropdown}
          ref={datePickerRef}
          style={{
            top: type === 'event' ? '0px' : type === 'listItem' ? '35px' : null,
            padding: closeButton ? '0px' : '8px',
          }}
        >
          {' '}
          {closeButton ? (
            <div className={styles.closeButtonContainer}>
              <div
                className={styles.closeButton}
                role="button"
                onClick={() => setIsInFocus(false)}
              >
                <CloseIcon width="18px" fill="white" />
              </div>
            </div>
          ) : // <div
          //   className={styles.bottomButton}
          //   onClick={(event) => handleClear(event)}
          // >
          //   <p className={styles.bottomButtonLabel}>Cancel</p>
          // </div>
          null}
          <div
            className={styles.pickerAndButtonsWrapper}
            style={{
              padding: closeButton ? '0px 8px 8px 8px' : '0px',
            }}
          >
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
            {date && type === 'listItem' ? (
              <div
                className={styles.bottomButton}
                onClick={(event) => handleClear(event)}
              >
                <p className={styles.bottomButtonLabel}>Clear</p>
              </div>
            ) : null}
          </div>
        </div>
      )}
      {showDeleteModal && (
        <ConfirmDeleteModal
          message="Delete this date / time?"
          handleCancel={handleCancelDeleteDate}
          handleConfirm={handleConfirmDeleteDate}
        />
      )}
    </div>
  );
}

export default DateSelector;
