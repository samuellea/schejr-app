import React, { useState, useEffect } from 'react';
import styles from './MainArea.module.css';
import List from '../List/List';
import ListItemEditPane from '../ListItemEditPane/ListItemEditPane';
import * as u from '../../utils';
import { Droppable } from '@hello-pangea/dnd'; // Updated import

function MainArea({ selectedList, updateList, userUID }) {
  // Will show either the selected List, or if a list item is selected, a List Item expanded view
  const [listItems, setListItems] = useState([]);
  const [listItemToEdit, setListItemToEdit] = useState(null);
  const [listItemsModified, setListItemsModified] = useState(false);
  const [existingTags, setExistingTags] = useState([]);

  const fetchListItems = async () => {
    try {
      const allListItems = await u.fetchListItemsByListID(selectedList.listID);
      const allListItemsWithIDs = Object.entries(allListItems).map((e) => ({
        listItemID: e[0],
        ...e[1],
      }));
      setListItems(allListItemsWithIDs);
      if (listItemToEdit) {
        // If we're currently editing a list item, also reload that to reflect any changes
        const listItemToEditUpdated = allListItemsWithIDs.filter(
          (e) => e.listItemID === listItemToEdit.listItemID
        )[0];
        setListItemToEdit(listItemToEditUpdated);
      }
    } catch {
      // Handle error fetching list items
    }

    if (listItemsModified) {
      setListItemsModified(false);
    }
  };

  const fetchTags = async () => {
    console.log('fetchTags in MainArea called');
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
  }, [selectedList, listItemsModified]);

  const handleEditListItem = (listItem) => {
    setListItemToEdit(listItem);
  };

  const handleCloseEditPane = () => {
    setListItemToEdit(null);
  };

  const updateListItem = async (listItemID, field, value) => {
    // Function that can update name, tags, startTime and endTime for a list item object on FB
    const { listItemID: unneededListItemID, ...rest } = listItemToEdit;
    const updatedListItem = {
      ...rest,
      [field]: value,
    };
    try {
      const listItemUpdated = await u.patchListItem(
        listItemToEdit.listItemID,
        updatedListItem
      );
      setListItemsModified(true);
    } catch (error) {
      console.error('Failed to update list item:', error);
    }
  };

  return (
    <div className={styles.container}>
      {selectedList ? (
        <Droppable droppableId="main-area">
          {(provided) => (
            <div
              className="MainArea"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              <List
                selectedList={selectedList}
                updateList={updateList}
                userUID={userUID}
                handleEditListItem={handleEditListItem}
                listItems={listItems}
                listItemsModified={listItemsModified}
                setListItemsModified={setListItemsModified}
                existingTags={existingTags}
              />
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      ) : null}
      {listItemToEdit ? (
        <ListItemEditPane
          listItem={listItemToEdit}
          handleCloseEditPane={handleCloseEditPane}
          userUID={userUID}
          updateListItem={updateListItem}
          setListItemsModified={setListItemsModified}
          fetchTags={fetchTags}
          existingTags={existingTags}
        />
      ) : null}
    </div>
  );
}

export default MainArea;
