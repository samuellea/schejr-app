import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import styles from './DateSelector.module.css'; // Your component styles
import * as h from '../../helpers';
import 'react-datepicker/dist/react-datepicker.css';
import ClockIcon from '../Icons/ClockIcon';
import CloseIcon from '../Icons/CloseIcon';

function DateSelector({ listItem, updateListItem, listItemID }) {
  const [startDate, setStartDate] = useState(listItem.date?.startDate || null);
  const [isInFocus, setIsInFocus] = useState(false);
  const [showTimeSelect, setShowTimeSelect] = useState(false);
  const [startTime, setStartTime] = useState(listItem.date?.startTime || null);

  const containerRef = useRef(null);
  const datePickerRef = useRef(null);
  const dateRef = useRef(startDate);
  const timeRef = useRef(startTime);

  const handleChange = (date) => {
    setStartDate(date);
    setShowTimeSelect(false);
  };

  const handleClickOff = () => {
    // convert the date portion of the JS date/time, for displaying the DATE in our app
    // seperately, store the time portion of the JS date/time - or null if we're clearing a time we set before
    const convertToISOString = (value) => {
      if (value instanceof Date && !isNaN(value.getTime())) {
        // Convert local date to YYYY-MM-DD format
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const day = String(value.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      } else if (typeof value === 'string' && !isNaN(Date.parse(value))) {
        // Convert string to Date object, then to YYYY-MM-DD format
        const date = new Date(value);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      return null;
    };

    const startDate = convertToISOString(dateRef.current);
    const startTime = timeRef.current;

    const dateObj = { startDate, startTime };
    let updatedDateTimes;
    listItem.date?.length
      ? (updatedDateTimes = [...listItem.date, dateObj])
      : (updatedDateTimes = [dateObj]);
    console.log(dateObj);
    updateListItem(listItem, 'date', updatedDateTimes); // add date to FB /listItems listItem object,
    setIsInFocus(false);
  };

  useEffect(() => {
    dateRef.current = startDate;
  }, [startDate]);

  useEffect(() => {
    timeRef.current = startTime;
  }, [startTime]);

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
  }, [listItem]);

  const isPastDate = (date) => {
    const today = new Date();
    return date < today.setHours(0, 0, 0, 0);
  };

  const handleAddTime = () => {
    setShowTimeSelect(true);
  };

  const handleTimeBlockClick = (value) => {
    // update the time object in state
    const updatedTime = {
      display12: value.display12,
      hour12: value.hour12,
      hour24: value.hour24,
      minute: value.minute,
      amPm: value.amPm,
    };
    setStartTime(updatedTime);
    setShowTimeSelect(false);
  };

  const timeButtonCombined = `${
    startDate ? styles.timeButtonExistingDate : null
  } ${startTime ? styles.timeButtonExistingTime : null} ${styles.bottomButton}`;

  const handleClear = () => {
    setStartDate(null);
    setStartTime(null);
  };

  const handleClearTime = (event) => {
    event.stopPropagation();
    setStartTime(null);
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <div
        className={`${styles.inputContainer} ${
          isInFocus ? styles.isInFocus : ''
        }`}
        onClick={() => setIsInFocus(true)}
      >
        {startDate ? (
          <div className={styles.dateLabels}>
            <p className={styles.startLabel}>{h.formatDate(startDate)}</p>
          </div>
        ) : (
          <p className={styles.emptyLabel}>Empty</p>
        )}
      </div>
      {isInFocus && (
        <div className={styles.dropdown} ref={datePickerRef}>
          <DatePicker
            selected={startDate}
            onChange={(date) => handleChange(date)}
            inline
            calendarClassName={styles.rastaStripes}
            dayClassName={(date) => (isPastDate(date) ? styles.pastDay : '')}
          />
          {startDate ? (
            <div className={styles.timeContainer}>
              <div
                className={timeButtonCombined}
                id="timeButton"
                onClick={handleAddTime}
              >
                <ClockIcon
                  width="17px"
                  fill={startTime ? 'white' : '#7f7f7f'}
                />
                <p className={styles.bottomButtonLabel}>
                  {startTime ? startTime.display12 : 'Time'}
                </p>
                {startTime ? (
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
                      >
                        {e.display12}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
          {startDate ? (
            <div
              className={styles.bottomButton}
              onClick={(event) => handleClear(event)}
            >
              <p className={styles.bottomButtonLabel}>Clear</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default DateSelector;
