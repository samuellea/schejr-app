import React, { useState } from 'react';
import styles from './Sidebar.module.css';
import ListButton from '../ListButton/ListButton';
import * as u from '../../utils';
import randomEmoji from 'random-emoji';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import EditIcon from '../Icons/EditIcon';
import ChevronIcon from '../Icons/ChevronIcon';
import ConfirmDeleteModal from '../ConfirmDeleteModal/ConfirmDeleteModal';

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
}) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [listDeleteBackground, setListDeleteBackground] = useState(false);

  const createList = async () => {
    // length of 'lists' in state - 1
    const newListData = {
      title: `Untitled ${randomEmoji.random({ count: 1 })[0].character}`,
      createdAt: Date.now(),
      createdBy: userUID,
      sortOn: 'manualOrder',
      order: 'ascending',
      sidebarIndex: lists.length,
    };
    try {
      const listID = await u.createNewList(userUID, newListData);
      const newListDataPlusID = { ...newListData, listID: listID };
      const updatedLists = [...lists, newListDataPlusID];
      setLists(updatedLists);
      setSelectedListID(listID);
    } catch (error) {
      console.error('Failed to create list:', error);
    }
  };

  const combined = `${styles.container} ${
    showSidebar ? styles.sidebarOpen : styles.sidebarClosed
  }`;

  return (
    <div className={combined} style={{ zIndex: listDeleteBackground ? 9 : 1 }}>
      <div className={styles.listsHeader}>
        <div
          role="button"
          className={styles.listsHeaderButton}
          onClick={toggleSidebar}
        >
          <ChevronIcon fill="white" width="16px" />
        </div>
        <p className={styles.sidebarTitle}>{displayName}'s lists</p>
        <div
          role="button"
          className={styles.listsHeaderButton}
          onClick={createList}
        >
          <EditIcon fill="white" width="16px" />
        </div>
      </div>
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
      <div className={styles.logOutSection}>
        <div className={styles.dividerLine} />
        <div
          role="button"
          className={styles.logOutButton}
          onClick={() => setShowLogoutModal(true)}
        >
          Log out
        </div>
      </div>

      {showLogoutModal ? (
        <ConfirmDeleteModal
          message={`Log out ${displayName}`}
          handleConfirm={() => handleLogout()}
          handleCancel={() => setShowLogoutModal(false)}
          confirmLabel="Log out"
        />
      ) : null}
    </div>
  );
}

export default Sidebar;
