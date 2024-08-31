import React from 'react';
import styles from './Sidebar.module.css';
import ListButton from '../ListButton/ListButton';
import * as u from '../../utils';
import randomEmoji from 'random-emoji';
import { Droppable } from '@hello-pangea/dnd'; // Updated import

function Sidebar({
  userUID,
  sortedLists,
  selectedListID,
  setSelectedListID,
  setListsModified,
  toggleSidebar,
  showSidebar,
  handleSelectListButton,
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
        <button onClick={toggleSidebar}>《</button>
        <p>Lists</p>
        <button onClick={createList}>Add</button>
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
