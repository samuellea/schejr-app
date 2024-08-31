import React, { useState } from 'react';
import * as u from '../../utils';
import * as h from '../../helpers';
import randomEmoji from 'random-emoji';
import styles from './List.module.css';
import ListItem from '../ListItem/ListItem';
import { Droppable, Draggable } from '@hello-pangea/dnd'; // Updated imports
import Sort from '../Sort/Sort';

function List({
  selectedList,
  updateList,
  userUID,
  handleEditListItem,
  setListItemsModified,
  listItems,
  setListItems,
  existingTags,
}) {
  const [sortOn, setSortOn] = useState('manualOrder');
  const [order, setOrder] = useState('ascending');
  const [listTitle, setListTitle] = useState(selectedList.title);

  const handleTitleChange = (e) => {
    const text = e.target.value;
    console.log(text);
    setListTitle(text);
  };

  const handleTitleOnBlur = () => {
    let newTitle = listTitle;
    if (!listTitle.length) newTitle = selectedList.title;
    updateList(selectedList.listID, 'title', newTitle);
  };

  const handleToggleOrder = () => {
    if (order === 'ascending') {
      setOrder('descending');
    } else {
      setOrder('ascending');
    }
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
      const newItemWithExplicitID = await u.createNewListItem(listData);
      setListItems([...listItems, newItemWithExplicitID]);
      // setListItemsModified(true);
    } catch (error) {
      console.error('Failed to create list item:', error);
    }
  };

  const deleteListItem = async (listItem) => {
    console.log(listItems);
    // handle UI update using state
    const listItemToDelete = { ...listItem };
    const listItemsMinusDeleted = listItems.filter(
      (e) => e.listItemID !== listItem.listItemID
    );
    setListItems(listItemsMinusDeleted); // <<<<< these won't have tidied .manualOrders, but removes deleted item from state/UI...
    try {
      console.log(listItemToDelete);
      console.log(listItemToDelete.listItemID);
      //   // then actually delete the listItem on db
      await u.deleteListItemByID(listItemToDelete.listItemID);
      //   // then create a tidied copy of new listItems in state (which now don't have the deleted one)
      const updatedManualOrders = listItemsMinusDeleted.map((e, i) => ({
        ...e,
        manualOrder: i + 1,
      }));
      console.log(updatedManualOrders);
      //   // update the list items in state to have tidied .manualOrders
      setListItems(updatedManualOrders);
      // // then patch these tidied objects to their corresponding objs on db
      try {
        const multipleListItemsPatched = await u.patchMultipleListItems(
          updatedManualOrders
        );
        // setListItemsModified(true);
      } catch (error) {
        console.error(error);
        // setListItemsModified(true);
      }
    } catch (error) {
      console.error('Failed to delete list item:', error);
      // You can show an error message to the user, log the error, etc.
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
                onChange={handleTitleChange} // Directly pass the handler
                onBlur={handleTitleOnBlur}
                value={listTitle}
              />
              <Sort
                sortOn={sortOn}
                setSortOn={setSortOn}
                order={order}
                handleToggleOrder={handleToggleOrder}
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
                        deleteListItem={deleteListItem}
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
