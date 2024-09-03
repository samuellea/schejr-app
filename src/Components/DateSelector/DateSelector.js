import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import styles from './DateSelector.module.css'; // Your component styles
import * as h from '../../helpers';
import 'react-datepicker/dist/react-datepicker.css';

function DateSelector({ listItem, updateListItem, listItemID }) {
  const [dates, setDates] = useState([
    listItem?.date?.startDate ? new Date(listItem.date.startDate) : null,
    listItem?.date?.endDate ? new Date(listItem.date.endDate) : null,
  ]);
  const [isInFocus, setIsInFocus] = useState(false);
  const containerRef = useRef(null);
  const datePickerRef = useRef(null);
  const datesRef = useRef(dates);

  const handleClickOff = () => {
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

    const startDate = convertToISOString(datesRef.current[0]);
    const endDate = convertToISOString(datesRef.current[1]);

    const dateObj = { startDate, endDate };
    updateListItem(listItem, 'date', dateObj); // add date to FB /listItems listItem object
    setIsInFocus(false);
  };

  useEffect(() => {
    datesRef.current = dates;
  }, [dates]);

  const handleChange = (update) => {
    const [startDate, endDate] = update;
    if (
      (startDate && !(startDate instanceof Date)) ||
      (endDate && !(endDate instanceof Date))
    ) {
      console.error('Received invalid date');
      return;
    }
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

  const isPastDate = (date) => {
    const today = new Date();
    return date < today.setHours(0, 0, 0, 0);
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
            {dates[1] && (
              <>
                <p className={styles.arrowIcon}>></p>
                <p className={styles.arrowIcon}>{h.formatDate(dates[1])}</p>
              </>
            )}
          </div>
        ) : (
          <p className={styles.emptyLabel}>Empty</p>
        )}
      </div>
      {isInFocus && (
        <div className={styles.dropdown} ref={datePickerRef}>
          <DatePicker
            selected={dates[0] || null}
            onChange={(update) => handleChange(update)}
            startDate={dates[0] || null}
            endDate={dates[1] || null}
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
          {/* <div
            className={styles.addToGoogleCalendarSection}
          >
            <p className={styles.clearDatesButtonLabel}>Clear</p>
          </div> */}
        </div>
      )}
    </div>
  );
}

export default DateSelector;
