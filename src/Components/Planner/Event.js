import React, { useState } from 'react';
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
}) {
  const { timeSet, title, startDateTime } = event;

  const [showOptions, setShowOptions] = useState(false);
  const [eventEditID, setEventEditID] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
    // const listItemForEvent = await u.fetchListItemById(event.listItemID);
    // const plusExplicitID = {
    //   ...listItemForEvent,
    //   listItemID: event.listItemID,
    // };
    // const { eventID, ...restOfEvent } = event;
    // const duplicateEventObj = { ...restOfEvent };
    // await handleEvents('create', duplicateEventObj, plusExplicitID);
    const { eventID, ...rest } = event;
    const eventMinusExplicit = { ...rest };
    await handleEntities.createDateAndEvent(eventMinusExplicit);
  };

  const handleStartDelete = () => {
    setShowOptions(false);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    const listItemForEvent = await u.fetchListItemById(event.listItemID);
    const plusExplicitID = {
      ...listItemForEvent,
      listItemID: event.listItemID,
    };
    await handleEvents('deleteOne', [event], plusExplicitID);
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
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          key={`event-${event.eventID}`}
        >
          {showOptions && event.eventID === eventEditID ? (
            <EventOptions
              handleEdit={handleEdit}
              handleDuplicate={handleDuplicate}
              handleStartDelete={handleStartDelete}
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
              handleEvents={handleEvents}
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
