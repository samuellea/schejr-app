import React, { useState, useEffect, useRef } from 'react';
import * as u from '../../utils';
import randomEmoji from 'random-emoji';
import styles from './List.module.css';
import ListItem from '../ListItem/ListItem';
import { Droppable, Draggable } from 'react-beautiful-dnd';

function List({
  selectedList,
  updateList,
  userUID,
  handleEditListItem,
  setListItemsModified,
  listItems,
  existingTags,
}) {
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
      date: { startDate: null, endDate: null },
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
    <Droppable droppableId="list">
      {(provided) => (
        <div
          className={styles.container}
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          <div className={styles.container}>
            <input
              className={styles.listTitleInput}
              type="text"
              id="listTitle"
              onChange={(event) => handleTitleChange(event)}
              value={selectedList.title}
            ></input>
            {listItems?.map((listItem, index) => (
              <Draggable
                key={listItem.listItemID}
                draggableId={listItem.listItemID}
                index={index}
              >
                {(provided) => (
                  <div
                    className={styles.listItem}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <ListItem
                      listItem={listItem}
                      setListItemsModified={setListItemsModified}
                      handleEditListItem={handleEditListItem}
                      existingTags={existingTags}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            <div className={styles.newListItemButton} onClick={createListItem}>
              + New
            </div>
          </div>
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}

export default List;
