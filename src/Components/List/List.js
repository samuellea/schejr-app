import React, { useState, useEffect, useRef } from 'react';
import * as u from '../../utils';
import * as h from '../../helpers';
import randomEmoji from 'random-emoji';
import styles from './List.module.css';
import ListItem from '../ListItem/ListItem';
import { Droppable, Draggable } from '@hello-pangea/dnd'; // Updated imports
import Sort from '../Sort/Sort';
import Search from '../Search/Search';
import PlusIcon from '../Icons/PlusIcon';
import ChevronIcon from '../Icons/ChevronIcon';
import DateIcon from '../Icons/DateIcon';

function List({
  selectedList,
  updateList,
  updateListItem,
  handleEditListItem,
  listItems,
  setListItems,
  existingTags,
  showPlanner,
  togglePlanner,
  // handleEvents,
  handleEntities,
  lists,
}) {
  const [sortOn, setSortOn] = useState(selectedList.sortOn);
  const [order, setOrder] = useState(selectedList.order);
  const [listTitle, setListTitle] = useState(selectedList.title);
  const [searchString, setSearchString] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const userUID = localStorage.getItem('firebaseID');

  useEffect(() => {
    setSortOn(selectedList.sortOn);
    setOrder(selectedList.order);
    setListTitle(selectedList.title);
  }, [selectedList]); // Dependency on selectedList

  // compose a single string for search purposes
  useEffect(() => {
    // if (!searchString.length) return setSearchResults([]);
    const listItemStrings = listItems.map((listItem) => {
      const tagsStrings =
        listItem.tags
          ?.map((tagID) => existingTags.find((tag) => tag.tagID === tagID).name)
          .join(' ') || '';
      const string = `${listItem.title} ${tagsStrings}`;
      return { listItemID: listItem.listItemID, string: string };
    });
    console.log(listItemStrings);
    const filtered = listItemStrings.filter((item) =>
      item.string.toLowerCase().includes(searchString.toLowerCase())
    );
    console.log(filtered);
    setSearchResults(filtered);
  }, [listItems, searchString]); // Dependency on selectedList

  const handleTitleChange = (e) => {
    const text = e.target.value;
    setListTitle(text);
  };

  const handleTitleOnBlur = async () => {
    if (selectedList.title !== listTitle) {
      let newTitle = listTitle;
      if (!listTitle.length) newTitle = selectedList.title;
      const newListValues = { title: newTitle };
      updateList(selectedList, newListValues);
    }
  };

  const handleToggleOrder = async () => {
    let newOrder = order === 'ascending' ? 'descending' : 'ascending';
    const newListValues = { order: newOrder, sortOn: sortOn };
    updateList(selectedList, newListValues);
    setOrder(newOrder);
  };

  const createListItem = async () => {
    const maxManualOrderOnList =
      listItems?.reduce((max, item) => Math.max(max, item.manualOrder), 0) || 0;
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
      const newItemWithExplicitID = await u.createNewListItem(
        userUID,
        listData
      );

      setListItems([...listItems, newItemWithExplicitID]);
    } catch (error) {
      console.error('Failed to create list item:', error);
    }
  };

  const deleteListItem = async (listItem) => {
    console.log(listItem);
    await handleEntities.deleteListItemAndEvents(userUID, listItem.listItemID);
    try {
      // then as a final step, delete the gcal event for this listItem if it had one
      // await u.removeGCalEventByListItemID(listItem.listItemID);
    } catch (error) {
      console.error(error);
    }
  };

  const plannerButtonCombined = `${styles.plannerButton} ${styles.listsHeaderButton}`;

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleTitleOnBlur();
    }
  };

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
              onKeyDown={(event) => handleKeyDown(event)}
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
              searchString={searchString}
              setSearchString={setSearchString}
            />
            {/* <Search
              searchString={searchString}
              setSearchString={setSearchString}
            /> */}
            {h
              .sortItems(listItems, sortOn, order, existingTags)
              ?.filter((sortItem) =>
                searchResults.some(
                  (searchResult) =>
                    searchResult.listItemID === sortItem.listItemID
                )
              )
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
                        searching={searchString.length > 0}
                      />
                    </div>
                  )}
                </Draggable>
              )) || null}
            {provided.placeholder}
            <div className={styles.newListItemButtonDivier} />
            <div className={styles.newListItemButton} onClick={createListItem}>
              <PlusIcon fill="white" width="16px" />
              <span>New</span>
            </div>
          </div>
        )}
      </Droppable>
      {!showPlanner ? (
        <div className={styles.showPlannerWrapper}>
          <div
            role="button"
            className={styles.listsHeaderButton}
            onClick={togglePlanner}
          >
            <ChevronIcon fill="white" width="20px" flip={90} />
          </div>
          <div className={styles.showPlannerLabel}>
            <DateIcon fill="white" width="16px" marginBottom="0px" />
            <span>Show Planner</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default List;

/*

*/
