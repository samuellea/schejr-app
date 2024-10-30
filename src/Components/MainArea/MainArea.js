import React, { useState, useEffect, useRef } from 'react';
import styles from './MainArea.module.css';
import List from '../List/List';
import ListItemEditPane from '../ListItemEditPane/ListItemEditPane';
import * as u from '../../utils';
import { Droppable } from '@hello-pangea/dnd'; // Updated import
import EditIcon from '../Icons/EditIcon';
import Planner from '../Planner/Planner';
import ChevronIcon from '../Icons/ChevronIcon';
import EventDiscrepancies from '../EventDiscrepancies/EventDiscrepancies';
import Spinner from '../Spinner/Spinner';

function MainArea({
  userUID,
  showSidebar,
  selectedList,
  updateList,
  handleEntities,
  // updateListItem,
  // handleEvents,
  listItems,
  setListItems,
  listAndItemsLoaded,
  setListAndItemsLoaded,
  syncWithGCal,
  handleSetSyncWithGCal,
  events,
  setEvents,
  plannerRange,
  setPlannerRange,
  setModalBackground,
  // handleOtherEventFields,
  toggleSidebar,
  lists,
  discrepanciesChecked,
  eventDiscrepancies,
  handleSubmitFixes,
  fixingDiscrepancies,
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
        const allListItemsWithIDs = await u.fetchListItemsByListID(
          userUID,
          selectedList.listID
        );
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
      // style={{ width: showSidebar ? '80%' : '100%' }}
    >
      {/* {showSidebar ? <div className={styles.sidebarSpacer} /> : null} */}
      {/* <div className={styles.sidebarSpacer} /> */}

      {/* {!showSidebar ? (
        <div
          role="button"
          className={styles.openSidebarButton}
          onClick={toggleSidebar}
        >
          <ChevronIcon fill="white" width="16px" flip="180" />
        </div>
      ) : null} */}

      {discrepanciesChecked && eventDiscrepancies ? (
        <EventDiscrepancies
          evDiscs={eventDiscrepancies}
          handleSubmitFixes={handleSubmitFixes}
          fixingDiscrepancies={fixingDiscrepancies}
          handleSetSyncWithGCal={handleSetSyncWithGCal}
        />
      ) : null}

      {selectedList && listAndItemsLoaded ? (
        <List
          selectedList={selectedList}
          updateList={updateList}
          // updateListItem={updateListItem}
          listItems={listItems}
          setListItems={setListItems}
          handleEditListItem={handleEditListItem}
          existingTags={existingTags}
          showPlanner={showPlanner}
          togglePlanner={togglePlanner}
          // handleEvents={handleEvents}
          handleEntities={handleEntities}
          lists={lists}
        />
      ) : discrepanciesChecked ? (
        <div className={styles.emptyMessage}>
          <p className={styles.emptyMessageSpan}>
            Select a list or create one with
            <span>
              <EditIcon fill="#9b9b9b" width="20px" />
            </span>
          </p>
        </div>
      ) : (
        <div className={styles.waitForDiscrepanciesSpinner}>
          <Spinner />
        </div>
      )}
      {listItemEditID &&
      listItems.find((e) => e.listItemID === listItemEditID) ? (
        <ListItemEditPane
          // listItemEditID={listItemEditID}
          listItem={listItems.find((e) => e.listItemID === listItemEditID)}
          listItems={listItems}
          setListItems={setListItems}
          handleCloseEditPane={handleCloseEditPane}
          userUID={userUID}
          // updateListItem={updateListItem}
          // handleEvents={handleEvents}
          // fetchTags={fetchTags}
          existingTags={existingTags}
          setExistingTags={setExistingTags}
          syncWithGCal={syncWithGCal}
          handleSetSyncWithGCal={handleSetSyncWithGCal}
          handleEntities={handleEntities}
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
        // handleEvents={handleEvents}
        existingTags={existingTags}
        setExistingTags={setExistingTags}
        // handleOtherEventFields={handleOtherEventFields}
        handleEntities={handleEntities}
        plannerRange={plannerRange}
        setPlannerRange={setPlannerRange}
        // setModalBackground={setModalBackground}
        showSidebar={showSidebar}
        eventDiscrepancies={eventDiscrepancies}
      />
      {/* ) : null} */}
    </div>
  );
}

export default MainArea;
