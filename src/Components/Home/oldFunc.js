const = '';

const handleOtherEventFields = async (field, eventData, listItem) => {
  const { eventID, ...restOfEvent } = eventData;
  const updatedEventDBObj = { ...restOfEvent };
  // 🌐🎉  FIRST update existing EVENT /events
  await u.patchEventByID(userUID, eventData.eventID, updatedEventDBObj);
  // 🍰🎉then, if the EVENT we updated is in 'events' state, update that EVENT obj there too
  const updatedEventInState = events.find(
    (e) => e.eventID === eventData.eventID
  );
  if (updatedEventInState) {
    const stateEventsMinusUpdated = events.filter(
      (e) => e.eventID !== eventData.eventID
    ); // eventData still has explicit eventID, as req'd in events state
    const updatedStateEvents = [...stateEventsMinusUpdated, eventData];
    setEvents(updatedStateEvents);
  }

  if (field === 'tags') {
    // update listItem's .tags in state
    // update listItem's .tags on DB
    updateListItem(listItem, 'tags', eventData.tags);
  }
};

const handleEvents = async (action, eventData, listItem) => {
  /* 🪴 */
  if (action === 'create') {
    // 🌐🎉 FIRST create new EVENT /events
    const newEventID = await u.createNewEvent(userUID, eventData);
    // 🍰🎉 then, if the EVENT has a startDateTime in the month in 'viewMonth' state, update 'events' state to include newly-created EVENT

    // 🌐🧾 + 🍰🧾  THEN add it to .dates on listItem, in state and on db
    const newDateObj = {
      ...eventData,
      eventID: newEventID,
    };

    const updatedDates = [...(listItem.dates || []), newDateObj];
    updateListItem(listItem, 'dates', updatedDates);
    const eventMonth = new Date(eventData.startDateTime).getMonth();
    const plannerMonth = viewMonth.getMonth();

    if (eventMonth === plannerMonth) {
      const newEventPlusID = { ...eventData, eventID: newEventID };
      const updatedEvents = [...(events || []), newEventPlusID];
      setEvents(updatedEvents);
    }
  }
  /* 📝 */
  if (action === 'update') {
    const { eventID, ...restOfEvent } = eventData;
    const updatedEventDBObj = { ...restOfEvent };
    // 🌐🎉  FIRST update existing EVENT /events
    await u.patchEventByID(userUID, eventData.eventID, updatedEventDBObj);
    // 🍰🎉then, if the EVENT we updated is in 'events' state, update that EVENT obj there too
    const updatedEventInState = events.find(
      (e) => e.eventID === eventData.eventID
    );
    if (updatedEventInState) {
      const stateEventsMinusUpdated = events.filter(
        (e) => e.eventID !== eventData.eventID
      ); // eventData still has explicit eventID, as req'd in events state
      const updatedStateEvents = [...stateEventsMinusUpdated, eventData];
      setEvents(updatedStateEvents);
    }
    // 🌐🧾 + 🍰🧾 THEN update it in .dates on listItem, in state and on db
    const updatedDates = listItem.dates
      .filter((e) => e.eventID !== eventData.eventID)
      .concat(eventData);

    return updateListItem(listItem, 'dates', updatedDates);
  }
  /* 🗑️ */
  if (action === 'deleteOne' || action === 'deleteAll') {
    // in 'delete' case, eventData should ALWAYS be an ARRAY of eventData objects (to handle both deleting one event and multiple events)
    if (!Array.isArray(eventData)) {
      return console.log(
        "EventData passed to 'handleEvents' with action 'delete' is NOT an array!"
      );
    }
    // 🌐🎉  FIRST delete existing EVENT /events
    const deletePromises = eventData.map((eventObj) => {
      return u.deleteEventByID(userUID, eventObj.eventID);
    });
    await Promise.all(deletePromises);
    // 🍰🎉then, if the EVENT/(S) we deleted is in 'events' state, remove that/those EVENT/(S) obj there too
    const eventIDsSet = new Set(eventData.map((e) => e.eventID));

    const matchingEventIDs = events
      .filter((event) => eventIDsSet.has(event.eventID))
      .map((event) => event.eventID);

    if (matchingEventIDs.length) {
      const stateEventsMinusDeleted = events.filter(
        (event) => !eventIDsSet.has(event.eventID)
      );
      // eventData still has explicit eventID, as req'd in events state
      setEvents(stateEventsMinusDeleted);
    }
    if (action === 'deleteAll') return;
    if (action === 'deleteOne') {
      const singleEventDeleted = eventData[0];
      // 🌐🧾 + 🍰🧾 THEN remove it from .dates on listItem, in state and on db
      // we don't want to do this if we call 'deleteAll', which is only for when a ListItem is being DELETED (so no need to update the list item - it's been deleted!)
      const updatedDates = listItem.dates.filter(
        (e) => e.eventID !== singleEventDeleted.eventID
      );
      return updateListItem(listItem, 'dates', updatedDates);
    }
  }
};

const updateListItem = async (listItem, field, value) => {
  console.log('ULI');
  const indexOfListItemInListItems = listItems.findIndex(
    (item) => item.listItemID === listItem.listItemID
  );
  const updatedListItem = { ...listItem, [field]: value }; // we're spreading in a passed-in listItemID coming in as listItem, not the intended listITem object

  // update the List Item in state first 🍰🧾 IF IT EXISTS in state
  if (indexOfListItemInListItems !== -1) {
    console.log('🍰🧾');
    const updatedListItems = [...listItems];
    updatedListItems[indexOfListItemInListItems] = updatedListItem;
    setListItems(updatedListItems);
  }

  // if field === 'title' and listItem has .dates, we need to change the .title of any .dates objects AND events db and state objects
  if ((field === 'title' || field === 'tags') && listItem.dates?.length) {
    const updatedDates = listItem.dates.map((date) => ({
      ...date,
      [field]: value,
    }));
    updatedListItem.dates = updatedDates;
    // 🌐🧾 + 🍰🧾 <-- handled after this 'if' block
    // 🌐🎉 and consqtly their associated /events objects on DB
    const datesEventIDs = listItem.dates.map((date) => date.eventID);
    await u.patchMultipleEventsOnKey(datesEventIDs, userUID, field, value);
    // 🍰🎉 then, if any of these events are in 'events' state, update these event objs in state too (so Planner UI reflects changes)
    const eventsEventIDs = events.map((event) => event.eventID);
    const eventIDSet = new Set(eventsEventIDs);
    // Filter the 'events' state array to only include objects with .eventID values in the eventIDSet
    const eventsToUpdate = events.filter((obj) =>
      eventIDSet.has(obj.eventID)
    );
    const eventsUpdatedTitle = eventsToUpdate.map((e) => ({
      ...e,
      [field]: value,
    }));
    const otherEvents = events.filter((obj) => !eventIDSet.has(obj.eventID));
    const updatedStateEvents = [...otherEvents, ...eventsUpdatedTitle];
    setEvents(updatedStateEvents);
  }

  // then, remove the listItemID prior to patching the List Item on the db 🌐🧾
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
