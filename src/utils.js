import { database } from './index';
import {
  ref,
  get,
  set,
  push,
  query,
  orderByChild,
  equalTo,
  remove,
  update,
  startAt,
  endAt,
} from 'firebase/database';
import { gapi } from 'gapi-script';
import * as h from './helpers';
import { lastDayOfMonth, formatISO } from 'date-fns';
import { toZonedTime, format } from 'date-fns-tz';
import { constant } from 'lodash-es';

export const createNewList = async (userUID, listData) => {
  try {
    // Create a reference to the 'lists' endpoint
    const listsRef = ref(database, `${userUID}/lists`);
    // Generate a new key under the 'lists' endpoint
    const newListRef = push(listsRef);
    // Set the data at the new reference
    await set(newListRef, listData);

    return newListRef.key; // Return the unique ID of the newly created list
  } catch (error) {
    console.error('Error creating new list:', error);
    throw error;
  }
};

export const patchList = async (userUID, listID, newData) => {
  try {
    const listRef = ref(database, `${userUID}/lists/${listID}`);
    await update(listRef, newData);
  } catch (error) {
    console.error('Error updating list:', error);
    throw error;
  }
};

export const patchMultipleLists = async (userUID, updates) => {
  try {
    const updatePromises = updates.map((update) => {
      const { listID: unneededListID, ...rest } = update;
      const updatedList = { ...rest };
      return patchList(userUID, unneededListID, updatedList);
    });
    return await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error updating one or more list db objects:', error);
    return error;
  }
};

// export const deleteMultipleEvents = async (updates) => {
//   try {
//     const updatePromises = updates.map((update) => {
//       const { listID: unneededListID, ...rest } = update;
//       const updatedList = { ...rest };
//       return patchList(unneededListID, updatedList);
//     });
//     return await Promise.all(updatePromises);
//   } catch (error) {
//     console.error('Error updating one or more list db objects:', error);
//     return error;
//   }
// };

export const patchListItem = async (userUID, listItemID, newData) => {
  try {
    const listItemRef = ref(database, `${userUID}/listItems/${listItemID}`);
    await update(listItemRef, newData);
  } catch (error) {
    console.error('Error updating list item:', error);
    throw error;
  }
};

export const patchTag = async (userUID, tagID, newData) => {
  try {
    const tagRef = ref(database, `${userUID}/tags/${tagID}`);
    await update(tagRef, newData);
  } catch (error) {
    console.error('Error updating tag:', error);
    throw error;
  }
};

export const fetchAllUserLists = async (userUID) => {
  console.log(userUID, ' <-- utils.js');
  try {
    // Reference to the 'lists' endpoint
    const listsRef = ref(database, `${userUID}/lists`);
    // Create a query to filter lists where 'createdBy' equals the given userUID
    const userListsQuery = query(
      listsRef,
      orderByChild('createdBy'),
      equalTo(userUID)
    );
    // Get the data from the query
    const snapshot = await get(userListsQuery);
    if (snapshot.exists()) {
      // Data exists; convert snapshot to an object
      const data = snapshot.val();
      console.log(data);
      return data;
    } else {
      return {};
    }
  } catch (error) {
    console.error('Error retrieving user lists:', error);
    throw error;
  }
};

export const deleteListByID = async (userUID, listID) => {
  try {
    const objectRef = ref(database, `${userUID}/lists/${listID}`);
    await remove(objectRef);
  } catch (error) {
    console.error('Error deleting list:', error);
    throw error;
  }
};

export const deleteTagByID = async (userUID, tagID) => {
  try {
    const objectRef = ref(database, `${userUID}/tags/${tagID}`);
    await remove(objectRef);
  } catch (error) {
    console.error('Error deleting tag:', error);
    throw error;
  }
};

export const createNewListItem = async (userUID, listItemData) => {
  try {
    // Create a reference to the 'lists' endpoint
    const listItemsRef = ref(database, `${userUID}/listItems`);
    // Generate a new key under the 'lists' endpoint
    const newListItemRef = push(listItemsRef);
    // Set the data at the new reference
    await set(newListItemRef, listItemData);
    const newItemWithExplicitID = {
      ...listItemData,
      listItemID: newListItemRef.key,
    };

    return newItemWithExplicitID; // Return the unique ID of the newly created list
  } catch (error) {
    console.error('Error creating new list item:', error);
    throw error;
  }
};

export const fetchListItemById = async (userUID, listItemId) => {
  try {
    const listItemRef = ref(database, `${userUID}/listItems/${listItemId}`);
    const snapshot = await get(listItemRef);
    if (snapshot.exists()) {
      // Return the data if it exists
      const listItem = snapshot.val();
      const plusExplicitID = {
        ...listItem,
        listItemID: listItemId,
      };
      return plusExplicitID;
    } else {
      console.log('No listItem data available for the provided ID.');
      return null;
    }
  } catch (error) {
    console.error('Error fetching listItem:', error);
    return null;
  }
};

export const fetchListItemsByListID = async (userUID, parentListID) => {
  try {
    // Reference to the 'lists' endpoint
    const listItemsRef = ref(database, `${userUID}/listItems`);
    // Create a query to filter lists where 'createdBy' equals the given userUID
    const listItemsQuery = query(
      listItemsRef,
      orderByChild('parentID'),
      equalTo(parentListID)
    );
    // Get the data from the query
    const snapshot = await get(listItemsQuery);
    if (snapshot.exists()) {
      // Data exists; convert snapshot to an object
      const data = snapshot.val();
      const allListItemsWithIDs = Object.entries(data).map((e) => ({
        listItemID: e[0],
        ...e[1],
      }));
      return allListItemsWithIDs;
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error retrieving user list items:', error);
    throw error;
  }
};

export const getMaxManualOrderByParentID = async (userUID, parentID) => {
  const listItemsRef = ref(database, `${userUID}/listItems`);
  try {
    // Step 1: Query to filter items by parentID
    const parentIDQuery = query(
      listItemsRef,
      orderByChild('parentID'),
      equalTo(parentID)
    );
    // Fetch the data
    const snapshot = await get(parentIDQuery);
    if (snapshot.exists()) {
      // Step 2: Extract the data from the snapshot and find the item with the highest manualOrder
      const items = snapshot.val();
      let highestItem = null;
      // Iterate over the filtered items to find the highest manualOrder
      Object.values(items).forEach((item) => {
        if (!highestItem || item.manualOrder > highestItem.manualOrder) {
          highestItem = item;
        }
      });

      if (highestItem) {
        // console.log(
        //   'Object with the highest manualOrder and matching parentID:',
        //   highestItem
        // );
        const maxManualOrderForList = highestItem.manualOrder;

        return maxManualOrderForList;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  } catch (error) {
    console.error('Error getting highest manual order by parentID:', error);
  }
};

export const patchMultipleListItems = async (userUID, updates) => {
  try {
    const updatePromises = updates.map((update) => {
      const { listItemID: unneededListItemID, ...rest } = update;
      const updatedListItem = { ...rest };
      return patchListItem(userUID, unneededListItemID, updatedListItem);
    });
    return await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error updating one or more listItems db objects:', error);
    return error;
  }
};

export const deleteListItemByID = async (userUID, listItemID) => {
  try {
    const objectRef = ref(database, `${userUID}/listItems/${listItemID}`);
    await remove(objectRef);
  } catch (error) {
    console.error('Error deleting list item:', error);
    throw error;
  }
};

export const deleteListItemsWithParentID = async (
  userUID,
  listID,
  childListItems
) => {
  try {
    const deletePromises = childListItems.map((listItem) => {
      return deleteListItemByID(userUID, listItem.listItemID);
    });
    return await Promise.all(deletePromises);
  } catch (error) {
    console.error(`Error deleting list items with parentID ${listID}: `, error);
  }
};

export const fetchAllUserTags = async (userUID) => {
  try {
    // Reference to the 'lists' endpoint
    const tagsRef = ref(database, `${userUID}/tags`);
    // Create a query to filter lists where 'createdBy' equals the given userUID
    const tagsQuery = query(tagsRef, orderByChild('userUID'), equalTo(userUID));
    // Get the data from the query
    const snapshot = await get(tagsQuery);
    if (snapshot.exists()) {
      // Data exists; convert snapshot to an object
      const data = snapshot.val();
      return data;
    } else {
      return {};
    }
  } catch (error) {
    console.error('Error retrieving tags:', error);
    throw error;
  }
};

export const createNewTag = async (userUID, tagData) => {
  try {
    const tagsRef = ref(database, `${userUID}/tags`);
    const newTagRef = push(tagsRef);
    await set(newTagRef, tagData);

    return newTagRef.key;
  } catch (error) {
    console.error('Error creating new tag:', error);
    throw error;
  }
};

export const findAndRemoveTagIDFromListItems = async (
  userUID,
  tagIDToRemove
) => {
  // Reference to the listItems node
  const listItemsRef = ref(database, `${userUID}/listItems`);
  try {
    // Fetch all listItems
    const snapshot = await get(listItemsRef);
    if (snapshot.exists()) {
      const listItems = snapshot.val();
      const updates = {}; // To hold updates for batch writing
      // Iterate over all items
      for (const [key, item] of Object.entries(listItems)) {
        // Check if the item has a .tags key and if it contains the tag
        if (Array.isArray(item.tags) && item.tags.includes(tagIDToRemove)) {
          // Filter out the tag to be removed from top-level .tags arr
          const updatedTags = (item.tags || []).filter(
            (tag) => tag !== tagIDToRemove
          );
          // AND ALSO from their .dates objs' .tags arrs
          const updatedDates = (item.dates || []).map((date) => ({
            ...date,
            tags: updatedTags,
          }));
          // Prepare the update
          updates[`${userUID}/listItems/${key}`] = {
            ...item,
            tags: updatedTags,
            dates: updatedDates,
          };
        }
      }
      // Perform batch update
      if (Object.keys(updates).length > 0) {
        await update(ref(database), updates);
      } else {
      }
    } else {
    }
  } catch (error) {
    console.error('Error updating list items:', error);
  }
};

export const findAndRemoveTagIDFromEvents = async (userUID, tagIDToRemove) => {
  // Reference to the listItems node
  const eventsRef = ref(database, `${userUID}/events`);
  try {
    // Fetch all listItems
    const snapshot = await get(eventsRef);
    if (snapshot.exists()) {
      const events = snapshot.val();
      const updates = {}; // To hold updates for batch writing
      // Iterate over all i tems
      for (const [key, event] of Object.entries(events)) {
        // Check if the event has a .tags key and if it contains the tag
        if (Array.isArray(event.tags) && event.tags.includes(tagIDToRemove)) {
          // Filter out the tag to be removed
          const updatedTags = event.tags.filter((tag) => tag !== tagIDToRemove);
          // Prepare the update
          updates[`${userUID}/events/${key}`] = { ...event, tags: updatedTags };
        }
      }
      // Perform batch update
      if (Object.keys(updates).length > 0) {
        await update(ref(database), updates);
      } else {
      }
    } else {
    }
  } catch (error) {
    console.error('Error updating list items:', error);
  }
};

export const createNewEvent = async (userUID, eventData) => {
  try {
    // Create a reference to the 'events' endpoint
    const eventsRef = ref(database, `${userUID}/events`);
    // Generate a new key under the 'events' endpoint
    const newEventRef = push(eventsRef);
    await set(newEventRef, eventData);
    return newEventRef.key; // Return the unique ID of the newly created event
  } catch (error) {
    console.error('Error creating new event:', error);
    throw error;
  }
};

export const fetchEventByID = async (userUID, eventID) => {
  try {
    const eventRef = ref(database, `${userUID}/events/${eventID}`);
    const snapshot = await get(eventRef);
    if (snapshot.exists()) {
      // Return the data if it exists
      return snapshot.val();
    } else {
      console.log('No event data available for the provided ID.');
      return null;
    }
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
};

export const fetchUserEventsByRange = async (userUID, startDate, endDate) => {
  console.log('startDate: ', startDate);
  console.log('endDate: ', endDate);
  const convertLocalDateToUTC = (localDateStr, isEndOfDay = false) => {
    const localDate = new Date(localDateStr);
    if (isEndOfDay) {
      // Set time to 23:59:59.999 for the end date
      localDate.setHours(23, 59, 59, 999);
    } else {
      // Set time to 00:00:00.000 for the start date
      localDate.setHours(0, 0, 0, 0);
    }
    // Convert to ISO8601 UTC string
    return localDate.toISOString();
  };

  // Convert local dates to UTC
  const startUTC = convertLocalDateToUTC(startDate);
  const endUTC = convertLocalDateToUTC(endDate, true);

  // Query Firebase
  const eventsRef = ref(database, `${userUID}/events`);
  const eventsQuery = query(
    eventsRef,
    orderByChild('startDateTime'),
    startAt(startUTC),
    endAt(endUTC)
  );

  // Fetch the data
  const snapshot = await get(eventsQuery);

  if (snapshot.exists()) {
    const events = snapshot.val();
    console.log(snapshot.val());
    const plusExplicitIDs = Object.entries(events).map((e) => ({
      eventID: e[0],
      ...e[1],
    }));
    return plusExplicitIDs;
  } else {
    return [];
  }
};

export const fetchAllUserEvents = async (userUID) => {
  const eventsRef = ref(database, `${userUID}/events`);
  try {
    const snapshot = await get(eventsRef);
    if (snapshot.exists()) {
      const events = snapshot.val(); // This will be an object containing all events
      const plusExplicitIDs = Object.entries(events).map((e) => ({
        eventID: e[0],
        ...e[1],
      }));
      return plusExplicitIDs;
    } else {
      console.log('No data available');
      return [];
    }
  } catch (error) {
    console.error('Error retrieving data:', error);
  }
};

export const patchEventByID = async (userUID, eventID, eventData) => {
  console.log('');
  console.log(eventID);
  console.log(eventData);
  try {
    const eventRef = ref(database, `${userUID}/events/${eventID}`);
    await update(eventRef, eventData);
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

export const patchMultipleEventsByIDs = async (
  userUID,
  eventIDs,
  dataObjects
) => {
  const updates = {};
  // Iterate over the eventIDs and corresponding dataObjects
  eventIDs.forEach((eventID, index) => {
    if (dataObjects[index]) {
      // Ensure there is a corresponding data object
      updates[`${userUID}/events/${eventID}`] = dataObjects[index];
    }
  });
  try {
    // Perform the update operation
    await update(ref(database), updates);
    console.log('Events updated successfully.');
  } catch (error) {
    console.error('Error updating events:', error);
  }
};

// export const patchEventOnKey = async (eventID, userUID, key, newValue) => {
//   const updates = {};

//   // Prepare the update path for a single object
//   updates[`/events/${userUID}/${eventID}/${key}`] = newValue;

//   const dbRef = ref(database);

//   try {
//     // Perform the update
//     await update(dbRef, updates);
//     console.log(
//       `Updated event with ID '${eventID}' on key '${key}' successfully`
//     );
//   } catch (error) {
//     console.error(
//       `Failed to update event with ID '${eventID}' on key '${key}':`,
//       error
//     );
//   }
// };

export const patchMultipleEventsOnKey = async (
  eventIDs,
  userUID,
  key,
  newValue
) => {
  const updates = {};
  // Prepare the updates object
  eventIDs.forEach((id) => {
    updates[`${userUID}/events/${id}/${key}`] = newValue; // Replace 'propertyName' with the actual property you want to update
  });

  const dbRef = ref(database);

  try {
    // Perform the update
    await update(dbRef, updates);
  } catch (error) {
    console.error(`Failed to updated events on key '${key}':`, error);
  }
};

export const deleteEventByID = async (userUID, eventID) => {
  try {
    const eventRef = ref(database, `${userUID}/events/${eventID}`);
    await remove(eventRef);
  } catch (error) {
    console.error('Error deleting list:', error);
    throw error;
  }
};

export const deleteEventsByEventIDs = async (userUID, eventIDs) => {
  try {
    // Iterate over each eventID
    for (const eventID of eventIDs) {
      // Reference to the event object at /events/<eventID>
      const eventRef = ref(database, `${userUID}/events/${eventID}`);
      // Remove the event from the database
      await remove(eventRef);
    }
    console.log('All specified events deleted successfully.');
  } catch (error) {
    console.error('Error deleting events:', error);
  }
};

export const deleteEventsByListItemID = async (userUID, listItemID) => {
  try {
    // Reference to the events for the user
    const eventsRef = ref(database, `${userUID}/events`);

    // Create a query to find events where listItemID matches the given value
    const eventsQuery = query(
      eventsRef,
      orderByChild('listItemID'),
      equalTo(listItemID)
    );

    // Retrieve all events matching the query
    const snapshot = await get(eventsQuery);

    if (snapshot.exists()) {
      const updates = {};
      snapshot.forEach((childSnapshot) => {
        const eventID = childSnapshot.key;
        updates[`${userUID}/events/${eventID}`] = null; // Mark the event for deletion
      });

      // Perform the batch delete
      await update(ref(database), updates);
      console.log('Deleted events with listItemID:', listItemID);
    } else {
      console.log('No events found with listItemID:', listItemID);
    }
  } catch (error) {
    console.error('Error deleting events:', error);
    throw error;
  }
};

export const fetchUserEventsByListItemID = async (userUID, listItemID) => {
  const eventsRef = ref(database, `${userUID}/events`);
  try {
    // Create a query
    const eventsQuery = query(
      eventsRef,
      orderByChild('listItemID'),
      equalTo(listItemID)
    );

    // Execute the query
    const snapshot = await get(eventsQuery);
    const events = snapshot.val();

    // If no events found, return an empty array
    if (!events) return [];
    const plusExplicitIDs = Object.entries(events).map((e) => ({
      eventID: e[0],
      ...e[1],
    }));
    // Convert the events object to an array
    return plusExplicitIDs;
    // return Object.values(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

export const deleteListItemsByListID = async (userUID, listID) => {
  try {
    // Reference to the events for the user
    const listItemsRef = ref(database, `${userUID}/listItems`);

    // Create a query to find events where listItemID matches the given value
    const listItemsQuery = query(
      listItemsRef,
      orderByChild('parentID'),
      equalTo(listID)
    );

    // Retrieve all events matching the query
    const snapshot = await get(listItemsQuery);

    if (snapshot.exists()) {
      const updates = {};
      snapshot.forEach((childSnapshot) => {
        const listItemID = childSnapshot.key;
        updates[`${userUID}/listItems/${listItemID}`] = null; // Mark the event for deletion
      });
      // Perform the batch delete
      await update(ref(database), updates);
      console.log('Deleted listItems with listID:', listID);
    } else {
      console.log('No listItems found with listID:', listID);
    }
  } catch (error) {
    console.error('Error deleting listItems:', error);
    throw error;
  }
};

export const fetchUserSyncState = async (userUID) => {
  try {
    // Reference directly to the 'syncState' under the given user's UID
    const userSyncStateRef = ref(database, `${userUID}/syncState`);

    // Fetch the data from the 'syncState' reference
    const snapshot = await get(userSyncStateRef);

    if (snapshot.exists()) {
      // Return the sync state data if it exists
      return snapshot.val();
    } else {
      // Return an empty object if no sync state exists
      return {};
    }
  } catch (error) {
    console.error('Error retrieving userSyncState for this user:', error);
    throw error;
  }
};

export const createSyncStateByUserID = async (userUID, state) => {
  const initUserSyncState = { state: state };
  const userSyncStatesRef = ref(database, `${userUID}/syncState`);
  // Generate a new key under the 'lists' endpoint
  const syncStateRef = push(userSyncStatesRef);
  // Set the data at the new reference
  await set(syncStateRef, initUserSyncState);

  // patch
  // const listItemRef = ref(database, `listItems/${listItemID}`);
  // await update(listItemRef, newData);
  //

  try {
  } catch (error) {
    console.error('Error updating one or more listItems db objects:', error);
    return error;
  }
};

export const patchSyncStateByUserID = async (userUID, state) => {
  try {
    // Reference to the syncState node under the given userUID
    const userSyncStatesRef = ref(database, `${userUID}/syncState`);
    // Get all the syncState nodes for this user
    const snapshot = await get(userSyncStatesRef);
    if (snapshot.exists()) {
      // Iterate over each child node under syncState
      snapshot.forEach(async (childSnapshot) => {
        const key = childSnapshot.key; // Get the key of the child node
        const syncStateData = childSnapshot.val(); // Get the current data for this child
        // Only update the child node if it has a state key
        if (syncStateData && typeof syncStateData.state !== 'undefined') {
          try {
            const updateRef = ref(database, `${userUID}/syncState/${key}`);
            const patchData = { state: state };
            await update(updateRef, patchData); // Use await to update the node
          } catch (error) {
            console.error(`Error updating syncState for key ${key}:`, error);
          }
        }
      });
    } else {
      console.log(`No syncState found for user ${userUID}`);
    }
  } catch (error) {
    console.error('Error updating userSyncState object for this user:', error);
  }
};

/* NEW NEW NEW NEW NEW NEW NEW NEW------------------------------------------------------------------------------------------------------------------- */

/*
- add all events to GCal (extendedProperties > private > createdBy === 'schejr-app') (+ also add ex>private>eventID === event.eventID on each GCal event)
  addAllEventsToGcal
- delete all events to GCal (extendedProperties > private > createdBy === 'schejr-app')
  removeAllEventsFromGCal
- fetch all events from GCal (extendedProperties > private > createdBy === 'schejr-app')
  fetchAllEventsFromGCal
- update multiple AND single events on GCal (pass in array of eventIDs + their corresp. updated data - this can handle just one, too)
  updateEventsOnGCal
- create single event on GCal
  addEventToGCal
- delete singl event from GCal
  removeEventFromGCal
*/

export const convertDBToGCal = (event) => {
  const gcalEventObj = {
    summary: event.title,
    extendedProperties: {
      private: {
        createdBy: 'schejr-app-sam-lea', // Unique identifier to mark the event as created by your app
        listItemID: event.listItemID,
        eventID: event.eventID,
        listID: event.listID,
      },
    },
  };
  if (!event.timeSet) {
    // if no specific time set, make an All Day Event on GCal
    const startDateTimeObject = new Date(event.startDateTime);
    const endDateTimeObject = new Date(event.startDateTime);
    endDateTimeObject.setDate(endDateTimeObject.getDate() + 1); // Add one day to endDateTimeObject
    const formattedStart = startDateTimeObject.toISOString().split('T')[0]; // Get only the date part (YYYY-MM-DD)
    const formattedEnd = endDateTimeObject.toISOString().split('T')[0]; // Get only the date part (YYYY-MM-DD)
    gcalEventObj.start = { date: formattedStart };
    gcalEventObj.end = { date: formattedEnd };
  } else {
    // console.log(event.startDateTime);
    // if a specific time has been set, ensure this time is converted from UTC to local before adding to GCal
    const startDateTime = event.startDateTime;
    const endDateTimeObject = new Date(event.startDateTime);
    endDateTimeObject.setMinutes(endDateTimeObject.getMinutes() + 5); // Set to 5 minutes after startTime
    // console.log(endDateTimeObject);
    const endDateTime = endDateTimeObject.toISOString();
    // console.log(startDateTime);
    // console.log(endDateTime);

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone; // Automatically detects user's local time zone

    gcalEventObj.start = {
      dateTime: startDateTime,
      timeZone,
    };
    gcalEventObj.end = { dateTime: endDateTime, timeZone };
    // console.log(gcalEventObj);
  }
  return gcalEventObj;
};

export const convertGCalToDB = (gcalEvent) => {};

export const addEventToGCal = async (event) => {
  try {
    await gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });
  } catch (error) {
    console.error('Error creating GCal event:', error);
  }
};

export const addAllEventsToGCal = async (userUID) => {
  // not all a user's events will be in app state - fetch them first
  try {
    const userEvents = await fetchAllUserEvents(userUID);
    // console.log(userEvents);
    const userEventsGCalFormat = userEvents.map((event) => {
      return convertDBToGCal(event);
    });
    // console.log(userEventsGCalFormat);
    const updatePromises = userEventsGCalFormat.map((event) => {
      return addEventToGCal(event);
    });
    return await Promise.all(updatePromises);
  } catch (error) {
    console.log(error);
  }
};

export const removeEventFromGCal = async (event) => {
  try {
    await gapi.client.calendar.events.delete({
      calendarId: 'primary',
      eventId: event.id,
    });
  } catch (error) {
    console.error(`Failed to delete GCal event ${event.summary}:`, error);
  }
};

export const removeAllEventsFromGCal = async () => {
  try {
    const response = await gapi.client.calendar.events.list({
      calendarId: 'primary',
      privateExtendedProperty: 'createdBy=schejr-app-sam-lea', // Filtering by your custom identifier
      showDeleted: false,
      singleEvents: true,
      maxResults: 2500, // Adjust if you expect more than 2500 events
    });

    const allEventsMadeByUser = response.result.items;

    if (!allEventsMadeByUser || allEventsMadeByUser.length === 0) {
      return;
    }

    const updatePromises = allEventsMadeByUser.map((event) => {
      return removeEventFromGCal(event);
    });
    return await Promise.all(updatePromises);
  } catch (error) {
    console.log('error removing all list items from GCal');
  }
};

export const updateEventsOnGCal = async () => {}; // 1 or more

export const removeGCalEventsByListItemID = async () => {};

export const removeGCalEventsByListID = async () => {};

export const fetchAllEventsFromGCal = async () => {
  try {
    // Make the API request to list events with specific private extended property
    const response = await gapi.client.calendar.events.list({
      calendarId: 'primary', // Primary calendar
      privateExtendedProperty: `createdBy=schejr-app-sam-lea`, // Filter by private extended property
      showDeleted: false, // Optional: Exclude deleted events
      maxResults: 2500, // Max results per request (2500 is the maximum allowed)
      // singleEvents: true, // Expand recurring events into instances if needed
    });
    // Get the list of events
    const gcalEvents = response.result.items;
    console.log(gcalEvents);
    // Check if any events were found
    if (gcalEvents && gcalEvents.length > 0) {
      // Sort events by start time after fetching
      gcalEvents.sort((a, b) => {
        const startA = new Date(a.start.dateTime || a.start.date);
        const startB = new Date(b.start.dateTime || b.start.date);
        return startA - startB; // Sort ascending
      });
      return gcalEvents;
    } else {
      console.log(
        'No events found with the specified private extended property.'
      );
    }
  } catch (error) {
    console.error('Error fetching events with extended property:', error);
    return error;
  }
};

export const performEventDiscrepancyCheck = async (userUID) => {
  const allGCalEvents = await fetchAllEventsFromGCal();
  const allDBEvents = await fetchAllUserEvents(userUID);
  console.log(allGCalEvents);
  console.log(allDBEvents);
  const allGCalEventsFormatted = allGCalEvents.map((gcalEvent) =>
    h.formatGCalEventAsDBEvent(userUID, gcalEvent)
  );
  /*
    { bothButDiff: [
        { eventID: 1, schejr: {}, gcal: {}, changedFields: [], keep: null // either 'schejr' or 'gcal' },
        { eventID: 2, schejr: {}, gcal: {}, changedFields: [], keep: null },
      ], // sort on .schejr.startDateTime asc
      schejrNotGCal: [
        {eventID: 3, ...event, keep: null // either 'true' or 'false' - if true, add to gcal, if false, delete from DB },
      ], // sort on .startDateTime asc
      gcalNotSchejr: [
        {eventID: 4, ...event, keep: null // either 'true' or 'false' - if true, add to schejr, if false, delete from gcal },
      ] // sort on .startDateTime asc
    }
*/
  const discrepancies = h.composeDiscrepancies(
    allDBEvents,
    allGCalEventsFormatted
  );
  const { bothButDiff, schejrNotGCal, gcalNotSchejr } = discrepancies;
  if (!bothButDiff.length && !schejrNotGCal.length && !gcalNotSchejr.length) {
    return null;
  } else {
    return discrepancies;
  }
};

/* OLD OLD OLD OLD OLD OLD OLD OLD -------------------------------------------------------------------- */

export const addAListItemToGCal = async (listItem) => {
  const event = {
    summary: listItem.title,
    start: {
      date: listItem.date.startDate,
    },
    end: {
      date: !listItem.date.endDate
        ? listItem.date.startDate
        : h.getNextCalendarDate(listItem.date.endDate), // so the end date INCLUDES the end date, not stopping on midnight the night before
    },
    extendedProperties: {
      private: {
        createdBy: 'schejr-app', // Unique identifier to mark the event as created by your app
        listItemID: listItem.listItemID,
      },
    },
  };

  try {
    const response = await gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });
  } catch (error) {
    console.error('Error creating GCal event:', error);
  }
};

export const addAllListItemsToGCal = async (listItems) => {
  const onlyListItemsWithDates = listItems.filter((e) =>
    e.hasOwnProperty('date')
  );

  const updatePromises = onlyListItemsWithDates.map((listItem) => {
    return addAListItemToGCal(listItem);
  });
  return await Promise.all(updatePromises);
};

export const removeListItemFromGCal = async (event) => {
  try {
    await gapi.client.calendar.events.delete({
      calendarId: 'primary',
      eventId: event.id,
    });
  } catch (error) {
    console.error(`Failed to delete GCal event ${event.summary}:`, error);
  }
};

export const removeGCalEventByListItemID = async (listItemID) => {
  try {
    const response = await gapi.client.calendar.events.list({
      calendarId: 'primary',
      privateExtendedProperty: `listItemID=${listItemID}`,
    });
    const events = response.result.items;
    if (events.length > 0) {
      try {
        const eventId = events[0].id;
        await gapi.client.calendar.events.delete({
          calendarId: 'primary',
          eventId: eventId,
        });
      } catch (error) {
        console.error('Failed to delete GCal event:', error);
      }
    } else {
      console.log(
        'No GCal event found with the listItemID extended property ',
        listItemID
      );
    }
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

export const removeMultipleGCalEventsByListItemIDs = async (listItemIDs) => {
  try {
    const deletePromises = listItemIDs.map((listItemID) => {
      return removeGCalEventByListItemID(listItemID);
    });
    return await Promise.all(deletePromises);
  } catch (error) {}
};

export const changeListItemOnGCalByIDOrCreate = async (
  listItem,
  field,
  value
) => {
  const updatedEventData = {
    summary: listItem.title,
    start: {
      date: listItem.date.startDate,
    },
    end: {
      date: !listItem.date.endDate
        ? listItem.date.startDate
        : h.getNextCalendarDate(listItem.date.endDate),
    },
    extendedProperties: {
      private: {
        createdBy: 'schejr-app', // Unique identifier to mark the event as created by your app
        listItemID: listItem.listItemID,
      },
    },
  };

  try {
    // Fetch events with the specified extended property id
    const response = await gapi.client.calendar.events.list({
      calendarId: 'primary',
      privateExtendedProperty: `listItemID=${listItem.listItemID}`, // Filter by extended property 'id'
    });

    const events = response.result.items;

    // Check if any event matches the specified id
    if (events.length === 0) {
      console.log(
        `No GCal events found with extendedProperty 'listItemID': ${listItem.listItemID}`
      );

      await addAListItemToGCal(listItem);
      return;
    }

    // handle updating start date to null values ie. a date has been UNSET on the listItem obj - so, delete the gcal event for this listItem
    if (!listItem.date.startDate) {
      const eventToDelete = events[0];
      await removeListItemFromGCal(eventToDelete);
      return;
    }

    // Assume only one event matches the id (or handle multiple matches if needed)
    const eventToUpdate = events[0];

    // Merge the current event properties with the updates
    const updatedEvent = {
      ...eventToUpdate,
      ...updatedEventData,
    };

    // Update the event on Google Calendar
    await gapi.client.calendar.events.update({
      calendarId: 'primary',
      eventId: eventToUpdate.id,
      resource: updatedEvent,
    });

    console.log(
      `Updated event with extendedProperty 'listItemID': ${listItem.listItemID}`
    );
  } catch (error) {
    console.error(
      `Failed to update event with extendedProperty 'listItemID':`,
      error
    );
  }
};

export const removeAllListItemsFromGCal = async () => {
  try {
    const response = await gapi.client.calendar.events.list({
      calendarId: 'primary',
      privateExtendedProperty: 'createdBy=schejr-app-sam-lea', // Filtering by your custom identifier
      showDeleted: false,
      singleEvents: true,
      maxResults: 2500, // Adjust if you expect more than 2500 events
    });

    const allEventsMadeByUser = response.result.items;

    if (!allEventsMadeByUser || allEventsMadeByUser.length === 0) {
      return;
    }

    const updatePromises = allEventsMadeByUser.map((event) => {
      return removeListItemFromGCal(event);
    });
    return await Promise.all(updatePromises);
  } catch (error) {
    console.log('error removing all list items from GCal');
  }
};
