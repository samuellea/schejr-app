import React, { useState, useEffect, useRef } from 'react';
import styles from './Day.module.css';
import PlusIcon from '../Icons/PlusIcon';
import * as h from '../../helpers';
import { isToday, parseISO } from 'date-fns';

function Day({ date, viewMonth }) {
  const dateIsToday = isToday(parseISO(date.date));
  const todayRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (todayRef.current) {
        todayRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [viewMonth]);

  return (
    <div className={styles.container} ref={dateIsToday ? todayRef : null}>
      <div className={styles.dayHeader}>
        {dateIsToday ? <span className={styles.today}>Today</span> : null}
        <span style={{ color: dateIsToday ? 'white' : null }}>
          {h.formatDateString(date.date)}
        </span>
      </div>
      {date.events.map((event) => {
        return '';
      })}
      <div className={styles.addEventButton}>
        <PlusIcon fill="inherit" width="16px" />
        <span>Add event</span>
      </div>
    </div>
  );
}

export default Day;
