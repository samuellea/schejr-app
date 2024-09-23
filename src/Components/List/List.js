import React, { useState, useEffect, useRef } from 'react';
import * as u from '../../utils';
import * as h from '../../helpers';
import randomEmoji from 'random-emoji';
import styles from './List.module.css';
import ListItem from '../ListItem/ListItem';
import { Droppable, Draggable } from '@hello-pangea/dnd'; // Updated imports
import Sort from '../Sort/Sort';
import PlusIcon from '../Icons/PlusIcon';
import ChevronIcon from '../Icons/ChevronIcon';

function List({
  selectedList,
  updateList,
  updateListItem,
  userUID,
  handleEditListItem,
  listItems,
  setListItems,
  existingTags,
  showPlanner,
  togglePlanner,
  // handleEvents,
  handleEntities,
}) {
  const [sortOn, setSortOn] = useState(selectedList.sortOn);
  const [order, setOrder] = useState(selectedList.order);
  const [listTitle, setListTitle] = useState(selectedList.title);

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
      parentID: selectedList.listID,
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
      // then actually delete the listItem on db
      await u.deleteListItemByID(listItemToDelete.listItemID);
      // then create a tidied copy of new listItems in state (which now don't have the deleted one)
      const updatedManualOrders = listItemsMinusDeleted.map((e, i) => ({
        ...e,
        manualOrder: i + 1,
      }));
      // update the list items in state to have tidied .manualOrders
      setListItems(updatedManualOrders);
      // then patch these tidied objects to their corresponding objs on db
      try {
        const multipleListItemsPatched = await u.patchMultipleListItems(
          updatedManualOrders
        );
        try {
          // then delete any events on /events that have .listItemID === listItemToDelete.listItemID
          // call handleEvents with action 'delete' to delete any /events objs on DB AND to remove any of these event objs if they are currently in 'events' state
          // await handleEvents('deleteAll', listItem.dates, listItem);
          try {
            // then as a final step, delete the gcal event for this listItem if it had one
            await u.removeGCalEventByListItemID(listItemToDelete.listItemID);
          } catch (error) {
            console.error(error);
          }
        } catch (error) {
          console.error(error);
        }
      } catch (error) {
        console.error(error);
      }
    } catch (error) {
      console.error('Failed to delete list item:', error);
      // You can show an error message to the user, log the error, etc.
    }
  };

  const plannerButtonCombined = `${styles.plannerButton} ${styles.listsHeaderButton}`;

  return (
    <div
      className={styles.listContainerWrapper}
      style={{
        // padding: showPlanner ? '28px 13px 0px 28px' : '28px 20px 0px 28px',
        height: showPlanner ? '50%' : '100%',
        display: showPlanner ? null : 'flex',
      }}
    >
      <Droppable droppableId={`list-${selectedList.listID}`} type="list-item">
        {(provided) => (
          <div
            className={styles.container}
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              padding: showPlanner ? '28px 3px 0px 28px' : '28px 15px 0px 28px',
            }}
          >
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
                  type="list-item"
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
                        handleEditListItem={handleEditListItem}
                        existingTags={existingTags}
                        deleteListItem={deleteListItem}
                        updateListItem={updateListItem}
                        key={`list-item-${listItem.listItemID}`}
                        provided={provided}
                        handleEntities={handleEntities}
                      />
                    </div>
                  )}
                </Draggable>
              )) || null}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      <div className={styles.newListItemButtonDivier} />
      <div className={styles.newListItemButton} onClick={createListItem}>
        <PlusIcon fill="white" width="16px" />
        <span>New</span>
      </div>
      {!showPlanner ? (
        <div
          role="button"
          className={styles.listsHeaderButton}
          onClick={togglePlanner}
        >
          <ChevronIcon fill="white" width="20px" flip={90} />
        </div>
      ) : null}
    </div>
  );
}

export default List;

/*

*/
