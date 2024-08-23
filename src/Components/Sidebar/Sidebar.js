import React, { useState, useEffect } from 'react';
import styles from './Sidebar.module.css';
import ListButton from '../ListButton/ListButton';
import * as u from '../../utils';
import randomEmoji from 'random-emoji';

function Sidebar({
  userUID,
  sortedLists,
  selectedListID,
  setSelectedListID,
  setListsModified,
  toggleSidebar,
  showSidebar,
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
      // You can show an error message to the user, log the error, etc.
    }
  };

  const handleSelect = (listID) => {
    setSelectedListID(listID);
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
      {sortedLists.map((list, i) => (
        <ListButton
          listName={list.title}
          createdAt={list.createdAt}
          listID={list.listID}
          setListsModified={setListsModified}
          handleSelect={handleSelect}
          selected={list.listID === selectedListID}
          key={`${list.listID}-${i}`}
        />
      ))}
    </div>
  );
}

export default Sidebar;
