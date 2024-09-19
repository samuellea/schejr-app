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
import { lastDayOfMonth } from 'date-fns';

export const createNewList = async (listData) => {
  try {
    // Create a reference to the 'lists' endpoint
    const listsRef = ref(database, 'lists');
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

export const patchList = async (listID, newData) => {
  try {
    const listRef = ref(database, `lists/${listID}`);
    await update(listRef, newData);
  } catch (error) {
    console.error('Error updating list:', error);
    throw error;
  }
};

export const patchListItem = async (listItemID, newData) => {
  try {
    const listItemRef = ref(database, `listItems/${listItemID}`);
    await update(listItemRef, newData);
  } catch (error) {
    console.error('Error updating list item:', error);
    throw error;
  }
};

export const patchTag = async (tagID, newData) => {
  try {
    const tagRef = ref(database, `tags/${tagID}`);
    await update(tagRef, newData);
  } catch (error) {
    console.error('Error updating tag:', error);
    throw error;
  }
};

export const fetchAllUserLists = async (userUID) => {
  try {
    // Reference to the 'lists' endpoint
    const listsRef = ref(database, 'lists');
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
      return data;
    } else {
      return {};
    }
  } catch (error) {
    console.error('Error retrieving user lists:', error);
    throw error;
  }
};

export const deleteListByID = async (listID) => {
  try {
    const objectRef = ref(database, `lists/${listID}`);
    await remove(objectRef);
  } catch (error) {
    console.error('Error deleting list:', error);
    throw error;
  }
};

export const deleteTagByID = async (tagID) => {
  try {
    const objectRef = ref(database, `tags/${tagID}`);
    await remove(objectRef);
  } catch (error) {
    console.error('Error deleting tag:', error);
    throw error;
  }
};

export const createNewListItem = async (listItemData) => {
  try {
    // Create a reference to the 'lists' endpoint
    const listItemsRef = ref(database, 'listItems');
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

export const fetchListItemsByListID = async (parentListID) => {
  try {
    // Reference to the 'lists' endpoint
    const listItemsRef = ref(database, 'listItems');
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
      return data;
    } else {
      return {};
    }
  } catch (error) {
    console.error('Error retrieving user list items:', error);
    throw error;
  }
};

export const deleteListItemByID = async (listItemID) => {
  try {
    const objectRef = ref(database, `listItems/${listItemID}`);
    await remove(objectRef);
  } catch (error) {
    console.error('Error deleting list item:', error);
    throw error;
  }
};

export const deleteListItemsWithParentID = async (listID, childListItems) => {
  try {
    const deletePromises = childListItems.map((listItem) => {
      return deleteListItemByID(listItem.listItemID);
    });
    return await Promise.all(deletePromises);
  } catch (error) {
    console.error(`Error deleting list items with parentID ${listID}: `, error);
  }
};

export const fetchAllUserTags = async (userUID) => {
  try {
    // Reference to the 'lists' endpoint
    const tagsRef = ref(database, 'tags');
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

export const createNewTag = async (tagData) => {
  try {
    const tagsRef = ref(database, 'tags');
    const newTagRef = push(tagsRef);
    await set(newTagRef, tagData);

    return newTagRef.key;
  } catch (error) {
    console.error('Error creating new tag:', error);
    throw error;
  }
};

export const findAndRemoveTagIDFromMatchingListItems = async (
  tagIDToRemove
) => {
  // Reference to the listItems node
  const listItemsRef = ref(database, 'listItems');

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
          // Filter out the tag to be removed
          const updatedTags = item.tags.filter((tag) => tag !== tagIDToRemove);
          // Prepare the update
          updates[`listItems/${key}`] = { ...item, tags: updatedTags };
        }
      }

      //
      // only sending tags! ensure all other information for each listItem object is included!
      // Perform batch update
      if (Object.keys(updates).length > 0) {
        await update(ref(database), updates);
      } else {
      }
    } else {
    }
  } catch (error) {
    console.error('Error updating items:', error);
  }
};

export const getMaxManualOrderByParentID = async (parentID) => {
  const listItemsRef = ref(database, '/listItems');
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
        console.log(
          'Object with the highest manualOrder and matching parentID:',
          highestItem
        );
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

export const patchMultipleListItems = async (updates) => {
  // {data: {} }, {data: {} }, // {}, {}
  try {
    const updatePromises = updates.map((update) => {
      const { listItemID: unneededListItemID, ...rest } = update;
      const updatedListItem = { ...rest };
      return patchListItem(unneededListItemID, updatedListItem);
    });
    return await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error updating one or more listItems db objects:', error);
    return error;
  }
};

export const getUserSyncState = async (userUID) => {
  try {
    // Reference to the 'lists' endpoint
    const userSyncStatesRef = ref(database, 'userSyncStates');
    // Create a query to filter lists where 'createdBy' equals the given userUID
    const userSyncStatesQuery = query(
      userSyncStatesRef,
      orderByChild('userUID'),
      equalTo(userUID)
    );
    const snapshot = await get(userSyncStatesQuery);
    if (snapshot.exists()) {
      const data = snapshot.val();
      return data;
    } else {
      return {};
    }
  } catch (error) {
    console.error('Error retrieving userSyncState for this user:', error);
    throw error;
  }
};

export const createSyncStateByUserID = async (userUID, state) => {
  const initUserSyncState = { userUID: userUID, state: state };
  const userSyncStatesRef = ref(database, 'userSyncStates');
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
    // Reference to your database node where the objects are stored
    const userSyncStatesRef = ref(database, 'userSyncStates');
    // Query to find objects where the userUID key matches the provided userUID
    const userQuery = query(
      userSyncStatesRef,
      orderByChild('userUID'),
      equalTo(userUID)
    );
    const snapshot = await get(userQuery);
    const patchData = { userUID: userUID, state: state };
    if (snapshot.exists()) {
      // Iterate over the matched objects and update them
      snapshot.forEach((childSnapshot) => {
        // Get the key of the matched object
        const key = childSnapshot.key;
        // Update the matched object using the key
        const updateRef = ref(database, `userSyncStates/${key}`); // Replace with your actual path
        update(updateRef, patchData);
      });
    } else {
    }
  } catch (error) {
    console.error('Error updating userSyncState object for this user:', error);
  }
};

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
    console.error('Error creating event:', error);
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
    console.error(`Failed to delete event ${event.summary}:`, error);
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
        console.error('Failed to delete event:', error);
      }
    } else {
      console.log(
        'No event found with the listItemID extended property ',
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
        `No events found with extendedProperty 'listItemID': ${listItem.listItemID}`
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
      privateExtendedProperty: 'createdBy=schejr-app', // Filtering by your custom identifier
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
  } catch (error) {}
};

export const createNewEvent = async (userUID, eventData) => {
  try {
    // Create a reference to the 'events' endpoint
    const eventsRef = ref(database, `events/${userUID}`);
    // Generate a new key under the 'events' endpoint
    const newEventRef = push(eventsRef);
    await set(newEventRef, eventData);
    console.log(newEventRef.key);
    return newEventRef.key; // Return the unique ID of the newly created list
  } catch (error) {
    console.error('Error creating new event:', error);
    throw error;
  }
};

export const patchEventByID = async (userUID, eventID, eventData) => {
  try {
    const eventRef = ref(database, `events/${userUID}/${eventID}`);
    await update(eventRef, eventData);
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
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
    updates[`/events/${userUID}/${id}/${key}`] = newValue; // Replace 'propertyName' with the actual property you want to update
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
    const eventRef = ref(database, `events/${userUID}/${eventID}`);
    await remove(eventRef);
  } catch (error) {
    console.error('Error deleting list:', error);
    throw error;
  }
};

export const fetchUserEventsByMonth = async (userUID, month, year) => {
  console.log('month: ', month);
  console.log('year: ', year);
  const date = new Date(year, month, 1);
  const lastDay = lastDayOfMonth(date).getDate();
  console.log('lastDay: ', lastDay);
  const startOfMonthLocal = new Date(year, month, 1, 0, 0, 0, 0); // 1st September 2024, 00:00:00 local time
  // User's local time for the end of September 30th, 23:59:59.999 (user's local time zone)
  const endOfMonthLocal = new Date(year, month, lastDay, 23, 59, 59, 999); // 30th September 2024, 23:59:59.999 local time
  // Convert to UTC ISO 8601 strings
  const startOfMonthUTC = startOfMonthLocal.toISOString();
  const endOfMonthUTC = endOfMonthLocal.toISOString();
  // console.log(startOfMonthUTC);
  // console.log(endOfMonthUTC);
  // Reference to the /events endpoint
  const eventsRef = ref(database, `events/${userUID}`);
  // Query the events between the calculated UTC times
  const monthQuery = query(
    eventsRef,
    orderByChild('startDateTime'),
    startAt(startOfMonthUTC),
    endAt(endOfMonthUTC)
  );
  try {
    // Use .get() for a promise-based approach
    const snapshot = await get(monthQuery);
    const events = snapshot.val();
    if (events) {
      console.log('Fetched events:', events);
      const eventsAsArr = Object.entries(events).map(([key, value]) => ({
        eventID: key,
        ...value,
      }));
      return eventsAsArr;
    } else {
      console.log('No events found for that month.');
      return [];
    }
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

export const fetchListItemById = async (listItemId) => {
  try {
    const listItemRef = ref(database, `listItems/${listItemId}`);
    const snapshot = await get(listItemRef);
    if (snapshot.exists()) {
      // Return the data if it exists
      return snapshot.val();
    } else {
      console.log('No listItem data available for the provided ID.');
      return null;
    }
  } catch (error) {
    console.error('Error fetching listItem:', error);
    return null;
  }
};
