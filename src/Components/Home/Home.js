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
import { gapi } from 'gapi-script';

function Home() {
  const [lists, setLists] = useState([]);
  const [listItems, setListItems] = useState([]);
  const [sidebarListSortOn, setSidebarListSortOn] = useState('createdAt');
  const [sidebarListAscending, setSidebarListAscending] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [listAndItemsLoaded, setListAndItemsLoaded] = useState(false);
  const [syncWithGCal, setSyncWithGCal] = useState(false);
  const [selectedListID, setSelectedListID] = useState(null);
  const [isFirstRender, setIsFirstRender] = useState(true);

  const navigate = useNavigate();
  const userUID = localStorage.getItem('firebaseID');
  const displayName = localStorage.getItem('displayName');

  const updateList = async (list, newListValues) => {
    const { listID: unneededListID, ...rest } = list;
    const updatedListNoListID = { ...rest, ...newListValues };
    try {
      // update List obj on db, removing .listID first
      await u.patchList(list.listID, updatedListNoListID);
      // set updated List in state, keeping .listID
      const updatedListWithListID = { ...list, ...newListValues };
      const listsMinusUpdated = lists.filter((e) => e.listID !== list.listID);
      const listsPlusUpdated = [...listsMinusUpdated, updatedListWithListID];
      setLists(listsPlusUpdated);
    } catch (error) {}
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      // Item was dropped outside a droppable area

      return;
    }

    // ⭐ MOVE TO DIFFERENT LIST
    if (
      destination.droppableId.substring(0, 4) !== 'list' &&
      destination.droppableId !== 'main-area'
    ) {
      const listItemID = draggableId;
      const destinationListID = destination.droppableId; // id of the List you're moving it to
      const listItemMoved = listItems.find((e) => e.listItemID === draggableId);
      const destinationList = lists.find((e) => e.listID === destinationListID);

      // Remove item being moved and reset the .manualOrders of all remaning items on the list it's being moved FROM
      // First making sure to re-sort listItems based on manualOrders, so you dont reassign manualOrders based on their index positions
      // which may be determined by other sort options (title, date, tags etc.)
      const listItemsSortedByOriginalManualOrders = h.sortItems(
        listItems,
        'manualOrder',
        'ascending'
      );
      const newMOrders = h.updatedManualOrdersOnSourceList(
        // listItems,
        listItemsSortedByOriginalManualOrders,
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
          parentID: `list-${destinationListID}`,
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
          } catch (error) {
            console.error(error);
          }
        } catch (error) {}
      } catch (error) {}
    }

    // ⭐ MOVE WITHIN A LIST

    if (destination.droppableId.substring(0, 4) === 'list') {
      const listID = destination.droppableId.substring(5);
      const possibleSort = lists.find((e) => e.listID === listID).sortOn;

      const listItemID = draggableId;
      const startIndex = source.index; // NO - if a filter's been applied it SHOULDN'T be this, should be the dragged obj's original .manualOrder value
      const destinationIndex = destination.index;

      // First making sure to re-sort listItems based on manualOrders, so you dont reassign manualOrders based on their index positions
      // which may be determined by other sort options (title, date, tags etc.)

      if (possibleSort !== 'manualOrder') {
        // if a sort is present on the List object, could intervene here -
        // eslint-disable-next-line no-restricted-globals
        const userResponse = confirm('Do you want to remove sorting?');
        // Check the user's response
        if (userResponse) {
          // update list obj in state to have .sortOn = 'manualOrder' and .order = 'ascending'
          const selectedList = lists.find((e) => e.listID === selectedListID);
          const indexOfListInLists = lists.findIndex(
            (e) => e.listID === selectedListID
          );
          const updatedLists = [...lists];
          const updatedList = {
            ...selectedList,
            sortOn: 'manualOrder',
            order: 'ascending',
          };
          updatedLists.splice(indexOfListInLists, 1, updatedList);
          setLists(updatedLists);
          // then reset listItems in state to be sorted in that way
          const listItemsSortedByOriginalManualOrders = h.sortItems(
            listItems,
            'manualOrder',
            'ascending'
          );
          setListItems(listItemsSortedByOriginalManualOrders);
          // then update the list obj on the database with these reset .sortOn and .order values. AND STOP THERE!
          try {
            // 🌐 then update List on database with default sortOn and order
            const { listID: unneededListID, ...rest } = selectedList;
            const updatedList = {
              ...rest,
              sortOn: 'manualOrder',
              order: 'ascending',
            };
            // setLists with updated List object on front-end!
            return await u.patchList(selectedList.listID, updatedList);
          } catch (error) {
            console.error(error);
          }
        } else {
          return;
        }
      } else {
        // no custom sort is applied, allow dragging and dropping of listItems within a list to change their .manualOrder
        const { newMOrders, onlyChanged } = h.updatedManualOrders(
          listItems,
          startIndex,
          destinationIndex
        );
        // update listItems in state
        setListItems(newMOrders);
        try {
          // 🌐 then update database
          const multipleListItemsPatched = await u.patchMultipleListItems(
            onlyChanged
          );
        } catch (error) {
          console.error(error);
        }
      }
    }
  };

  // set Google Calendar API key in gapi
  useEffect(() => {
    const accessToken = localStorage.getItem('googleAccessToken');

    if (accessToken) {
      //
      //
      // Load the Google API client and set the access token
      gapi.load('client', () => {
        gapi.client
          .init({
            apiKey: process.env.REACT_APP_GOOGLE_CALENDAR_API_KEY, // my api key, removed for security
            discoveryDocs: [
              'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
            ],
          })
          .then((res) => {
            // Set the access token for gapi requests
            gapi.client.setToken({ access_token: accessToken });
            //
          })
          .catch((error) => {
            console.error('Error initializing Google API client:', error);
          });
      });
    }
  }, []);

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
    const fetchUserSyncState = async () => {
      try {
        const userSyncStateObj = await u.getUserSyncState(userUID);

        if (Object.keys(userSyncStateObj).length === 0) {
          // create a /userSyncStates obj for this user for the first time, and init syncWithGCal with false (default)
          await u.createSyncStateByUserID(userUID, false);
          setSyncWithGCal(false);
        } else {
          // set our home state syncWithGCal value to be the one on that obj
          const userSyncState = Object.values(userSyncStateObj)[0].state;
          setSyncWithGCal(userSyncState);
          return;
        }
      } catch (error) {}
    };

    fetchUserSyncState();
  }, []);

  useEffect(() => {
    //
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
    };
    fetchLists();
  }, []);

  const prevSliceRef = useRef();

  useEffect(() => {
    if (isFirstRender) {
      // Set the flag to false after the first render
      setIsFirstRender(false);
      return;
    }
    // Check if the previous slice is different from the current slice
    if (
      prevSliceRef.current !== undefined &&
      prevSliceRef.current !== syncWithGCal
    ) {
      // Your logic that should run only when syncWithGCal changes

      if (syncWithGCal && listItems.length) {
        // add all a user's listItems with dates' dates to their Google Calendar
        u.addAllListItemsToGCal(listItems);
      } else {
        // delete all Google Calendar events with privateExtendedProperty: 'createdBy=schejr-app'
        u.removeAllListItemsFromGCal();
      }
      u.patchSyncStateByUserID(userUID, syncWithGCal);
    }
    // Update the ref to the current slice value after the logic runs
    prevSliceRef.current = syncWithGCal;
  }, [syncWithGCal]);

  const timeoutIdRef = useRef(null);

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

  /*

  const updateList = async (listID, field, value) => {
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
    } catch (error) {}
  };
  
  */

  const updateListItem = async (listItem, field, value) => {
    // update the List Item in state first
    const indexOfListItemInListItems = listItems.findIndex(
      (item) => item.listItemID === listItem.listItemID
    );
    const updatedListItem = { ...listItem, [field]: value }; // we're spreading in a passed-in listItemID coming in as listItem, not the intended listITem object
    console.log(updatedListItem, ' 🚨');

    const updatedListItems = [...listItems];
    updatedListItems[indexOfListItemInListItems] = updatedListItem;
    console.log(updatedListItems);
    setListItems(updatedListItems);
    // then, remove the listItemID prior to patching the List Item on the db
    const { listItemID: unneededListItemID, ...rest } = updatedListItem;
    const updatedListItemMinusExplicitID = { ...rest };
    try {
      const listItemUpdated = await u.patchListItem(
        unneededListItemID,
        updatedListItemMinusExplicitID
      );
      // extra step - now update any changes made to a list item in the edit pane to its corresponding google calendar event if
      // a) it has one (ie. a date has been set for it) AND syncWithGCal is true

      if (syncWithGCal) {
        // if we're giving a listItem a startDate where it didnt have one before...
        if (!listItem.date?.startDate && updatedListItem.date?.startDate) {
          await u.changeListItemOnGCalByIDOrCreate(
            updatedListItem,
            field,
            value
          );
        }
        // whereas if we're removing a listItem's startDate...
        if (listItem.date?.startDate && !updatedListItem.date?.startDate)
          await u.removeGCalEventByListItemID(updatedListItem.listItemID);
      }
      // if we're changing a lisItem's startDate that already has a startDate...
      if (listItem.date?.startDate && updatedListItem.date?.startDate) {
        const startDateChanged =
          listItem.date.startDate !== updatedListItem.date.startDate &&
          updatedListItem.date.startDate !== null;
        if (startDateChanged) {
          await u.changeListItemOnGCalByIDOrCreate(
            updatedListItem,
            field,
            value
          );
        }
      }

      // if we're adding an end date to a lisItem that already has a startDate...
      if (listItem.date?.startDate && updatedListItem.date?.endDate) {
        await u.changeListItemOnGCalByIDOrCreate(updatedListItem, field, value);
      }
    } catch (error) {
      console.error('Failed to update list item:', error);
    }
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const handleSelectListButton = (listID) => {
    console.log(listID);
    // setListAndItemsLoaded(false);
    setSelectedListID(listID);
  };

  const handleDeleteList = async (listID) => {
    const listsMinusDeleted = lists.filter((e) => e.listID !== listID);
    setLists(listsMinusDeleted);
    try {
      await u.deleteListByID(listID);
      const childListItems = listItems.filter(
        (e) => e.parentID === `list-${listID}`
      );
      // also delete any listItems with .parentID === listID on db
      await u.deleteListItemsWithParentID(listID, childListItems);
      // AND in state
      const listItemsMinusDeletedChildren = listItems.filter(
        (e) => e.parentID !== `list-${listID}`
      );
      setListItems(listItemsMinusDeletedChildren);
      // AND delete any Gcal events for those delete child listItems!
      const deletedListItemIDs = childListItems.map((e) => e.listItemID);
      console.log(deletedListItemIDs);
      await u.removeMultipleGCalEventsByListItemIDs(deletedListItemIDs);
    } catch (error) {
      console.error('Failed to delete list:', error);
    }
  };

  const handleSetSyncWithGCal = () => {
    setSyncWithGCal((prev) => !prev);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className={styles.container}>
        <TopBar toggleSidebar={toggleSidebar} />
        <MainArea
          showSidebar={showSidebar}
          selectedList={lists?.find((e) => e.listID === selectedListID)}
          updateList={updateList}
          updateListItem={updateListItem}
          userUID={userUID}
          listItems={listItems}
          setListItems={setListItems}
          listAndItemsLoaded={listAndItemsLoaded}
          setListAndItemsLoaded={setListAndItemsLoaded}
          syncWithGCal={syncWithGCal}
          handleSetSyncWithGCal={handleSetSyncWithGCal}
        />
        <Sidebar
          userUID={userUID}
          displayName={displayName}
          lists={lists}
          setLists={setLists}
          selectedListID={selectedListID}
          setSelectedListID={setSelectedListID}
          toggleSidebar={toggleSidebar}
          showSidebar={showSidebar}
          handleSelectListButton={handleSelectListButton}
          handleDeleteList={handleDeleteList}
          handleLogout={handleLogout}
        />
      </div>
      <Toaster />
    </DragDropContext>
  );
}

export default Home;
