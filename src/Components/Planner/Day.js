import React, { useState, useEffect, useRef, forwardRef } from 'react';
import styles from './Day.module.css';
import PlusIcon from '../Icons/PlusIcon';
import * as h from '../../helpers';
import * as u from '../../utils';
import { isToday, parseISO } from 'date-fns';
import { Droppable } from '@hello-pangea/dnd';
import EditIcon from '../Icons/EditIcon';
import DuplicateIcon from '../Icons/DuplicateIcon';
import ConfirmDeleteModal from '../ConfirmDeleteModal/ConfirmDeleteModal';
import Event from './Event';

// Using forwardRef to pass the ref down the tree
const Day = forwardRef(
  (
    {
      date,
      dateEvents,
      events,
      handleEvents,
      existingTags,
      setExistingTags,
      handleEntities,
      // scrollPosition,
      scrollRef,
    },
    ref
  ) => {
    // const [dateEvents, setDateEvents] = useState([]);
    const [editEvent, setEditEvent] = useState(false);

    const dateIsToday = isToday(parseISO(date.date));
    const todayRef = useRef(null);

    // useEffect(() => {
    //   const eventsForThisDate = h.getEventsForDate(date.date, events);
    //   setDateEvents(eventsForThisDate);
    // }, [events]);

    useEffect(() => {
      const timer = setTimeout(() => {
        if (dateIsToday && todayRef.current) {
          todayRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }, 250);
      return () => clearTimeout(timer);
    }, [dateIsToday]);

    return (
      <Droppable
        droppableId={`planner-${date.date}`}
        key={`day-${date.date}`}
        type="list-item"
      >
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
              <div className={styles.dropPlaceholder}>
                <span>Drop item here</span>
              </div>
            )}

            {dateEvents
              ?.sort(
                (a, b) => new Date(a.startDateTime) - new Date(b.startDateTime)
              )
              .map((event, i) => {
                return (
                  <Event
                    event={event}
                    editEvent={editEvent}
                    setEditEvent={setEditEvent}
                    handleEvents={handleEvents}
                    key={`eventComp-${event.eventID}`}
                    index={i}
                    existingTags={existingTags}
                    setExistingTags={setExistingTags}
                    handleEntities={handleEntities}
                    // scrollPosition={scrollPosition}
                    scrollRef={scrollRef}
                  />
                );
              })}

            {/* <div className={styles.addEventButton}>
            <PlusIcon fill="inherit" width="16px" />
            <span>Add event</span>
          </div> */}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
  }
);

export default Day;
