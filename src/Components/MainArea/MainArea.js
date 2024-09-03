import React, { useState, useEffect } from 'react';
import styles from './MainArea.module.css';
import List from '../List/List';
import ListItemEditPane from '../ListItemEditPane/ListItemEditPane';
import * as u from '../../utils';
import { Droppable } from '@hello-pangea/dnd'; // Updated import

function MainArea({
  showSidebar,
  selectedList,
  updateList,
  updateListItem,
  userUID,
  listItems,
  setListItems,
  listAndItemsLoaded,
  setListAndItemsLoaded,
  syncWithGCal,
  handleSetSyncWithGCal,
}) {
  // Will show either the selected List, or if a list item is selected, a List Item expanded view
  const [existingTags, setExistingTags] = useState([]);
  const [listItemEditID, setListItemEditID] = useState(null);

  const fetchListItems = async () => {
    setListAndItemsLoaded(false);
    try {
      const allListItems = await u.fetchListItemsByListID(selectedList.listID);
      const allListItemsWithIDs = Object.entries(allListItems).map((e) => ({
        listItemID: e[0],
        ...e[1],
      }));
      setListItems(allListItemsWithIDs);
      setListAndItemsLoaded(true);
    } catch {
      // Handle error fetching list items
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

  useEffect(() => {
    fetchListItems();
    fetchTags();
  }, [selectedList]);

  const handleEditListItem = (listItemID) => {
    setListItemEditID(listItemID);
  };

  const handleCloseEditPane = () => {
    setListItemEditID(null);
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
        />
      ) : null}
      {listItemEditID ? (
        <ListItemEditPane
          listItemEditID={listItemEditID}
          listItems={listItems}
          handleCloseEditPane={handleCloseEditPane}
          userUID={userUID}
          updateListItem={updateListItem}
          fetchTags={fetchTags}
          existingTags={existingTags}
          syncWithGCal={syncWithGCal}
          handleSetSyncWithGCal={handleSetSyncWithGCal}
        />
      ) : null}
    </div>
  );
}

export default MainArea;
