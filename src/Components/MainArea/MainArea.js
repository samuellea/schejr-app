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
  listItemEditID,
  setListItemEditID,
  updateList,
  handleEntities,
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
  lists,
  discrepanciesChecked,
  eventDiscrepancies,
  handleSubmitFixes,
  fixingDiscrepancies,
  setShowSidebar,
  showPlanner,
  setShowPlanner,
  togglePlanner,
}) {
  // Will show either the selected List, or if a list item is selected, a List Item expanded view
  const [existingTags, setExistingTags] = useState([]);
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

  const toggleExpand = async () => {
    setPlannerMax((prev) => !prev);
  };

  const plannerClosed = {
    height: window.innerWidth < 768 ? '100px' : '70px',
  };

  useEffect(() => {
    if (!showPlanner) setPlannerMax(false);
  }, [showPlanner]);

  return (
    <div className={styles.container}>
      {discrepanciesChecked && eventDiscrepancies ? (
        <EventDiscrepancies
          evDiscs={eventDiscrepancies}
          handleSubmitFixes={handleSubmitFixes}
          fixingDiscrepancies={fixingDiscrepancies}
          handleSetSyncWithGCal={handleSetSyncWithGCal}
        />
      ) : null}

      {/* <div
        className={styles.listSection}
        style={{
          height: !showPlanner ? '100%' : plannerMax ? '0%' : '50%',
          transition: 'height 0.2s ease',
        }}
      > */}
      {selectedList && listAndItemsLoaded ? (
        <List
          selectedList={selectedList}
          updateList={updateList}
          listItems={listItems}
          setListItems={setListItems}
          handleEditListItem={handleEditListItem}
          existingTags={existingTags}
          showPlanner={showPlanner}
          togglePlanner={togglePlanner}
          handleEntities={handleEntities}
          lists={lists}
          setShowSidebar={setShowSidebar}
        />
      ) : discrepanciesChecked && !eventDiscrepancies ? (
        <div className={styles.emptyMessage}>
          <p className={styles.emptyMessageSpan}>
            Select a list or create one with
            <span>
              <EditIcon fill="#9b9b9b" width="20px" />
            </span>
          </p>
        </div>
      ) : !discrepanciesChecked && !eventDiscrepancies ? (
        <div className={styles.waitForDiscrepanciesSpinner}>
          <Spinner />
        </div>
      ) : null}
      {/* </div> */}

      {listItemEditID &&
      listItems.find((e) => e.listItemID === listItemEditID) ? (
        <ListItemEditPane
          listItem={listItems.find((e) => e.listItemID === listItemEditID)}
          listItems={listItems}
          setListItems={setListItems}
          handleCloseEditPane={handleCloseEditPane}
          userUID={userUID}
          existingTags={existingTags}
          setExistingTags={setExistingTags}
          syncWithGCal={syncWithGCal}
          handleSetSyncWithGCal={handleSetSyncWithGCal}
          handleEntities={handleEntities}
        />
      ) : null}
      {selectedList ? (
        <div
          className={styles.plannerSection}
          style={{
            // height: '50%',
            height: !showPlanner
              ? plannerClosed.height
              : plannerMax
              ? '100%'
              : '50%',
            transition: 'height 0.2s ease',
            borderTop: !plannerMax
              ? '1px solid rgba(155, 155, 155, 0.151)'
              : 'none',
            // padding: !showPlanner
            //   ? '0px'
            //   : plannerMax
            //   ? '0px 0px 0px 0px'
            //   : '0px 0px 0px 0px',
            // borderTop: plannerMax
            //   ? 'none'
            //   : '1px solid rgba(155, 155, 155, 0.151)',
          }}
        >
          {selectedList && listAndItemsLoaded ? (
            <Planner
              showPlanner={showPlanner}
              togglePlanner={togglePlanner}
              plannerMax={plannerMax}
              toggleExpand={toggleExpand}
              events={events}
              setEvents={setEvents}
              existingTags={existingTags}
              setExistingTags={setExistingTags}
              handleEntities={handleEntities}
              plannerRange={plannerRange}
              setPlannerRange={setPlannerRange}
              showSidebar={showSidebar}
              eventDiscrepancies={eventDiscrepancies}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default MainArea;
