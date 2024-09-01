import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MainArea from '../MainArea/MainArea';
import styles from './Home.module.css';
import Sidebar from '../Sidebar/Sidebar';
import TopBar from '../TopBar/TopBar';
import * as u from '../../utils';
import * as h from '../../helpers';
import { DragDropContext } from '@hello-pangea/dnd'; // Updated import
import toast, { Toaster } from 'react-hot-toast';

function Home() {
  const [listsModified, setListsModified] = useState(false);
  const [lists, setLists] = useState([]);
  const [listItems, setListItems] = useState([]);
  const [selectedListID, setSelectedListID] = useState(null);
  const [sidebarListSortOn, setSidebarListSortOn] = useState('createdAt');
  const [sidebarListAscending, setSidebarListAscending] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [listItemToEdit, setListItemToEdit] = useState(null);
  const [listItemsModified, setListItemsModified] = useState(false);
  const [listAndItemsLoaded, setListAndItemsLoaded] = useState(false);

  const navigate = useNavigate();
  const userUID = localStorage.getItem('firebaseID');
  const displayName = localStorage.getItem('displayName');

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      // Item was dropped outside a droppable area

      return;
    }

    // ⭐ MOVE TO DIFFERENT LIST
    if (
      destination.droppableId !== 'list' &&
      destination.droppableId !== 'main-area'
    ) {
      const listItemID = draggableId;
      const destinationListID = destination.droppableId; // id of the List you're moving it to
      const listItemMoved = listItems.find((e) => e.listItemID === draggableId);
      const destinationList = lists.find((e) => e.listID === destinationListID);

      // Remove item being moved and reset the .manualOrders of all remaning items on the list it's being moved FROM
      const newMOrders = h.updatedManualOrdersOnSourceList(
        listItems,
        listItemID
      );

      // update listItems in state
      setListItems(newMOrders);

      // then set .manualOrder on item being moved to new list as the HIGHEST on the destination list -
      // fetch the highest manual order value present on this List
      try {
        const maxManualOrderOnDestinationList =
          await u.getMaxManualOrderByParentID(destinationListID);
        const updates = {
          parentID: destinationListID,
          manualOrder: maxManualOrderOnDestinationList + 1,
        };

        try {
          // 🌐 update that item being moved accordingly
          const updatedListItem = await u.patchListItem(listItemID, updates);

          // now update remaining list items on db
          try {
            // 🌐
            const multipleListItemsPatched = await u.patchMultipleListItems(
              newMOrders
            );
            toast(`Moved ${listItemMoved.title} to ${destinationList.title}`, {
              duration: 2000,
            });
            // setListItemsModified(true);
          } catch (error) {
            console.error(error);
            // setListItemsModified(true);
          }
        } catch (error) {}
      } catch (error) {}
    }

    // ⭐ MOVE WITHIN A LIST
    if (destination.droppableId === 'list') {
      const listItemID = draggableId;
      const startIndex = source.index;
      const destinationIndex = destination.index;

      const { newMOrders, onlyChanged } = h.updatedManualOrders(
        listItems,
        startIndex,
        destinationIndex
      );
      console.log(onlyChanged);

      // update listItems in state with new .manualOrder values
      setListItems(newMOrders);

      try {
        // 🌐 then update database
        const multipleListItemsPatched = await u.patchMultipleListItems(
          onlyChanged
        );
        // setListItemsModified(true);
      } catch (error) {
        console.error(error);
        // setListItemsModified(true);
      }
    }
  };

  useEffect(() => {
    const expires = localStorage.getItem('expires');
    const currentTime = Date.now();
    const timeUntilExpiration = expires - currentTime;
    if (timeUntilExpiration <= 0) {
      // Token is already expired, log out immediately
      handleLogout();
    } else {
      // Set a timeout to log out the user when the token expires
      const logoutTimer = setTimeout(() => {
        handleLogout();
      }, timeUntilExpiration);
      // Clean up the timer if the component unmounts
      return () => clearTimeout(logoutTimer);
    }
  }, []);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const allUserLists = await u.fetchAllUserLists(userUID);
        const allUserListsWithIDs = Object.entries(allUserLists).map((e) => ({
          listID: e[0],
          ...e[1],
        }));
        setLists(allUserListsWithIDs);
      } catch {
        // Handle error fetching lists
      }

      if (listsModified) {
        // Reset state whenever setListsModified(true) is called
        setListsModified(false);
      }
    };
    fetchLists();
  }, [listsModified]);

  const timeoutIdRef = useRef(null);

  // useEffect(() => {
  //   autoSave();
  // }, [lists]);

  // const autoSave = () => {
  //   if (timeoutIdRef.current) {
  //     clearTimeout(timeoutIdRef.current); // Step 3: Clear any existing timeout
  //   }

  //   timeoutIdRef.current = setTimeout(() => {
  //     if (selectedListID) {
  //       const selectedListObj = lists.filter(
  //         (e) => e.listID === selectedListID
  //       )[0];
  //       const { createdAt, createdBy, title } = selectedListObj;
  //       const updatedListData = {
  //         createdAt,
  //         createdBy,
  //         title, // ADD OTHER FIELDS WHEN IMPLEMENTED! 🚨🚨🚨
  //       };

  //       u.patchList(selectedListID, updatedListData);
  //     }
  //   }, 1000); // Set a new timeout for 2 seconds
  // };

  const handleLogout = () => {
    // Perform your logout logic here
    // Clear any user-related state or storage
    // Redirect to the login page
    localStorage.removeItem('email');
    localStorage.removeItem('firebaseID');
    localStorage.removeItem('expires');
    navigate('/login');
  };

  // Function which updates the list object (by id) in lists state - a separate, timed function will then update this list object on firebase
  const updateList = async (listID, field, value) => {
    console.log(value);
    let newValue = value;
    if (field === 'title' && value === '') newValue = 'Untitled';
    const updatedListObj = {
      ...lists.filter((e) => e.listID === listID)[0],
      [field]: newValue,
    };
    const listsMinusUpdated = lists.filter((e) => e.listID !== listID);
    const listsPlusUpdated = [...listsMinusUpdated, updatedListObj];
    // set updated List in state
    setLists(listsPlusUpdated);
    const { createdAt, createdBy, title } = updatedListObj;
    // now update the List obj on db
    const updatedListData = {
      createdAt,
      createdBy,
      title, // ADD OTHER FIELDS WHEN IMPLEMENTED! 🚨🚨🚨
    };

    try {
      await u.patchList(selectedListID, updatedListData);
    } catch (error) {
      console.log('Error updating List');
    }
  };

  const updateListItem = async (listItem, field, value) => {
    // update the List Item in state first
    const indexOfListItemInListItems = listItems.findIndex(
      (item) => item.listItemID === listItem.listItemID
    );
    const updatedListItem = { ...listItem, [field]: value };
    const updatedListItems = [...listItems];
    updatedListItems[indexOfListItemInListItems] = updatedListItem;
    setListItems(updatedListItems);
    // then, remove the listItemID prior to patching the List Item on the db
    const { listItemID: unneededListItemID, ...rest } = updatedListItem;
    const updatedListItemMinusExplicitID = { ...rest };
    try {
      const listItemUpdated = await u.patchListItem(
        unneededListItemID,
        updatedListItemMinusExplicitID
      );
      // setListItemsModified(true);
    } catch (error) {
      console.error('Failed to update list item:', error);
    }
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const handleSelectListButton = (listID) => {
    setListAndItemsLoaded(false);
    setSelectedListID(listID);
  };

  const handleDeleteList = async (listID) => {
    const listsMinusDeleted = lists.filter((e) => e.listID !== listID);
    setLists(listsMinusDeleted);
    try {
      await u.deleteListByID(listID);
    } catch (error) {
      console.error('Failed to delete list:', error);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className={styles.container}>
        <TopBar toggleSidebar={toggleSidebar} />
        <MainArea
          showSidebar={showSidebar}
          selectedList={lists.find((e) => e.listID === selectedListID)}
          updateList={updateList}
          updateListItem={updateListItem}
          userUID={userUID}
          listItemToEdit={listItemToEdit}
          setListItemToEdit={setListItemToEdit}
          listItems={listItems}
          setListItems={setListItems}
          listItemsModified={listItemsModified}
          setListItemsModified={setListItemsModified}
          listAndItemsLoaded={listAndItemsLoaded}
          setListAndItemsLoaded={setListAndItemsLoaded}
        />
        <Sidebar
          userUID={userUID}
          displayName={displayName}
          sortedLists={h.sortByProperty(
            lists,
            sidebarListSortOn,
            sidebarListAscending
          )}
          selectedListID={selectedListID}
          setSelectedListID={setSelectedListID}
          setListsModified={setListsModified}
          toggleSidebar={toggleSidebar}
          showSidebar={showSidebar}
          handleSelectListButton={handleSelectListButton}
          handleDeleteList={handleDeleteList}
        />
      </div>
      <Toaster />
    </DragDropContext>
  );
}

export default Home;
