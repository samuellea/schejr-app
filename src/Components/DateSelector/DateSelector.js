import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import styles from './DateSelector.module.css'; // Your component styles
import * as h from '../../helpers';
import 'react-datepicker/dist/react-datepicker.css';

function DateSelector({ listItem, updateListItem, listItemID }) {
  const [dates, setDates] = useState([
    listItem?.date?.startDate || null,
    listItem?.date?.endDate || null,
  ]);
  const [isInFocus, setIsInFocus] = useState(false);
  const containerRef = useRef(null);
  const datePickerRef = useRef(null);
  const datesRef = useRef(dates);

  const handleClickOff = (event) => {
    const convertToISOString = (value) => {
      if (value instanceof Date) {
        // If it's already a Date object, use toISOString
        return value.toISOString();
      } else if (typeof value === 'string' && !isNaN(Date.parse(value))) {
        // If it's a string and can be parsed as a Date, convert to Date object
        return new Date(value).toISOString();
      }
      return null; // Return null if value is not a valid Date
    };

    const startDate = convertToISOString(datesRef.current?.[0]);
    const endDate = convertToISOString(datesRef.current?.[1]);

    const dateObj = {
      startDate,
      endDate,
    };

    updateListItem(listItemID, 'date', dateObj);
    setIsInFocus(false);
  };

  useEffect(() => {
    datesRef.current = dates;
  }, [dates]);

  const handleChange = (update) => {
    setDates(update);
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
  }, []);

  // Helper function to determine if a date is in the past
  const isPastDate = (date) => {
    const today = new Date();
    return date < today.setHours(0, 0, 0, 0); // Compare to today's date without time
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <div
        className={`${styles.inputContainer} ${
          isInFocus ? styles.isInFocus : ''
        }`}
        onClick={() => setIsInFocus(true)}
      >
        {dates[0] ? (
          <div className={styles.dateLabels}>
            <p className={styles.startLabel}>{h.formatDate(dates[0])}</p>
            {dates[1] ? <p className={styles.arrowIcon}>></p> : null}
            {dates[1] ? (
              <p className={styles.arrowIcon}>{h.formatDate(dates[1])}</p>
            ) : null}
          </div>
        ) : (
          <p className={styles.emptyLabel}>Empty</p>
        )}
      </div>
      {isInFocus && (
        <div className={`${styles.dropdown}`} ref={datePickerRef}>
          <DatePicker
            selected={dates[0]}
            onChange={(update) => handleChange(update)}
            startDate={dates[0]}
            endDate={dates[1]}
            selectsRange
            inline
            calendarClassName={styles.rastaStripes}
            dayClassName={(date) => (isPastDate(date) ? styles.pastDay : '')}
          />
          <div
            className={styles.clearDatesButton}
            onClick={() => setDates([null, null])}
          >
            <p className={styles.clearDatesButtonLabel}>Clear</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default DateSelector;
