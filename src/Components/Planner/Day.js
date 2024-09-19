import React, { useState, useEffect, useRef, forwardRef } from 'react';
import styles from './Day.module.css';
import PlusIcon from '../Icons/PlusIcon';
import * as h from '../../helpers';
import * as u from '../../utils';
import { isToday, parseISO } from 'date-fns';
import { Droppable } from '@hello-pangea/dnd';
import ClockIcon from '../Icons/ClockIcon';
import DragIcon from '../Icons/DragIcon';
import EditIcon from '../Icons/EditIcon';
import EllipsisIcon from '../Icons/EllipsisIcon';
import DuplicateIcon from '../Icons/DuplicateIcon';
import EventEditPane from './EventEditPane';
import ConfirmDeleteModal from '../ConfirmDeleteModal/ConfirmDeleteModal';
import EventOptions from './EventOptions';

// Using forwardRef to pass the ref down the tree
const Day = forwardRef(({ date, viewMonth, events, handleEvents }, ref) => {
  const [dateEvents, setDateEvents] = useState([]);
  const [eventEditID, setEventEditID] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [editEvent, setEditEvent] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

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

  const handleOptions = (eventID) => {
    setShowOptions(true);
    setEventEditID(eventID);
  };

  const handleEdit = () => {
    setShowOptions(false);
    setEditEvent(true);
  };

  const handleDuplicate = async () => {
    setShowOptions(false);
    const event = dateEvents.find((e) => e.eventID === eventEditID);
    const listItemForEvent = await u.fetchListItemById(event.listItemID);
    const plusExplicitID = {
      ...listItemForEvent,
      listItemID: event.listItemID,
    };
    const { eventID, ...restOfEvent } = event;
    const duplicateEventObj = { ...restOfEvent };
    console.log(duplicateEventObj);
    console.log(plusExplicitID);
    await handleEvents('create', duplicateEventObj, plusExplicitID);
  };

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
                {showOptions && event.eventID === eventEditID ? (
                  <EventOptions
                    handleEdit={handleEdit}
                    handleDuplicate={handleDuplicate}
                    setShowOptions={setShowOptions}
                    key={`eventOptions-${event.eventID}`}
                  />
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
                {editEvent && event.eventID === eventEditID ? (
                  <EventEditPane
                    event={event}
                    handleStopEditing={handleStopEditing}
                    handleEvents={handleEvents}
                    key={event.eventID}
                  />
                ) : null}
              </div>
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
});

export default Day;
