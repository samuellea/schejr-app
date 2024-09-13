import React, { useState, useEffect } from 'react';
import * as u from '../../utils';
import * as h from '../../helpers';
import randomEmoji from 'random-emoji';
import styles from './List.module.css';
import ListItem from '../ListItem/ListItem';
import { Droppable, Draggable } from '@hello-pangea/dnd'; // Updated imports
import Sort from '../Sort/Sort';
import PlusIcon from '../Icons/PlusIcon';

function List({
  selectedList,
  updateList,
  updateListItem,
  userUID,
  handleEditListItem,
  listItems,
  setListItems,
  existingTags,
}) {
  const [sortOn, setSortOn] = useState(selectedList.sortOn);
  const [order, setOrder] = useState(selectedList.order);
  const [listTitle, setListTitle] = useState(selectedList.title);

  useEffect(() => {}, []);

  useEffect(() => {
    setSortOn(selectedList.sortOn);
    setOrder(selectedList.order);
    setListTitle(selectedList.title);
  }, [selectedList]); // Dependency on selectedList

  const handleTitleChange = (e) => {
    const text = e.target.value;
    setListTitle(text);
  };

  const handleTitleOnBlur = async () => {
    let newTitle = listTitle;
    if (!listTitle.length) newTitle = selectedList.title;
    const newListValues = { title: newTitle };
    updateList(selectedList, newListValues);
  };

  const handleToggleOrder = async () => {
    let newOrder = order === 'ascending' ? 'descending' : 'ascending';
    const newListValues = { order: newOrder, sortOn: sortOn };
    updateList(selectedList, newListValues);
    setOrder(newOrder);
  };

  const createListItem = async () => {
    const maxManualOrderOnList =
      listItems.reduce((max, item) => Math.max(max, item.manualOrder), 0) || 0;
    const newHighestManualOrder = maxManualOrderOnList + 1;
    const listData = {
      notes: '',
      createdAt: Date.now(),
      createdBy: userUID,
      date: { startDate: null, endDate: null },
      manualOrder: newHighestManualOrder,
      parentID: `parentListID-${selectedList.listID}`,
      tags: [],
      title: `Untitled ${randomEmoji.random({ count: 1 })[0].character}`,
    };

    try {
      const newItemWithExplicitID = await u.createNewListItem(listData);

      setListItems([...listItems, newItemWithExplicitID]);
    } catch (error) {
      console.error('Failed to create list item:', error);
    }
  };

  const deleteListItem = async (listItem) => {
    // handle UI update using state
    const listItemToDelete = { ...listItem };
    const listItemsMinusDeleted = listItems.filter(
      (e) => e.listItemID !== listItem.listItemID
    );

    setListItems(listItemsMinusDeleted); // <<<<< these won't have tidied .manualOrders, but removes deleted item from state/UI...
    try {
      //   // then actually delete the listItem on db
      await u.deleteListItemByID(listItemToDelete.listItemID);
      //   // then create a tidied copy of new listItems in state (which now don't have the deleted one)
      const updatedManualOrders = listItemsMinusDeleted.map((e, i) => ({
        ...e,
        manualOrder: i + 1,
      }));

      //   // update the list items in state to have tidied .manualOrders

      setListItems(updatedManualOrders);
      // // then patch these tidied objects to their corresponding objs on db
      try {
        const multipleListItemsPatched = await u.patchMultipleListItems(
          updatedManualOrders
        );
        // then as a final step, delete the gcal event for this listItem if it had one
        await u.removeGCalEventByListItemID(listItemToDelete.listItemID);
      } catch (error) {
        console.error(error);
      }
    } catch (error) {
      console.error('Failed to delete list item:', error);
      // You can show an error message to the user, log the error, etc.
    }
  };

  useEffect(() => {}, [listItems]);

  return (
    <div className={styles.listContainerWrapper}>
      <Droppable droppableId={`list-${selectedList.listID}`}>
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
                selectedList={selectedList}
                updateList={updateList}
                sortOn={sortOn}
                setSortOn={setSortOn}
                order={order}
                setOrder={setOrder}
                handleToggleOrder={handleToggleOrder}
                existingTags={existingTags}
              />
              {h
                .sortItems(listItems, sortOn, order, existingTags)
                ?.map((listItem, index) => (
                  <Draggable
                    key={`draggable-${listItem.listItemID}`}
                    draggableId={listItem.listItemID}
                    index={index}
                    type="list-item"
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
                          handleEditListItem={handleEditListItem}
                          existingTags={existingTags}
                          deleteListItem={deleteListItem}
                          updateListItem={updateListItem}
                          key={`list-item-${listItem.listItemID}`}
                          provided={provided}
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
      <div className={styles.newListItemButtonDivier} />
      <div className={styles.newListItemButton} onClick={createListItem}>
        <PlusIcon />
        <span>New</span>
      </div>
    </div>
  );
}

export default List;

/*

*/
