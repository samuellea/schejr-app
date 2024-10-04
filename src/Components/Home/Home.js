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
  const [plannerRange, setPlannerRange] = useState({ start: null, end: null });
  const [modalBackground, setModalBackground] = useState(false);

  const navigate = useNavigate();
  const userUID = localStorage.getItem('firebaseID');
  const displayName = localStorage.getItem('displayName');

  const updateList = async (list, newListValues) => {
    console.log(list);
    const { listID: unneededListID, ...rest } = list;
    const updatedListNoListID = { ...rest, ...newListValues };
    try {
      // update List obj on db, removing .listID first
      await u.patchList(userUID, list.listID, updatedListNoListID);
      // set updated List in state, keeping .listID
      const updatedListWithListID = { ...list, ...newListValues };
      const listsMinusUpdated = lists.filter((e) => e.listID !== list.listID);
      const listsPlusUpdated = [...listsMinusUpdated, updatedListWithListID];
      setLists(listsPlusUpdated);
    } catch (error) {}
  };

  const getRelatedListItem = async (listItemID) => {
    let listItem;
    const listItemInState = listItems.find((e) => e.listItemID === listItemID);
    // console.log(listItemInState);
    if (listItemInState) {
      listItem = listItemInState;
    } else {
      listItem = await u.fetchListItemById(userUID, listItemID);
    }
    return { obj: listItem, inState: listItemInState };
  };

  const getRelatedEvent = async (eventID) => {
    let relatedEvent;
    const eventInState = events.find((e) => e.eventID === eventID);
    // console.log(eventInState);
    if (eventInState) {
      relatedEvent = eventInState;
    } else {
      relatedEvent = await u.fetchEventByID(userUID, eventID);
    }
    return { obj: relatedEvent, inState: eventInState };
  };

  const getRelatedEvents = async (listItemID) => {
    // return ids of all events with this listItemID
    const relatedEventsForListItem = await u.fetchUserEventsByListItemID(
      userUID,
      listItemID
    );
    return { arr: relatedEventsForListItem };
  };

  const createEventAndDate = async (newData) => {
    // console.log(newData);
    // 🙏 find list item if in state, or fetch from DB if not
    const relatedListItem = await getRelatedListItem(newData.listItemID);
    // create new event on db
    const newEventID = await u.createNewEvent(userUID, newData);
    // add new event to state (if it should be in state, ie. Planner open ie. if viewMonth is same month as event) - add .eventID key
    const eventDate = new Date(newData.startDateTime);
    const eventTimeUTC = eventDate.getTime(); // UTC time of eventDate
    const startTimeUTC = plannerRange.start.getTime(); // UTC time of .start
    const endTimeUTC = plannerRange.end.getTime(); // UTC time of .end
    const eventIsWithinRange =
      eventTimeUTC >= startTimeUTC && eventTimeUTC <= endTimeUTC;
    const newEventPlusExplicit = { ...newData, eventID: newEventID };
    if (eventIsWithinRange) {
      const updatedEvents = [...(events || []), newEventPlusExplicit];
      setEvents(updatedEvents);
    }
    // add date obj to listItem .dates - with added .eventID key
    const updatedListItem = {
      ...relatedListItem.obj,
      dates: [...(relatedListItem.obj.dates || []), newEventPlusExplicit],
    };
    // update the list item in state (if in state)
    if (relatedListItem.inState) {
      const listItemsMinusUpdated = listItems.filter(
        (e) => e.listItemID !== updatedListItem.listItemID
      );
      const updatedListItems = [...listItemsMinusUpdated, updatedListItem];
      setListItems(updatedListItems);
    }
    // update the list item on db (remove explicit listItemID)
    const { listItemID, ...rest } = updatedListItem;
    const listItemMinusExplicit = { ...rest };
    await u.patchListItem(
      userUID,
      updatedListItem.listItemID,
      listItemMinusExplicit
    );
  };

  /* should handle changes to:
    - listItem.title                            ListItem.js, ListItemEditPane.js
    - listItem.tags                             ListItemEditPane.js
    - listItem.dates > :date .startDateTime     ListItemEditPane.js > DateSelector.js
    - event.title                               EventEditPane.js
    - event.tags                                EventEditPane.js
    - event.startDateTime                       onDragEnd, EventEditPane.js > EventDateSelector.js
     */
  const updateEventAndDates = async (fields, data) => {
    // ['startDateTime', 'tags', 'title'] or ['startDateTime'] or ['tags'] or ['title']
    // data can either be an updated Event or and updated listItem Date - keys identical, except Date has .eventID
    const relatedListItem = await getRelatedListItem(data.listItemID); // .obj + .inState
    let updatedListItem = { ...relatedListItem.obj };

    if (fields.includes('tags') || fields.includes('title')) {
      /* if field includes 'tags' AND/OR 'title', update .tags/.title on ALL the .dates objs AND on the ListItem key itself */
      // uupdate the listItem .dates objs
      const updatedDates =
        relatedListItem.obj.dates?.map((e) => {
          const updatedDate = {
            ...e,
            title: data.title,
            tags: data.tags ? data.tags : [],
          };
          return updatedDate;
        }) || [];
      updatedListItem.dates = updatedDates;
      // Update the main listItem itself
      updatedListItem.title = data.title;
      updatedListItem.tags = data.tags ? data.tags : [];
    }

    if (fields.includes('startDateTime')) {
      /* if field === 'startDateTime', update .startDateTime on the .dates object which matches the eventID */
      // update the ListItem to change corresp. date obj in .dates
      const updatedDateObj = updatedListItem.dates.find(
        (e) => e.eventID === data.eventID
      );
      updatedDateObj.startDateTime = data.startDateTime;
      updatedDateObj.timeSet = data.timeSet;
      const listItemDatesMinusUpdated = updatedListItem.dates.filter(
        (e) => e.eventID !== data.eventID
      );
      updatedListItem = {
        ...updatedListItem,
        dates: [...listItemDatesMinusUpdated, updatedDateObj],
      };
    }

    // set updatedListItem in 'listItems' state (if in there) (inc. .listItemID)
    if (relatedListItem.inState) {
      const listItemsMinusUpdated = listItems.filter(
        (e) => e.listItemID !== updatedListItem.listItemID
      );
      const updatedListItems = [
        ...(listItemsMinusUpdated || []),
        updatedListItem,
      ];
      setListItems(updatedListItems);
    }
    // remove .listItemID before sending listItem obj to DB /listItems
    const { listItemID, ...restUpLi } = updatedListItem;
    const updatedListItemNoID = { ...restUpLi };
    await u.patchListItem(
      userUID,
      updatedListItem.listItemID,
      updatedListItemNoID
    );

    // update the Event / Events
    /*
      get all events with provided .listItemID
      if fields includes 'tags' and/or 'title', update 'tags' and/or 'title' on ALL of these events
      if fields includes 'startDateTime', update 'startDateTime' and 'timeSet' on ONLY the event whose .eventID matches data.eventID (if we are updating 'startDateTime', we must ALWAYS provide data.eventID - the .eventID of the corresp. event obj)
      */
    const relatedEvents = await getRelatedEvents(data.listItemID); // .arr (NOT .inState)
    let updatedEvents = [...relatedEvents.arr];

    if (fields.includes('tags') || fields.includes('title')) {
      /* else if field === 'title'/'tags', update .title/.tags on ALL Event objects with .listItemID === relatedListItem.listItemID */
      updatedEvents = relatedEvents.arr.map((e) => ({
        ...e,
        title: data.title,
        tags: data.tags ? data.tags : [],
      }));
    }

    if (fields.includes('startDateTime')) {
      /* if field === 'startDateTime', update .startDateTime on the Event object which matches the eventID */
      const relatedEvent = updatedEvents.find(
        (e) => e.eventID === data.eventID
      );
      const updatedEvent = { ...relatedEvent };
      updatedEvent.startDateTime = data.startDateTime;
      updatedEvent.timeSet = data.timeSet;
      const updatedEventsMinusRelated = updatedEvents.filter(
        (e) => e.eventID !== data.eventID
      );
      updatedEvents = [...updatedEventsMinusRelated, updatedEvent];
    }

    // update events in state (if the updated events ARE ACTUALLY IN state...)
    const updatedEventsInState = updatedEvents.filter((e) =>
      events.some((f) => f.eventID === e.eventID)
    );

    if (updatedEventsInState.length) {
      const eventsMinusUpdated = events.filter(
        (event) =>
          !updatedEventsInState.some((upEv) => upEv.eventID === event.eventID)
      );
      const updatedEvents = [
        ...(eventsMinusUpdated || []),
        ...updatedEventsInState,
      ];
      setEvents(updatedEvents);
    }
    // // remove .eventID before sending event obj to DB /events
    const updatedEventIDs = updatedEvents.map((upEv) => upEv.eventID);
    const updatedEventsNoID = updatedEvents.map(
      ({ eventID, ...restUpEv }) => restUpEv
    );

    await u.patchMultipleEventsByIDs(
      userUID,
      updatedEventIDs,
      updatedEventsNoID
    );
  };

  // data = (Event.js?) Event obj, (DateSelector.js?) LI .dates date obj
  const deleteEventAndDate = async (data) => {
    const relatedListItem = await getRelatedListItem(data.listItemID); // .obj + .inState
    const relatedEvent = await getRelatedEvent(data.eventID); // .obj + .inState
    const listItemDatesMinusDeleted = relatedListItem.obj.dates.filter(
      (e) => e.eventID !== data.eventID
    );
    const updatedListItem = {
      ...relatedListItem.obj,
      dates: listItemDatesMinusDeleted,
    };
    console.log(updatedListItem);
    await u.patchListItem(userUID, data.listItemID, updatedListItem);
    await u.deleteEventByID(userUID, data.eventID);
    if (relatedListItem.inState) {
      const listItemsMinusUpdated = listItems.filter(
        (e) => e.listItemID !== data.listItemID
      );
      const updatedListItems = [...listItemsMinusUpdated, updatedListItem];
      setListItems(updatedListItems);
    }
    if (relatedEvent.inState) {
      const eventsMinusDeleted = events.filter(
        (e) => e.eventID !== data.eventID
      );
      console.log(eventsMinusDeleted);
      setEvents(eventsMinusDeleted);
    }
  };

  const deleteTagFromEntities = async (tagID) => {
    // remove the tag from any ListItems (+ their .dates) / Events that have it in
    await u.findAndRemoveTagIDFromListItems(userUID, tagID);
    await u.findAndRemoveTagIDFromEvents(userUID, tagID);
    // remove the tag from any ListItems (+ their .dates) / Events that have it, IF they are in state
    const matchingListItemsInState = listItems.filter((e) =>
      e.tags.includes(tagID)
    );
    const matchingEventsInState = events.filter((e) => e.tags.includes(tagID));
    const updatedListItems = matchingListItemsInState.map((listItem) => {
      const updatedTags = (listItem.tags || []).filter((tag) => tag !== tagID);
      // AND ALSO from their .dates objs' .tags arrs
      const updatedDates = (listItem.dates || []).map((date) => ({
        ...date,
        tags: updatedTags,
      }));
      return { ...listItem, tags: updatedTags, dates: updatedDates };
    });
    const updatedEvents = matchingEventsInState.map((event) => {
      const updatedTags = event.tags.filter((tag) => tag !== tagID);
      return { ...event, tags: updatedTags };
    });
    setListItems(updatedListItems);
    setEvents(updatedEvents);
  };

  const deleteListItemAndEvents = async (userUID, listItemID) => {
    const listItemsMinusDeleted = listItems.filter(
      (e) => e.listItemID !== listItemID
    );
    // update listItems state to be minus the deleted listItem AND with tidied .manualORders
    const updatedManualOrders = listItemsMinusDeleted.map((e, i) => ({
      ...e,
      manualOrder: i + 1,
    }));
    setListItems(updatedManualOrders);
    const eventsMinusDeleted = events.filter(
      (e) => e.listItemID !== listItemID
    );
    setEvents(eventsMinusDeleted);
    await u.deleteListItemByID(userUID, listItemID);
    await u.deleteEventsByListItemID(userUID, listItemID);
  };

  const deleteListAndRelated = async (listID) => {
    await u.deleteListByID(userUID, listID);
    const updatedLists = lists.filter((e) => e.listID !== listID);
    setLists(updatedLists);
    const relatedListItems = await u.fetchListItemsByListID(userUID, listID);
    // make a version of deleteEventsByListItemID, but deleteListItemsByListID
    // call that here, to remove listItems from DB
    await u.deleteListItemsByListID(userUID, listID);
    // use ListID to setListItems with only listItems whose .parentID !== listID
    const listItemsMinusDeleted = listItems.filter(
      (e) => e.parentID !== listID
    );
    setListItems(listItemsMinusDeleted);
    console.log(relatedListItems);
    const relatedEventIDs = relatedListItems
      .map((item) => (item.dates ? item.dates.map((date) => date.eventID) : [])) // Maps to an array of eventIDs, may contain undefined
      .reduce((acc, val) => acc.concat(val), []); // Flattens the array
    console.log(relatedEventIDs);
    await u.deleteEventsByEventIDs(userUID, relatedEventIDs);
    const eventsMinusDeleted = events.filter(
      (e) => !relatedEventIDs.includes(e.eventID)
    );
    setEvents(eventsMinusDeleted);
  };

  const patchListItemNotes = async (updatedListItem) => {
    // DB
    const { listItemID, ...restUpLi } = updatedListItem;
    const updatedListItemNoID = { ...restUpLi };
    await u.patchListItem(
      userUID,
      updatedListItem.listItemID,
      updatedListItemNoID
    );
    // state
    const listItemsMinusUpdated = listItems.filter(
      (e) => e.listItemID !== updatedListItem.listItemID
    );
    const updatedListItems = [
      ...(listItemsMinusUpdated || []),
      updatedListItem,
    ];
    setListItems(updatedListItems);
  };

  const handleEntities = {
    createEventAndDate,
    updateEventAndDates,
    deleteEventAndDate,
    deleteTagFromEntities,
    deleteListItemAndEvents,
    deleteListAndRelated,
    patchListItemNotes,
  };

  const onDragEnd = async (result) => {
    // console.log('onDragEnd!');
    const { destination, source, draggableId, droppableId } = result;
    console.log('source: ', source);
    console.log('destination: ', destination);
    // console.log('draggableId: ', draggableId);
    // console.log('droppableId: ', droppableId);

    if (
      source.droppableId.substring(0, 8) === 'planner-' &&
      destination.droppableId.substring(0, 20) === 'droppableListButton-'
    ) {
      toast(`❌ Can't move Events onto Lists`, {
        duration: 2000,
      });
    }
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
        tags: listItems.find((e) => e.listItemID === listItemID).tags || [],
      };
      await handleEntities.createEventAndDate(newEventObj);
      return;
    }

    // dragging an event between days on the Planner
    if (
      source.droppableId.substring(0, 8) === 'planner-' &&
      destination.droppableId.substring(0, 8) === 'planner-'
    ) {
      console.log('📅 MOVE BETWEEN DAYS ON PLANNER');
      const draggedEventID = draggableId;
      const eventToUpdate = events.find((e) => e.eventID === draggedEventID);
      const targetDate = destination.droppableId.slice(8);
      let dateTimeAfterMove;
      if (eventToUpdate.timeSet) {
        const timePart = eventToUpdate.startDateTime.substring(10, 24);
        dateTimeAfterMove = new Date(`${targetDate}${timePart}`);
      } else {
        dateTimeAfterMove = new Date(`${targetDate}T00:00:00Z`);
      }
      const isoDateUTC = dateTimeAfterMove.toISOString();
      // the event obj will ALWAYS be in 'events' state - you can't be DnDing it on the Planner if it's not!
      const updatedEventObj = {
        ...eventToUpdate,
        startDateTime: isoDateUTC,
      };
      // the listItem obj? That WON'T always be in 'listItems' state. We could be moving an Event linked to a ListItem that's not being rendered in <List />
      // So, get it using 'listItemIDForEvent'
      const listItemIDForEvent = eventToUpdate.listItemID;
      const listItemForEvent = await u.fetchListItemById(
        userUID,
        listItemIDForEvent
      );
      await handleEntities.updateEventAndDates(
        ['startDateTime'],
        updatedEventObj
      );
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
      const destinationListID = destination.droppableId.substring(20); // id of the List you're moving it to
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
            await u.getMaxManualOrderByParentID(userUID, destinationListID);
          const updates = {
            parentID: destinationListID,
            manualOrder: maxManualOrderOnDestinationList + 1,
          };
          try {
            // 🌐 update that item being moved accordingly
            const updatedListItem = await u.patchListItem(
              userUID,
              listItemID,
              updates
            );
            // now update remaining list items on db
            try {
              // 🌐
              const multipleListItemsPatched = await u.patchMultipleListItems(
                userUID,
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
            return await u.patchList(userUID, selectedList.listID, updatedList);
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
            userUID,
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
      await u.patchMultipleLists(userUID, updatedLists);
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

  const syncStateFetched = useRef(false);

  useEffect(() => {
    const getAndSetUserSyncState = async () => {
      try {
        if (syncStateFetched.current) return; // Prevent multiple runs
        syncStateFetched.current = true; // Set to true after the first run

        const userSyncStateObj = await u.fetchUserSyncState(userUID);
        if (Object.keys(userSyncStateObj).length === 0) {
          // Check if object already exists before creating
          const syncState = await u.fetchUserSyncState(userUID);
          if (Object.keys(syncState).length === 0) {
            await u.createSyncStateByUserID(userUID, false); // Create the object only once
            setSyncWithGCal(false);
          }
        } else {
          const userSyncState = Object.values(userSyncStateObj)[0].state;
          setSyncWithGCal(userSyncState);
        }
      } catch (error) {
        console.error(error);
      }
    };

    getAndSetUserSyncState();
  }, [userUID]);

  useEffect(() => {
    // const userUID = localStorage.getItem('firebaseID');
    console.log(userUID);
    //
    const fetchLists = async () => {
      try {
        console.log('?');
        const allUserLists = await u.fetchAllUserLists(userUID);
        console.log(allUserLists);
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
        // u.addAllListItemsToGCal(listItems);
      } else {
        // delete all Google Calendar events with privateExtendedProperty: 'createdBy=schejr-app'
        // u.removeAllListItemsFromGCal();
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

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const handleSelectListButton = (listID) => {
    // setListAndItemsLoaded(false);
    setSelectedListID(listID);
  };

  // const handleDeleteList = async (listID) => {
  //   const listsMinusDeleted = lists.filter((e) => e.listID !== listID);
  //   setLists(listsMinusDeleted);
  //   try {
  //     await u.deleteListByID(listID);

  //     const childListItems = listItems.filter((e) => e.parentID === listID);

  //     // also delete any listItems with .parentID === listID on db
  //     await u.deleteListItemsWithParentID(listID, childListItems);
  //     // AND in state
  //     const listItemsMinusDeletedChildren = listItems.filter(
  //       (e) => e.parentID !== listID
  //     );
  //     setListItems(listItemsMinusDeletedChildren);
  //     // AND delete any /events objects associated with the listItems we've just deleted for this this deleted List
  //     const childEvents = listItems
  //       .map((listItem) => listItem.dates)
  //       .filter((dates) => Array.isArray(dates) && dates.length > 0)
  //       .flat();
  //     // await handleEvents('deleteAll', childEvents);
  //     // AND delete any Gcal events for those delete child listItems!
  //     const deletedListItemIDs = childListItems.map((e) => e.listItemID);

  //     await u.removeMultipleGCalEventsByListItemIDs(deletedListItemIDs);
  //   } catch (error) {
  //     console.error('Failed to delete list:', error);
  //   }
  // };

  const handleSetSyncWithGCal = () => {
    setSyncWithGCal((prev) => !prev);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className={styles.wrapper}>
        <TopBar
          toggleSidebar={toggleSidebar}
          showSidebar={showSidebar}
          displayName={displayName}
        />
        <div className={styles.container}>
          {showSidebar ? (
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
              // handleDeleteList={handleDeleteList}
              handleLogout={handleLogout}
              deleteListAndRelated={deleteListAndRelated}
            />
          ) : null}
          <MainArea
            userUID={userUID}
            toggleSidebar={toggleSidebar}
            showSidebar={showSidebar}
            selectedList={lists?.find((e) => e.listID === selectedListID)}
            updateList={updateList}
            // updateListItem={updateListItem}
            handleEntities={handleEntities}
            listItems={listItems}
            setListItems={setListItems}
            listAndItemsLoaded={listAndItemsLoaded}
            setListAndItemsLoaded={setListAndItemsLoaded}
            syncWithGCal={syncWithGCal}
            handleSetSyncWithGCal={handleSetSyncWithGCal}
            events={events}
            setEvents={setEvents}
            plannerRange={plannerRange}
            setPlannerRange={setPlannerRange}
            setModalBackground={setModalBackground}
            // handleEvents={handleEvents}
            // handleOtherEventFields={handleOtherEventFields}
          />
        </div>
      </div>
      <Toaster />
    </DragDropContext>
  );
}

export default Home;
