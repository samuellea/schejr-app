import React, { useState } from 'react';
import styles from './Sidebar.module.css';
import ListButton from '../ListButton/ListButton';
import * as u from '../../utils';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import EditIcon from '../Icons/EditIcon';
import ChevronIcon from '../Icons/ChevronIcon';

function Sidebar({
  userUID,
  displayName,
  lists,
  setLists,
  selectedListID,
  setSelectedListID,
  toggleSidebar,
  showSidebar,
  handleSelectListButton,
  // handleDeleteList,
  handleLogout,
  deleteListAndRelated,
  specialUpdateEvents,
  specialUpdateListItems,
}) {
  const [listDeleteBackground, setListDeleteBackground] = useState(false);

  // const combined = `${styles.container} ${
  //   showSidebar ? styles.sidebarOpen : styles.sidebarClosed
  // }`;

  return (
    <div
      className={styles.container}
      // style={{ zIndex: listDeleteBackground ? 9 : 1 }}
    >
      {/* Sidebar Droppable */}
      <Droppable droppableId="sidebar" isCombineEnabled={true}>
        {(provided) => (
          <div
            className={styles.listContainer}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {lists
              ?.sort((a, b) => a.sidebarIndex - b.sidebarIndex)
              .map((list, index) => (
                <Draggable
                  draggableId={`draggableListButton-${list.listID}`}
                  index={index}
                  key={`keyDraggableListButton-${list.listID}`}
                >
                  {(draggableProvided) => (
                    <div
                      ref={draggableProvided.innerRef}
                      {...draggableProvided.draggableProps}
                      {...draggableProvided.dragHandleProps}
                    >
                      {/* Droppable for handling external drops */}
                      <Droppable
                        droppableId={`droppableListButton-${list.listID}`}
                        direction="horizontal"
                        key={`keyDroppableListButton-${list.listID}`}
                        type="list-item"
                      >
                        {(droppableProvided, snapshot) => (
                          <div
                            className={`${styles.listButton} ${
                              snapshot.isDraggingOver ? styles.dragOver : ''
                            }`}
                            ref={droppableProvided.innerRef}
                            {...droppableProvided.droppableProps}
                          >
                            <ListButton
                              listName={list.title}
                              createdAt={list.createdAt}
                              listID={list.listID}
                              handleSelectListButton={handleSelectListButton}
                              selected={list.listID === selectedListID}
                              deleteListAndRelated={deleteListAndRelated}
                              setListDeleteBackground={setListDeleteBackground}
                            />
                            {/* Render the placeholder here */}
                            <div className={styles.hiddenPlaceholder}>
                              {droppableProvided.placeholder}
                            </div>
                          </div>
                        )}
                      </Droppable>
                    </div>
                  )}
                </Draggable>
              ))}
            {/* Render the placeholder for the outer droppable */}
            <div className={styles.hiddenPlaceholder}>
              {provided.placeholder}
            </div>
          </div>
        )}
      </Droppable>
      {/* <div className={styles.logOutSection}>
        <div className={styles.dividerLine} />
        <div
          role="button"
          className={styles.logOutButton}
          onClick={() => setShowLogoutModal(true)}
        >
          Log out
        </div>
      </div> */}
      <button onClick={specialUpdateEvents}>Events</button>
      <button onClick={specialUpdateListItems}>ListItems</button>
    </div>
  );
}

export default Sidebar;
