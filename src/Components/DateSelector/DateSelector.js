import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import styles from './DateSelector.module.css'; // Your component styles
import * as h from '../../helpers';
import 'react-datepicker/dist/react-datepicker.css';
import CustomCalendarContainer from './CustomCalendarContainer';

function DateSelector({ listItem, updateListItem, listItemID }) {
  const [startDate, setStartDate] = useState(null);
  const [isInFocus, setIsInFocus] = useState(false);
  const [showTimeInput, setShowTimeInput] = useState(false);

  const containerRef = useRef(null);
  const datePickerRef = useRef(null);
  const dateRef = useRef(startDate);

  // const listItemRef = useRef(listItem); // Using ref ensures handleClickOff always has the latest listItem value even if it was not redefined on prop change.
  // // Something to do with how handleClickOutside > handleClickOff > updateListItem > listItem was being attached as event listener
  // useEffect(() => {
  //   listItemRef.current = listItem;
  // }, [listItem]);

  const handleChange = (date) => {
    console.log(date);
    // setStartDate(date);
  };

  // const handleChange = (update) => {
  //   const [startDate, endDate] = update;
  //   if (
  //     (startDate && !(startDate instanceof Date)) ||
  //     (endDate && !(endDate instanceof Date))
  //   ) {
  //     console.error('Received invalid date');
  //     return;
  //   }
  //   setDates(update);
  // };

  const handleClickOff = () => {
    const convertToISOString = (value) => {
      if (value instanceof Date && !isNaN(value.getTime())) {
        // Convert local date to YYYY-MM-DD format
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const day = String(value.getDate()).padStart(2, '0');
        console.log(`${year}-${month}-${day}`);
        return `${year}-${month}-${day}`;
      } else if (typeof value === 'string' && !isNaN(Date.parse(value))) {
        // Convert string to Date object, then to YYYY-MM-DD format
        const date = new Date(value);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const day = String(date.getDate()).padStart(2, '0');
        console.log(`${year}-${month}-${day}`);
        return `${year}-${month}-${day}`;
      }
      return null;
    };

    const startDate = convertToISOString(dateRef.current);
    const dateObj = { startDate };
    updateListItem(listItem, 'date', dateObj); // add date to FB /listItems listItem object,
    setIsInFocus(false);
  };

  useEffect(() => {
    dateRef.current = startDate;
  }, [startDate]);

  useEffect(() => {}, [listItem]);

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
    setShowTimeInput(true);
  };

  const handleClearTime = () => {
    setShowTimeInput(false);
  };

  const CustomContainerWithProps = ({ children, className }) => (
    <CustomCalendarContainer
      className={className}
      showTimeInput={showTimeInput}
      handleClearTime={handleClearTime}
    >
      {children}
    </CustomCalendarContainer>
  );

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
            timeInputLabel={false}
            showTimeInput={showTimeInput}
            calendarContainer={CustomContainerWithProps}
            slotProps={{
              layout: {
                sx: {
                  svg: { fill: 'red !important' },
                },
              },
            }}
          />
          {!showTimeInput ? (
            <div className={styles.bottomButton} onClick={handleAddTime}>
              <p className={styles.bottomButtonLabel}>Time</p>
            </div>
          ) : null}
          <div
            className={styles.bottomButton}
            onClick={() => setStartDate(null)}
          >
            <p className={styles.bottomButtonLabel}>Clear</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default DateSelector;
