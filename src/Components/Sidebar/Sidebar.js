import React from 'react';
import styles from './Sidebar.module.css';
import ListButton from '../ListButton/ListButton';
import * as u from '../../utils';
import randomEmoji from 'random-emoji';
import { Droppable } from '@hello-pangea/dnd'; // Updated import
import EditIcon from '../Icons/EditIcon';
import ChevronIcon from '../Icons/ChevronIcon';

function Sidebar({
  userUID,
  displayName,
  sortedLists,
  selectedListID,
  setSelectedListID,
  setListsModified,
  toggleSidebar,
  showSidebar,
  handleSelectListButton,
  handleDeleteList,
}) {
  const createList = async () => {
    const listData = {
      title: `Untitled ${randomEmoji.random({ count: 1 })[0].character}`,
      createdAt: Date.now(),
      createdBy: userUID,
    };
    try {
      const listId = await u.createNewList(listData);
      setSelectedListID(listId);
      setListsModified(true);
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
        {sortedLists.map((list) => (
          <Droppable
            key={list.listID}
            droppableId={list.listID}
            direction="horizontal"
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
                  setListsModified={setListsModified}
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
    </div>
  );
}

export default Sidebar;
