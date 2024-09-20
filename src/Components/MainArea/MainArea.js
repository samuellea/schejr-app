import React, { useState, useEffect, useRef } from 'react';
import styles from './MainArea.module.css';
import List from '../List/List';
import ListItemEditPane from '../ListItemEditPane/ListItemEditPane';
import * as u from '../../utils';
import { Droppable } from '@hello-pangea/dnd'; // Updated import
import EditIcon from '../Icons/EditIcon';
import Planner from '../Planner/Planner';

function MainArea({
  showSidebar,
  selectedList,
  updateList,
  updateListItem,
  handleEvents,
  userUID,
  listItems,
  setListItems,
  listAndItemsLoaded,
  setListAndItemsLoaded,
  syncWithGCal,
  handleSetSyncWithGCal,
  events,
  setEvents,
  viewMonth,
  setViewMonth,
}) {
  // Will show either the selected List, or if a list item is selected, a List Item expanded view
  const [existingTags, setExistingTags] = useState([]);
  const [listItemEditID, setListItemEditID] = useState(null);
  const [showPlanner, setShowPlanner] = useState(false);
  const [plannerMax, setPlannerMax] = useState(false);

  const fetchListItems = async () => {
    if (selectedList.listID) {
      setListAndItemsLoaded(false);
      try {
        const allListItems = await u.fetchListItemsByListID(
          selectedList.listID
        );
        const allListItemsWithIDs = Object.entries(allListItems).map((e) => ({
          listItemID: e[0],
          ...e[1],
        }));

        setListItems(allListItemsWithIDs);
        setListAndItemsLoaded(true);
      } catch {
        // Handle error fetching list items
      }
    }
  };

  const fetchTags = async () => {
    try {
      const allUserTags = await u.fetchAllUserTags(userUID);
      const allUserTagsWithIDs = Object.entries(allUserTags).map((e) => ({
        tagID: e[0],
        ...e[1],
      }));
      setExistingTags(allUserTagsWithIDs);
    } catch {
      // Handle error fetching tags
    }
  };

  const prevListIDRef = useRef(selectedList?.listID);

  // this is firing when the sortOn and order keys change on the selectedList, taken from lists in Home state.
  useEffect(() => {
    // I only want to fetch new list items when a new list is selected, NOT when sortOn and order values for a list change!
    if (selectedList && prevListIDRef.current !== selectedList.listID) {
      prevListIDRef.current = selectedList.listID;
      fetchListItems();
      setListItemEditID(null);
      // fetchTags();
    }
  }, [selectedList]);

  useEffect(() => {
    fetchTags();
  }, []);

  const handleEditListItem = (listItemID) => {
    setListItemEditID(listItemID);
  };

  const handleCloseEditPane = () => {
    setListItemEditID(null);
  };

  const togglePlanner = async () => {
    setShowPlanner((prev) => !prev);
  };

  const toggleExpand = async () => {
    setPlannerMax((prev) => !prev);
  };

  return (
    <div
      className={styles.container}
      style={{ width: showSidebar ? '80%' : '100%' }}
    >
      {selectedList && listAndItemsLoaded ? (
        <List
          selectedList={selectedList}
          updateList={updateList}
          updateListItem={updateListItem}
          userUID={userUID}
          listItems={listItems}
          setListItems={setListItems}
          handleEditListItem={handleEditListItem}
          existingTags={existingTags}
          showPlanner={showPlanner}
          togglePlanner={togglePlanner}
          handleEvents={handleEvents}
        />
      ) : (
        <div className={styles.emptyMessage}>
          <p className={styles.emptyMessageSpan}>
            Select a list or create one with
            <span>
              <EditIcon fill="#9b9b9b" width="20px" />
            </span>
          </p>
        </div>
      )}
      {listItemEditID ? (
        <ListItemEditPane
          listItemEditID={listItemEditID}
          listItems={listItems}
          setListItems={setListItems}
          handleCloseEditPane={handleCloseEditPane}
          userUID={userUID}
          updateListItem={updateListItem}
          handleEvents={handleEvents}
          // fetchTags={fetchTags}
          existingTags={existingTags}
          setExistingTags={setExistingTags}
          syncWithGCal={syncWithGCal}
          handleSetSyncWithGCal={handleSetSyncWithGCal}
        />
      ) : null}
      {/* {showPlanner ? ( */}
      <Planner
        showPlanner={showPlanner}
        togglePlanner={togglePlanner}
        plannerMax={plannerMax}
        toggleExpand={toggleExpand}
        events={events}
        setEvents={setEvents}
        viewMonth={viewMonth}
        setViewMonth={setViewMonth}
        handleEvents={handleEvents}
      />
      {/* ) : null} */}
    </div>
  );
}

export default MainArea;
