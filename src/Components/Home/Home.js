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
  const [events, setEvents] = useState([]);
  const [sidebarListSortOn, setSidebarListSortOn] = useState('createdAt');
  const [sidebarListAscending, setSidebarListAscending] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [listAndItemsLoaded, setListAndItemsLoaded] = useState(false);
  const [syncWithGCal, setSyncWithGCal] = useState(false);
  const [selectedListID, setSelectedListID] = useState(null);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [viewMonth, setViewMonth] = useState(new Date());

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

  const createDateAndEvent = async (newEventData) => {
    console.log(newEventData);
    // find list item if in state, or fetch from DB if not
    let parentListItem;
    const listItemInState = listItems.find(
      (e) => e.listItemID === newEventData?.listItemID
    );
    // console.log(listItemInState);
    if (listItemInState) {
      parentListItem = listItemInState;
    } else {
      parentListItem = await u.fetchListItemById(newEventData.listItemID);
    }
    // create new event on db
    const newEventID = await u.createNewEvent(userUID, newEventData);
    // add new event to state (if it should be in state, ie. Planner open ie. if viewMonth is same month as event) - add .eventID key
    const eventMonth = new Date(newEventData.startDateTime).getMonth();
    const eventYear = new Date(newEventData.startDateTime).getFullYear();
    const plannerMonth = viewMonth.getMonth();
    const plannerYear = viewMonth.getFullYear();
    const plannerOpenOnEventYearMonth =
      eventMonth === plannerMonth && eventYear === plannerYear;
    const newEventPlusExplicit = { ...newEventData, eventID: newEventID };
    if (plannerOpenOnEventYearMonth) {
      const updatedEvents = [...(events || []), newEventPlusExplicit];
      setEvents(updatedEvents);
    }
    // add date obj to listItem .dates - with added .eventID key
    const updatedListItem = {
      ...parentListItem,
      dates: [...parentListItem.dates, newEventPlusExplicit],
    };
    // update the list item in state (if in state)
    if (listItemInState) {
      const listItemsMinusUpdated = listItems.filter(
        (e) => e.listItemID !== updatedListItem.listItemID
      );
      const updatedListItems = [...listItemsMinusUpdated, updatedListItem];
      setListItems(updatedListItems);
    }
    // update the list item on db (remove explicit listItemID)
    const { listItemID, ...rest } = updatedListItem;
    const listItemMinusExplicit = { ...rest };
    await u.patchListItem(updatedListItem.listItemID, listItemMinusExplicit);
  };

  const handleEntities = {
    createDateAndEvent,
  };

  const onDragEnd = async (result) => {
    // console.log('onDragEnd!');
    const { destination, source, draggableId, droppableId } = result;
    // console.log('source: ', source);
    // console.log('destination: ', destination);
    // console.log('draggableId: ', draggableId);
    // console.log('droppableId: ', droppableId);
    // Item was dropped outside a droppable area
    if (!destination) {
      console.log('❌ NOT A VALID DROPPABLE AREA');
      return;
    }

    /*

    - Drag ListItem around within List
    source.droppableId.substring(0, 5) === 'list-'
    destination.droppableId.substring(0, 5) === 'list-'

    - Drag ListButton within Sidebar
    source.droppableId === 'sidebar'
    destination.droppableId === 'sidebar'
    draggableId.substring(0,20) === 'draggableListButton-' 

    - Drag ListItem onto a ListButton
    source.droppableId.substring(0,5) === 'list-' 
    destination.droppableId.substring(0,20) === 'droppableListButton-' 

    - Drag ListItem onto Day on Planner
    source.droppableId.substring(0, 5) === 'list-'
    destination.droppableId.substring(0, 8) === 'planner-' 

    - Drag Event around on Planner
    source.droppableId.substring(0, 8) === 'planner-'
    destination.droppableId.substring(0,8) === 'planner-' 

    */

    // dragging a ListItem to the Planner
    if (
      source.droppableId.substring(0, 5) === 'list-' &&
      destination.droppableId.substring(0, 8) === 'planner-'
    ) {
      console.log('📋 MOVE FROM LIST TO PLANNER');
      const listItemID = draggableId; // listItemID
      const targetDate = destination.droppableId.slice(8); // day's date it's been dragged to - convert to 'timeless' ISO UTC date, ie. midnight of that date
      const dateMidnight = new Date(`${targetDate}T00:00:00Z`);
      const isoDateUTC = dateMidnight.toISOString();
      const newEventObj = {
        createdBy: userUID,
        listItemID: listItemID,
        startDateTime: isoDateUTC, // ISO 8601 UTC format
        timeSet: false,
        title: listItems.find((e) => e.listItemID === listItemID).title,
        tags: listItems.find((e) => e.listItemID === listItemID).tags,
      };
      await handleEntities.createDateAndEvent(newEventObj);
      return;
    }

    // dragging an event between days on the Planner
    if (
      source.droppableId.substring(0, 8) === 'planner-' &&
      destination.droppableId.substring(0, 8) === 'planner-'
    ) {
      console.log('📅 MOVE BETWEEN DAYS ON PLANNER');
      const targetDate = destination.droppableId.slice(8);
      const dateMidnight = new Date(`${targetDate}T00:00:00Z`);
      const isoDateUTC = dateMidnight.toISOString();
      const draggedEventID = draggableId;
      // the event obj will ALWAYS be in 'events' state - you can't be DnDing it on the Planner if it's not!
      const eventToUpdate = events.find((e) => e.eventID === draggedEventID);
      const updatedEventObj = {
        ...eventToUpdate,
        startDateTime: isoDateUTC,
      };
      // the listItem obj? That WON'T always be in 'listItems' state. We could be moving an Event linked to a ListItem that's not being rendered in <List />
      // So, get it using 'listItemIDForEvent'
      const listItemIDForEvent = eventToUpdate.listItemID;
      const listItemForEvent = await u.fetchListItemById(listItemIDForEvent);
      const plusExplicitID = {
        ...listItemForEvent,
        listItemID: listItemIDForEvent,
      };
      // await handleEvents('update', updatedEventObj, plusExplicitID);
      return;
    }

    // // ⭐ MOVE TO DIFFERENT LIST
    if (
      source.droppableId.substring(0, 5) === 'list-' &&
      destination.droppableId.substring(0, 20) === 'droppableListButton-'
    ) {
      console.log('⭐ MOVE TO DIFFERENT LIST');
      const sourceListID = source.droppableId.substring(5);
      console.log(sourceListID);
      const destinationListID = destination.droppableId; // id of the List you're moving it to
      console.log(destinationListID);
      // check that not trying to drag a list item to the list it's already on
      if (sourceListID !== destinationListID) {
        const listItemID = draggableId;
        const listItemMoved = listItems.find(
          (e) => e.listItemID === draggableId
        );
        const destinationList = lists.find(
          (e) => e.listID === destinationListID
        );
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
              toast(
                `Moved ${listItemMoved.title} to ${destinationList.title}`,
                {
                  duration: 2000,
                }
              );
              return;
            } catch (error) {
              console.error(error);
            }
          } catch (error) {}
        } catch (error) {}
      }
    }

    // // 🌲 MOVE WITHIN A LIST

    if (
      source.droppableId.substring(0, 5) === 'list-' &&
      destination.droppableId.substring(0, 5) === 'list-'
    ) {
      console.log('🌲 MOVE WITHIN A LIST');
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

    if (
      source.droppableId === 'sidebar' &&
      destination.droppableId === 'sidebar' &&
      draggableId.substring(0, 20) === 'draggableListButton-'
    ) {
      console.log('🥗 CHANGE LIST BUTTON ORDER ON SIDEBAR');
      console.log('source.index: ', source.index);
      // console.log(lists);
      const objToMove = lists[source.index];
      const listsMinusMoved = [...lists];
      listsMinusMoved.splice(source.index, 1);
      listsMinusMoved.splice(destination.index, 0, objToMove);
      // console.log(listsMinusMoved.length);
      // listsMinusMoved.forEach((e) => console.log(e));
      // console.log(listsObjectMoved);
      const updatedLists = listsMinusMoved.map((e, i) => ({
        ...e,
        sidebarIndex: i,
      }));
      setLists(updatedLists);
      // then, need to update all other /lists objects' .sidebarIndex values accordingly - both in STATE and on DB!
      await u.patchMultipleLists(updatedLists);
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
    const getAndSetUserSyncState = async () => {
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

    getAndSetUserSyncState();
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

  /*
 action, source, newData

 handleEntities.create.listItem()
 handleEntities.create.event()

 handleEntities.update.listItem()
 handleEntities.update.event()

 handleEntities.delete.listItem()
 handleEntities.delete.event()
 
  */

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const handleSelectListButton = (listID) => {
    // setListAndItemsLoaded(false);
    setSelectedListID(listID);
  };

  const handleDeleteList = async (listID) => {
    const listsMinusDeleted = lists.filter((e) => e.listID !== listID);
    setLists(listsMinusDeleted);
    try {
      await u.deleteListByID(listID);

      const childListItems = listItems.filter((e) => e.parentID === listID);

      // also delete any listItems with .parentID === listID on db
      await u.deleteListItemsWithParentID(listID, childListItems);
      // AND in state
      const listItemsMinusDeletedChildren = listItems.filter(
        (e) => e.parentID !== listID
      );
      setListItems(listItemsMinusDeletedChildren);
      // AND delete any /events objects associated with the listItems we've just deleted for this this deleted List
      const childEvents = listItems
        .map((listItem) => listItem.dates)
        .filter((dates) => Array.isArray(dates) && dates.length > 0)
        .flat();
      // await handleEvents('deleteAll', childEvents);
      // AND delete any Gcal events for those delete child listItems!
      const deletedListItemIDs = childListItems.map((e) => e.listItemID);

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
          // updateListItem={updateListItem}
          handleEntities={handleEntities}
          userUID={userUID}
          listItems={listItems}
          setListItems={setListItems}
          listAndItemsLoaded={listAndItemsLoaded}
          setListAndItemsLoaded={setListAndItemsLoaded}
          syncWithGCal={syncWithGCal}
          handleSetSyncWithGCal={handleSetSyncWithGCal}
          events={events}
          setEvents={setEvents}
          viewMonth={viewMonth}
          setViewMonth={setViewMonth}
          // handleEvents={handleEvents}
          // handleOtherEventFields={handleOtherEventFields}
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
