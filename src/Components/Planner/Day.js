import React, { useState, useEffect, useRef, forwardRef } from 'react';
import styles from './Day.module.css';
import PlusIcon from '../Icons/PlusIcon';
import * as h from '../../helpers';
import { isToday, parseISO } from 'date-fns';
import { Droppable } from '@hello-pangea/dnd';
import ClockIcon from '../Icons/ClockIcon';

// Using forwardRef to pass the ref down the tree
const Day = forwardRef(({ date, viewMonth, events }, ref) => {
  const [dateEvents, setDateEvents] = useState([]);
  const dateIsToday = isToday(parseISO(date.date));
  const todayRef = useRef(null);

  useEffect(() => {
    const eventsForThisDate = h.getEventsForDate(date.date, events);
    setDateEvents(eventsForThisDate);
  }, [events]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (dateIsToday && todayRef.current) {
        todayRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [viewMonth, dateIsToday]);

  return (
    <Droppable droppableId={`planner-${date.date}`} key={date.date}>
      {(provided, snapshot) => (
        <div
          className={styles.container}
          ref={(node) => {
            // Combine both refs (todayRef and provided.innerRef)
            todayRef.current = node; // Scroll ref for today's date
            provided.innerRef(node); // Droppable ref
            if (ref) ref.current = node; // Pass the forward ref if provided
          }}
          {...provided.droppableProps}
          style={{
            ...provided.droppableProps.style,
            // backgroundColor: snapshot.isDraggingOver
            //   ? '#f0f0f0'
            //   : 'transparent',
          }}
        >
          <div className={styles.dayHeader}>
            {dateIsToday ? <span className={styles.today}>Today</span> : null}
            <span style={{ color: dateIsToday ? 'white' : null }}>
              {h.formatDateString(date.date)}
            </span>
          </div>

          {snapshot.isDraggingOver && (
            <div className={styles.dropPlaceholder}>Drop item here</div>
          )}

          {dateEvents.map((event) => {
            const { timeSet, title, startDateTime } = event;
            return (
              <div className={styles.event}>
                <div className={styles.eventTitle}>{title}</div>
                {timeSet ? (
                  <div className={styles.eventTime}>
                    <ClockIcon width="16px" fill="white" />
                    <span>{h.dateTimeTo12Hour(startDateTime) || null}</span>
                  </div>
                ) : null}
              </div>
            );
          })}

          <div className={styles.addEventButton}>
            <PlusIcon fill="inherit" width="16px" />
            <span>Add event</span>
          </div>

          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
});

export default Day;
