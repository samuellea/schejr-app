import { format } from 'date-fns';

export const sortByProperty = (arr, property, ascending = true) => {
  return arr.slice().sort((a, b) => {
    if (a[property] < b[property]) {
      return ascending ? -1 : 1;
    }
    if (a[property] > b[property]) {
      return ascending ? 1 : -1;
    }
    return 0;
  });
};

export const leastUsedColours = (colorOptions, existingTags) => {
  const initialTally = colorOptions.map((e) => ({ [e]: 0 }));

  const tally = initialTally.map((obj) => {
    const key = Object.keys(obj)[0];
    const count = existingTags.filter((tag) => tag.color === key).length;
    return { [key]: count };
  });

  const getObjectsWithLowestValue = (arr) => {
    const values = arr.map((obj) => Math.min(...Object.values(obj)));
    const minValue = Math.min(...values);
    const onlyLowestObjs = arr.filter(
      (obj) => Math.min(...Object.values(obj)) === minValue
    );
    return onlyLowestObjs.map((e) => Object.keys(e)[0]);
  };

  const leastUsedColours = getObjectsWithLowestValue(tally);
  return leastUsedColours;
};

export const formatDate = (date) => {
  if (!date) return null;
  return format(date, 'MMMM dd, yyyy');
};

export const sortItems = (items, sortKey, order) => {
  // Validate sortKey and order
  if (!items || !Array.isArray(items)) {
    throw new Error('First argument must be an array of objects.');
  }
  if (typeof sortKey !== 'string' || !['id', 'manualOrder'].includes(sortKey)) {
    throw new Error('Invalid sort key. Valid keys are: id, manualOrder.');
  }
  if (
    typeof order !== 'string' ||
    !['ascending', 'descending'].includes(order)
  ) {
    throw new Error('Invalid order. Valid orders are: ascending, descending.');
  }

  if (!items.length) return null;

  // Determine sort order
  const isAscending = order === 'ascending';

  return items.sort((a, b) => {
    if (a[sortKey] < b[sortKey]) {
      return isAscending ? -1 : 1;
    }
    if (a[sortKey] > b[sortKey]) {
      return isAscending ? 1 : -1;
    }
    return 0;
  });
};

// // if the item's starting index is lower than the destination index: all objects with .mO <= destination index have their .m0s - 1'd
// // if the item's starting index is higher than the destination index: all objects with .m0 >= destination index have their .m0s + 1'd
export const updatedManualOrders = (
  listItems,
  startIndex,
  destinationIndex
) => {
  const arrCopy = [...listItems];
  const itemToMove = arrCopy[startIndex];
  arrCopy.splice(startIndex, 1);
  arrCopy.splice(destinationIndex, 0, itemToMove);
  // then map to change ALL manualOrders to index + 1
  const newMOrders = arrCopy.map((e, i) => ({
    ...e,
    manualOrder: i + 1,
  }));
  // only update objects where .manualOrder has changed
  const onlyChanged = newMOrders.reduce((acc, f, i) => {
    if (newMOrders[i].listItemID !== listItems[i].listItemID) acc.push(f);
    return acc;
  }, []);
  return { newMOrders, onlyChanged };
};

export const updatedManualOrdersOnSourceList = (listItems, removedID) => {
  const sourceListItemsMinusRemoved = listItems.filter(
    (e) => e.listItemID !== removedID
  );
  const newMOrders = sourceListItemsMinusRemoved.map((e, i) => ({
    ...e,
    manualOrder: i + 1,
  }));
  return newMOrders;
};
