import React, { useState } from 'react';
import * as u from '../../utils';
import * as h from '../../helpers';
import randomEmoji from 'random-emoji';
import styles from './List.module.css';
import ListItem from '../ListItem/ListItem';
import { Droppable, Draggable } from '@hello-pangea/dnd'; // Updated imports

function List({
  selectedList,
  updateList,
  userUID,
  handleEditListItem,
  setListItemsModified,
  listItems,
  existingTags,
}) {
  const [sortOn, setSortOn] = useState('manualOrder');
  const [order, setOrder] = useState('ascending');

  const handleTitleChange = (e) => {
    const text = e.target.value;
    updateList(selectedList.listID, 'title', text);
  };

  const createListItem = async () => {
    const maxManualOrderOnList =
      listItems.reduce((max, item) => Math.max(max, item.manualOrder), 0) || 0;
    const newHighestManualOrder = maxManualOrderOnList + 1;
    const listData = {
      comment: '',
      createdAt: Date.now(),
      createdBy: userUID,
      date: { startDate: null, endDate: null },
      manualOrder: newHighestManualOrder,
      parentID: selectedList.listID,
      tags: [],
      title: `Untitled ${randomEmoji.random({ count: 1 })[0].character}`,
    };
    try {
      const listId = await u.createNewListItem(listData);
      setListItemsModified(true);
    } catch (error) {
      console.error('Failed to create list item:', error);
    }
  };

  const tidyManualOrdersOnDelete = async (deletedListItemID, parentID) => {
    const listItemsMinusOneJustDeleted = listItems
      .filter((e) => e.listItemID !== deletedListItemID)
      .sort((a, b) => a.manualOrder - b.manualOrder);

    const updatedManualOrders = listItemsMinusOneJustDeleted.map((e, i) => ({
      ...e,
      manualOrder: i + 1,
    }));

    const updates = updatedManualOrders.map((e) => {
      const { listItemID, ...newObj } = e;
      return { id: e.listItemID, data: { ...newObj } };
    });

    try {
      const multipleListItemsPatched = await u.patchMultipleListItems(updates);
      setListItemsModified(true);
    } catch (error) {
      console.error(error);
      setListItemsModified(true);
    }
  };

  return (
    <div className={styles.listContainerWrapper}>
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
                onChange={handleTitleChange}
                value={selectedList.title}
              />
              {h.sortItems(listItems, sortOn, order)?.map((listItem, index) => (
                <Draggable
                  key={`draggable-${listItem.listItemID}`}
                  draggableId={listItem.listItemID}
                  index={index}
                  type="list-item" ///////////////////////////////////////
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
                        tidyManualOrdersOnDelete={tidyManualOrdersOnDelete}
                        // key={`list-item-${listItem.listItemID}`}
                      />
                    </div>
                  )}
                </Draggable>
              )) || null}
            </div>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      <div className={styles.newListItemButton} onClick={createListItem}>
        + New
      </div>
    </div>
  );
}

export default List;

/*

*/
