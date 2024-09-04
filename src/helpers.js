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

export const sortItems = (items, sortKey, order, existingTags) => {
  // Validate sortKey and order
  if (!items || !Array.isArray(items)) {
    // throw new Error('First argument must be an array of objects.');
    return [];
  }
  if (
    typeof sortKey !== 'string' ||
    !['title', 'startDate', 'tags', 'manualOrder'].includes(sortKey)
  ) {
    throw new Error(
      'Invalid sort key. Valid keys are: title, startDate, tags, manualOrder.'
    );
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

  if (sortKey === 'manualOrder' || sortKey === 'title') {
    const sorted = items.sort((a, b) => {
      if (a[sortKey] < b[sortKey]) {
        return isAscending ? -1 : 1;
      }
      if (a[sortKey] > b[sortKey]) {
        return isAscending ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }

  if (sortKey === 'startDate') {
    return items.sort((a, b) => {
      // Access .startDate or provide a default date if missing
      const dateA = a.date?.startDate
        ? new Date(a.date.startDate)
        : new Date(-8640000000000000); // Default to very distant past date
      const dateB = b.date?.startDate
        ? new Date(b.date.startDate)
        : new Date(8640000000000000); // Default to very distant future date

      // Determine sort direction
      const direction = order === 'descending' ? -1 : 1;

      // Compare the dates
      if (dateA < dateB) {
        return -1 * direction; // Ascending or descending based on direction
      }
      if (dateA > dateB) {
        return 1 * direction; // Ascending or descending based on direction
      }
      return 0; // If dates are equal
    });
  }

  if (sortKey === 'tags') {
    // Convert all tags in all items to their names
    const withTagNames = items.map((e) => {
      // Check if the item has a .tags key and it's not empty
      const tags = e.tags || []; // Default to empty array if .tags is undefined
      const tagsWithNames = tags.map((id) => {
        const tag = existingTags.find((tag) => tag.tagID === id);
        return tag ? tag.name : 'Unknown'; // Use 'Unknown' or any default name for missing tags
      });
      return { ...e, tags: tagsWithNames };
    });

    // Sort items based on their tag names
    const thoroughlySortedOnTagNames = withTagNames.sort((a, b) => {
      const tagsA = a.tags || []; // Default to empty array if .tags is undefined
      const tagsB = b.tags || [];

      // Determine sort direction
      const direction = order === 'descending' ? -1 : 1;

      // Find the smallest length between the two tag arrays
      const minLength = Math.min(tagsA.length, tagsB.length);

      for (let i = 0; i < minLength; i++) {
        const tagA = tagsA[i]?.toLowerCase() || ''; // Convert tags to lowercase for consistent sorting
        const tagB = tagsB[i]?.toLowerCase() || '';

        if (tagA < tagB) {
          return -1 * direction; // If tagA comes before tagB alphabetically
        }
        if (tagA > tagB) {
          return 1 * direction; // If tagA comes after tagB alphabetically
        }
        // If tags are equal, continue to the next tag
      }

      // If all compared tags are equal, the array with fewer tags comes first
      return (tagsA.length - tagsB.length) * direction;
    });

    // Convert tag names back to IDs
    const backToTagIDs = thoroughlySortedOnTagNames.map((e) => {
      const tagsAsIDs = (e.tags || [])
        .map((name) => {
          const tag = existingTags.find((tag) => tag.name === name);
          return tag ? tag.tagID : null; // Use null or any default value for missing tags
        })
        .filter((id) => id !== null); // Filter out null values (missing tags)
      return { ...e, tags: tagsAsIDs };
    });

    return backToTagIDs;
  }
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

export const dateLabel = (dates) => {
  if (!dates) return null;
  const { startDate, endDate } = dates;
  if (!startDate) return null;
  const formatDate = (isoDate) => {
    if (!isoDate) return null;
    const date = new Date(isoDate);
    const currentYear = new Date().getFullYear();
    const dateYear = date.getFullYear();

    // Define abbreviated month names
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    // Extract the day, month, and year
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = dateYear !== currentYear ? ` ${dateYear}` : '';

    // Format the date string
    const formattedDate = `${day} ${month}${year}`;
    console.log(formattedDate, ' ***');
    return formattedDate;
  };

  const startFormatted = formatDate(startDate);
  const endFormatted = formatDate(endDate);
  const label = `${startFormatted ? startFormatted : ''} ${
    endFormatted ? '- ' : ''
  } ${endFormatted ? endFormatted : ''}`;
  return label;
};
