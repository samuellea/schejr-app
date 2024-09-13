import React, { useState } from 'react';
import styles from './Sidebar.module.css';
import ListButton from '../ListButton/ListButton';
import * as u from '../../utils';
import randomEmoji from 'random-emoji';
import { Droppable } from '@hello-pangea/dnd'; // Updated import
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
  handleDeleteList,
  handleLogout,
}) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const createList = async () => {
    const newListData = {
      title: `Untitled ${randomEmoji.random({ count: 1 })[0].character}`,
      createdAt: Date.now(),
      createdBy: userUID,
      sortOn: 'manualOrder',
      order: 'ascending',
    };
    try {
      const listID = await u.createNewList(newListData);

      const newListDataPlusID = { ...newListData, listID: listID };
      const updatedLists = [...lists, newListDataPlusID];
      setLists(updatedLists);
      setSelectedListID(listID);
    } catch (error) {
      console.error('Failed to create list:', error);
      // Handle error
    }
  };

  const combined = `${styles.container} ${
    showSidebar ? styles.sidebarOpen : styles.sidebarClosed
  }`;

  return (
    <div className={combined}>
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
      <div className={styles.listContainer}>
        {lists
          ?.sort((a, b) => a.createdAt - b.createdAt)
          .map((list, i) => (
            <Droppable
              key={list.listID}
              droppableId={list.listID}
              direction="horizontal"
              // droppableId={`buttonList-${i}`}
              // key={`buttonList-${i}`}
            >
              {(provided) => (
                <div
                  className={styles.listButton}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <ListButton
                    listName={list.title}
                    createdAt={list.createdAt}
                    listID={list.listID}
                    handleSelectListButton={handleSelectListButton}
                    selected={list.listID === selectedListID}
                    handleDeleteList={handleDeleteList}
                  />
                  {/* {provided.placeholder} */}
                </div>
              )}
            </Droppable>
          ))}
      </div>
      <div className={styles.dividerLine} />
      <div
        role="button"
        className={styles.logOutButton}
        onClick={() => setShowLogoutModal(true)}
      >
        Log out
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
