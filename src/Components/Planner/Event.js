import React, { useState, useEffect, useRef } from 'react';
import styles from './Event.module.css';
import EllipsisIcon from '../Icons/EllipsisIcon';
import DragIcon from '../Icons/DragIcon';
import ClockIcon from '../Icons/ClockIcon';
import EventEditPane from './EventEditPane';
import EventOptions from './EventOptions';
import * as h from '../../helpers';
import * as u from '../../utils';
import { Draggable } from '@hello-pangea/dnd';
import ConfirmDeleteModal from '../ConfirmDeleteModal/ConfirmDeleteModal';

function Event({
  event,
  editEvent,
  setEditEvent,
  handleEvents,
  index,
  existingTags,
  setExistingTags,
  handleEntities,
  // scrollPosition,
  scrollRef,
}) {
  const { timeSet, title, startDateTime } = event;

  const [showOptions, setShowOptions] = useState({ show: false, position: '' });
  const [eventEditID, setEventEditID] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [optionsPosition, setOptionsPosition] = useState('above');

  const elementRef = useRef(null);

  const handleOptions = (eventID) => {
    const viewThreshold = 104; // px
    if (scrollRef.current && elementRef.current) {
      const scrollableRect = scrollRef.current.getBoundingClientRect(); // Scrollable div's rect
      const elementRect = elementRef.current.getBoundingClientRect(); // Draggable element's rect
      // Calculate how much space is available above the element inside the scrollable div
      const spaceAbove = elementRect.top - scrollableRect.top;
      // Check if the available space is less than the threshold
      if (spaceAbove < viewThreshold) {
        setShowOptions({ show: true, position: 'top' });
      } else {
        setShowOptions({ show: true, position: 'bottom' });
      }
      setEventEditID(eventID);
    }
    setEventEditID(eventID);
  };

  const handleEdit = () => {
    setShowOptions({ show: false });
    setEditEvent(true);
  };

  const handleDuplicate = async () => {
    setShowOptions({ show: false });
    // const listItemForEvent = await u.fetchListItemById(event.listItemID);
    // const { eventID, ...restOfEvent } = event;
    // const duplicateEventObj = { ...restOfEvent };
    // await handleEvents('create', duplicateEventObj, plusExplicitID);
    const { eventID, ...rest } = event;
    const eventMinusExplicit = { ...rest };
    await handleEntities.createEventAndDate(eventMinusExplicit);
  };

  const handleStartDelete = () => {
    setShowOptions({ show: false });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    // const listItemForEvent = await u.fetchListItemById(event.listItemID);
    // await handleEvents('deleteOne', [event], listItemForEvent);
    await handleEntities.deleteEventAndDate(event);
    setShowDeleteModal(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  const handleStopEditing = () => {
    setEditEvent(false);
    setEventEditID(null);
  };

  return (
    <Draggable draggableId={event.eventID.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          className={styles.event}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          key={`event-${event.eventID}`}
          ref={(el) => {
            elementRef.current = el; // Assign the DOM node to elementRef
            provided.innerRef(el); // Also pass the DOM node to provided.innerRef
          }}
        >
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
                {showOptions.show && event.eventID === eventEditID ? (
                  <EventOptions
                    handleEdit={handleEdit}
                    handleDuplicate={handleDuplicate}
                    handleStartDelete={handleStartDelete}
                    showOptions={showOptions}
                    setShowOptions={setShowOptions}
                    key={`eventOptions-${event.eventID}`}
                    optionsPosition={optionsPosition}
                  />
                ) : null}
              </div>
            </div>
            <div className={styles.tagsContainer} id="flexidiv">
              {event.tags?.length
                ? event.tags?.map((tag) => {
                    const matchingTag = existingTags?.find(
                      (existingTag) => existingTag.tagID === tag
                    );
                    return (
                      <div
                        className={styles.tag}
                        key={`list-item-inner-${tag}`}
                        style={{ backgroundColor: matchingTag?.color }}
                      >
                        {matchingTag?.name}
                      </div>
                    );
                  })
                : null}
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
              handleEntities={handleEntities}
              key={event.eventID}
              // handleOtherEventFields={handleOtherEventFields}
              existingTags={existingTags}
              setExistingTags={setExistingTags}
            />
          ) : null}
          {showDeleteModal ? (
            <ConfirmDeleteModal
              message="Delete this event?"
              handleConfirm={handleConfirmDelete}
              handleCancel={handleCancelDelete}
            />
          ) : null}
        </div>
      )}
    </Draggable>
  );
}

export default Event;
