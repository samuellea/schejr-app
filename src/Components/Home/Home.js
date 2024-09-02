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

  // set Google Calendar API key in gapi
  useEffect(() => {
    console.log('!');
    const accessToken = localStorage.getItem('googleAccessToken');

    if (accessToken) {
      console.log(accessToken);
      console.log(process.env.REACT_APP_GOOGLE_CALENDAR_API_KEY);
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
            console.log('???????');
          })
          .catch((error) => {
            console.log('.......');
            console.error('Error initializing Google API client:', error);
          });
      });
    }
  }, []);

  const addEventToCalendar = () => {
    const startDate = '2025-03-17T00:00:00.000Z';
    const endDate = '2025-03-18T00:00:00.000Z';
    if (!startDate || !endDate) {
      alert('Please select both start and end dates.');
      return;
    }

    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone; // e.g., "America/Los_Angeles"
    // create an object for the event
    const event = {
      summary: 'New Event from Datepicker',
      start: {
        dateTime: startDate,
        timeZone: 'America/Los_Angeles', // Adjust time zone as needed
      },
      end: {
        dateTime: endDate,
        timeZone: 'America/Los_Angeles',
      },
    };
    // insert this event into the google calendar
    gapi.client.calendar.events
      .insert({
        calendarId: 'primary',
        resource: event,
      })
      .then((response) => {
        alert('Event added to Google Calendar!');
        console.log('Event created:', response);
      })
      .catch((error) => {
        console.error('Error adding event:', error);
        console.log(error.result.error);
        console.log(error.headers);
        alert('Failed to add event to Google Calendar.');
      });
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
    console.log(listItem);
    console.log(field);
    console.log(value);
    const updatedListItem = { ...listItem, [field]: value }; // we're spreading in a passed-in listItemID coming in as listItem, not the intended listITem object
    const updatedListItems = [...listItems];
    updatedListItems[indexOfListItemInListItems] = updatedListItem;
    setListItems(updatedListItem);
    // then, remove the listItemID prior to patching the List Item on the db
    console.log(updatedListItem);
    const { listItemID: unneededListItemID, ...rest } = updatedListItem;
    const updatedListItemMinusExplicitID = { ...rest };
    console.log(updatedListItemMinusExplicitID);
    // try {
    //   const listItemUpdated = await u.patchListItem(
    //     unneededListItemID,
    //     updatedListItemMinusExplicitID
    //   );
    //   // setListItemsModified(true);
    // } catch (error) {
    //   console.error('Failed to update list item:', error);
    // }
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
      <button onClick={addEventToCalendar}> Hello</button>
    </DragDropContext>
  );
}

export default Home;
