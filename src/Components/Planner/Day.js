import React, { useState, useEffect, useRef, forwardRef } from 'react';
import styles from './Day.module.css';
import PlusIcon from '../Icons/PlusIcon';
import * as h from '../../helpers';
import { isToday, parseISO } from 'date-fns';
import { Droppable } from '@hello-pangea/dnd';
import ClockIcon from '../Icons/ClockIcon';
import DragIcon from '../Icons/DragIcon';
import EditIcon from '../Icons/EditIcon';
import EllipsisIcon from '../Icons/EllipsisIcon';
import DuplicateIcon from '../Icons/DuplicateIcon';
import EventEditPane from './EventEditPane';

// Using forwardRef to pass the ref down the tree
const Day = forwardRef(({ date, viewMonth, events, handleEvents }, ref) => {
  const [dateEvents, setDateEvents] = useState([]);
  const [eventEditID, setEventEditID] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [editEvent, setEditEvent] = useState(false);

  const dateIsToday = isToday(parseISO(date.date));
  const todayRef = useRef(null);
  const optionsRef = useRef(null);

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

  // const optionsRef = useRef(null);

  const handleClickOutside = (event) => {
    if (optionsRef.current && !optionsRef.current.contains(event.target)) {
      setShowOptions(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOptions = (eventID) => {
    setShowOptions(true);
    setEventEditID(eventID);
  };

  const handleEdit = () => {
    setShowOptions(false);
    setEditEvent(true);
  };

  const handleDuplicate = () => {};

  const handleStopEditing = () => {
    setEditEvent(false);
    setEventEditID(null);
  };

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
            <span
              style={{
                color: dateIsToday || dateEvents?.length ? 'white' : null,
              }}
            >
              {h.formatDateString(date.date)}
            </span>
          </div>

          {snapshot.isDraggingOver && (
            <div className={styles.dropPlaceholder}>Drop item here</div>
          )}

          {dateEvents.map((event) => {
            const { timeSet, title, startDateTime } = event;
            return (
              <div className={styles.event} key={`event-${event.eventID}`}>
                {showOptions ? (
                  <div className={styles.eventOptionsMenu} ref={optionsRef}>
                    <div
                      className={styles.eventOptionsMenuButton}
                      onClick={handleEdit}
                    >
                      <EditIcon fill="white" width="16px" marginTop="0px" />
                      <span>Edit</span>
                    </div>
                    <div
                      className={styles.eventOptionsMenuButton}
                      onClick={handleDuplicate}
                    >
                      <DuplicateIcon fill="white" width="16px" />
                      <span>Duplicate</span>
                    </div>
                  </div>
                ) : null}
                <div className={styles.eventGrabContainer}>
                  <div className={styles.listItemDragHandle}>
                    <DragIcon fill="#9b9b9b" width="20px" />
                  </div>
                </div>
                <div className={styles.eventDetailsContainer}>
                  <div className={styles.titleAndEditContainer}>
                    <div className={styles.eventTitle}>{title}</div>
                    <div
                      className={styles.eventMoreButton}
                      role="button"
                      onClick={() => handleOptions(event.eventID)}
                    >
                      <EllipsisIcon fill="#9b9b9b" width="16px" />
                    </div>
                  </div>
                  {timeSet ? (
                    <div className={styles.eventTime}>
                      <ClockIcon width="16px" fill="white" />
                      <span>{h.dateTimeTo12Hour(startDateTime) || null}</span>
                    </div>
                  ) : null}
                </div>
                {editEvent && eventEditID ? (
                  <EventEditPane
                    event={dateEvents.find((e) => e.eventID === eventEditID)}
                    handleStopEditing={handleStopEditing}
                    handleEvents={handleEvents}
                  />
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
