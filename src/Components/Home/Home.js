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
  const [syncWithGCal, setSyncWithGCal] = useState(false);

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

  // set Google Calendar API key in gapi
  useEffect(() => {
    const accessToken = localStorage.getItem('googleAccessToken');

    if (accessToken) {
      // console.log(accessToken);
      // console.log(process.env.REACT_APP_GOOGLE_CALENDAR_API_KEY);
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
            // console.log('???????');
          })
          .catch((error) => {
            console.log('.......');
            console.error('Error initializing Google API client:', error);
          });
      });
    }
  }, []);

  // const addEventToCalendar = () => {
  //   const startDate = '2025-03-20T00:00:00.000Z';
  //   const endDate = '2025-03-23T00:00:00.000Z';
  //   if (!startDate || !endDate) {
  //     alert('Please select both start and end dates.');
  //     return;
  //   }

  //   const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone; // e.g., "America/Los_Angeles"
  //   // create an object for the event
  //   const event = {
  //     summary: 'New Event from Datepicker',
  //     start: {
  //       dateTime: startDate,
  //       timeZone: userTimeZone, // Adjust time zone as needed
  //     },
  //     end: {
  //       dateTime: endDate,
  //       timeZone: userTimeZone,
  //     },
  //   };
  //   // insert this event into the google calendar
  //   gapi.client.calendar.events
  //     .insert({
  //       calendarId: 'primary',
  //       resource: event,
  //     })
  //     .then((response) => {
  //       alert('Event added to Google Calendar!');
  //       console.log('Event created:', response);
  //     })
  //     .catch((error) => {
  //       console.error('Error adding event:', error);
  //       console.log(error.result.error);
  //       console.log(error.headers);
  //       alert('Failed to add event to Google Calendar.');
  //     });
  // };

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
    console.log('fetchUserSyncState useEffect');

    const fetchUserSyncState = async () => {
      try {
        const userSyncStateObj = await u.getUserSyncState(userUID);
        console.log(userSyncStateObj);
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

    console.log('fetchUserSyncState...');
    fetchUserSyncState();
  }, []);

  useEffect(() => {
    // console.log('listsModified useEffect');
    const fetchLists = async () => {
      try {
        const allUserLists = await u.fetchAllUserLists(userUID);
        const allUserListsWithIDs = Object.entries(allUserLists).map((e) => ({
          listID: e[0],
          ...e[1],
        }));
        if (!allUserListsWithIDs.length) {
          // first, check if there is an obj on db /userSyncStates endpoint with userID === our userID
          // if yes, set our home state syncWithGCal value to be the one on that obj
          // if no, create a /userSyncStates obj for this user for the first time
          // user has not lists on the db, and therefore no list items, and therefore nth 2 b synced with gcal yet.
          // so, initialise their 'syncWithGCal' on the db to false.
          // u.createOrPatchSyncStateByUserID(userUID, false);
        }
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

  const prevSliceRef = useRef();

  useEffect(() => {
    // Check if the previous slice is different from the current slice
    if (
      prevSliceRef.current !== undefined &&
      prevSliceRef.current !== syncWithGCal
    ) {
      // Your logic that should run only when syncWithGCal changes
      console.log('syncWithGCal slider clicked');
      console.log(syncWithGCal);
      if (syncWithGCal && listItems.length) {
        console.log(listItems);
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
    } catch (error) {
      console.log('Error updating List');
    }
  };

  const updateListItem = async (listItem, field, value) => {
    console.log('updateListItem');
    // update the List Item in state first
    const indexOfListItemInListItems = listItems.findIndex(
      (item) => item.listItemID === listItem.listItemID
    );
    // console.log(listItem);
    // console.log(field);
    // console.log(value);
    const updatedListItem = { ...listItem, [field]: value }; // we're spreading in a passed-in listItemID coming in as listItem, not the intended listITem object
    console.log(updatedListItem);
    const updatedListItems = [...listItems];
    updatedListItems[indexOfListItemInListItems] = updatedListItem;
    console.log(updatedListItems);
    setListItems(updatedListItems);
    // then, remove the listItemID prior to patching the List Item on the db
    // console.log(updatedListItem);
    const { listItemID: unneededListItemID, ...rest } = updatedListItem;
    const updatedListItemMinusExplicitID = { ...rest };
    try {
      console.log('patchListItem on db...');
      const listItemUpdated = await u.patchListItem(
        unneededListItemID,
        updatedListItemMinusExplicitID
      );
      // extra step - now update any changes made to a list item in the edit pane to its corresponding google calendar event if
      // a) it has one (ie. a date has been set for it) AND syncWithGCal is true
      console.log(syncWithGCal);
      if (syncWithGCal) {
        console.log('about to changeListItemOnGCalByID...');
        await u.changeListItemOnGCalByID(updatedListItem, field, value);
      }
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

  const handleSetSyncWithGCal = () => {
    setSyncWithGCal((prev) => !prev);

    // if (!syncWithGoogleCalendar) {
    //   setSyncWithGoogleCalendar(true);
    // } else {
    //   setSyncWithGoogleCalendar(false);
    // }
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
          syncWithGCal={syncWithGCal}
          handleSetSyncWithGCal={handleSetSyncWithGCal}
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
      {/* <button onClick={addEventToCalendar}> Hello</button> */}
    </DragDropContext>
  );
}

export default Home;
