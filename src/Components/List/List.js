import React, { useState, useEffect, useRef } from 'react';
import * as u from '../../utils';
import randomEmoji from 'random-emoji';
import styles from './List.module.css';
import ListItem from '../ListItem/ListItem';

function List({ selectedList, updateList, userUID, handleEditListItem }) {
  const [listItems, setListItems] = useState([]);
  const [listItemsModified, setListItemsModified] = useState(false);

  const fetchListItems = async () => {
    try {
      const allListItems = await u.fetchListItemsByListID(selectedList.listID);
      const allListItemsWithIDs = Object.entries(allListItems).map((e) => ({
        listItemID: e[0],
        ...e[1],
      }));
      console.log(allListItemsWithIDs);
      setListItems(allListItemsWithIDs);
    } catch {
      // handle error fetching list items
    }

    if (listItemsModified) {
      setListItemsModified(false);
    }
  };

  useEffect(() => {
    fetchListItems();
  }, [selectedList, listItemsModified]);

  const handleTitleChange = (e) => {
    const text = e.target.value;
    updateList(selectedList.listID, 'title', text);
  };

  const createListItem = async () => {
    const listData = {
      title: `Untitled ${randomEmoji.random({ count: 1 })[0].character}`,
      createdAt: Date.now(),
      createdBy: userUID,
      parentID: selectedList.listID,
      comment: '',
      startTime: null,
      endTime: null,
      tags: [],
    };
    try {
      const listId = await u.createNewListItem(listData);
      // setSelectedListID(listId);
      setListItemsModified(true);
    } catch (error) {
      console.error('Failed to create list item:', error);
      // You can show an error message to the user, log the error, etc.
    }
  };

  return (
    <div className={styles.container}>
      <input
        className={styles.listTitleInput}
        type="text"
        id="listTitle"
        onChange={(event) => handleTitleChange(event)}
        value={selectedList.title}
      ></input>
      {listItems?.map((listItem) => (
        <ListItem
          listItem={listItem}
          setListItemsModified={setListItemsModified}
          handleEditListItem={handleEditListItem}
        />
      ))}
      <div className={styles.newListItemButton} onClick={createListItem}>
        + New
      </div>
    </div>
  );
}

export default List;
