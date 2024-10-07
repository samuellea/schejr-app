import {
  format,
  isThisYear,
  parseISO,
  formatDistanceToNow,
  startOfWeek,
  addDays,
  getISOWeek,
  addWeeks,
  subWeeks,
} from 'date-fns';
import { differenceWith, isEqual, find } from 'lodash-es';
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
  const getOrdinalSuffix = (day) => {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const value = day % 100;
    return suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0];
  };
  const currentYear = new Date().getFullYear();
  const dateYear = date.getFullYear();
  const day = date.getDate();
  const month = format(date, 'MMMM');
  const dayWithSuffix = day + getOrdinalSuffix(day);

  if (isThisYear(date)) {
    return `${month} ${dayWithSuffix}`;
  } else {
    return `${month} ${dayWithSuffix}, ${dateYear}`;
  }
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
    // console.log(sorted);
    return sorted;
  }

  if (sortKey === 'startDate') {
    const sorted = items.sort((a, b) => {
      const hasADates = Array.isArray(a.dates);
      const hasBDates = Array.isArray(b.dates);

      // Case 1: Both have dates keys
      if (hasADates && hasBDates) {
        const dateA = new Date(a.dates[0]?.startDateTime);
        const dateB = new Date(b.dates[0]?.startDateTime);

        return order === 'ascending' ? dateA - dateB : dateB - dateA; // Sort based on the order
      }

      // Case 2: A has dates, B does not
      if (hasADates && !hasBDates) {
        return -1; // a comes before b
      }

      // Case 3: A does not have dates, B does
      if (!hasADates && hasBDates) {
        return 1; // b comes before a
      }

      // Case 4: Neither has dates keys (they stay in original order)
      return 0;
    });
    // console.log(sorted);
    return sorted;
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
    // console.log(backToTagIDs)
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
    return formattedDate;
  };

  const startFormatted = formatDate(startDate);
  const endFormatted = formatDate(endDate);
  const label = `${startFormatted ? startFormatted : ''} ${
    endFormatted ? '- ' : ''
  } ${endFormatted ? endFormatted : ''}`;
  return label;
};

/**
 * Given an end date in the format "YYYY-MM-DD", returns the next calendar date.
 *
 * @param {string} endDate - The end date in "YYYY-MM-DD" format.
 * @returns {string} - The next calendar date in "YYYY-MM-DD" format.
 */
export const getNextCalendarDate = (endDate) => {
  // Parse the input end date
  const [year, month, day] = endDate.split('-').map(Number);

  // Create a Date object from the end date
  const date = new Date(year, month - 1, day); // Month is zero-based in JavaScript Date

  // Add one day to the date
  date.setDate(date.getDate() + 1);

  // Extract the new date components
  const newYear = date.getFullYear();
  const newMonth = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const newDay = String(date.getDate()).padStart(2, '0');

  // Return the new date in "YYYY-MM-DD" format
  return `${newYear}-${newMonth}-${newDay}`;
};

// export const removeDeletedTagFromListItems = (
//   listItems,
//   tagID,
//   setListItems
// ) => {
//   const allListItemsThatHadTagIDinTags = listItems.filter((e) =>
//     e.tags?.includes(tagID)
//   );

//   const unchangedListItemsDidntHaveTag = listItems.filter(
//     (e) => !e.tags?.includes(tagID)
//   );
//   const updatedListItemsThatHadTag = allListItemsThatHadTagIDinTags.map(
//     (e) => ({
//       ...e,
//       tags: [...e.tags.filter((f) => f !== tagID)],
//     })
//   );
//   const updatedListItems = [
//     ...unchangedListItemsDidntHaveTag,
//     ...updatedListItemsThatHadTag,
//   ];
//   // set these updated list items in app .listItems state
//   setListItems(updatedListItems);
// };

export const convertToISOString = (value) => {
  // THIS IS FOR GCAL CONVERSION?! TO ENSURE AN UN-TIMED EVENT STARTS AT MIDNIGHT ON CORRECT DAY???
  if (value instanceof Date && !isNaN(value.getTime())) {
    // Convert local date to YYYY-MM-DD format
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } else if (typeof value === 'string' && !isNaN(Date.parse(value))) {
    // Convert string to Date object, then to YYYY-MM-DD format
    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return null;
};

export const dateTimeTo12Hour = (dateTime) => {
  const date = new Date(dateTime);
  if (date instanceof Date && !isNaN(date)) {
    let hours = date.getHours();
    let minutes = date.getMinutes();

    // Determine AM or PM
    let ampm = hours >= 12 ? 'PM' : 'AM';

    // Convert 24-hour format to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // If hours is 0, set it to 12 (for midnight)

    // Ensure minutes are two digits (e.g., 01, 05)
    minutes = minutes < 10 ? '0' + minutes : minutes;

    // Format the final time string
    let formattedTime = `${hours}:${minutes} ${ampm}`;
    return formattedTime;
  } else {
    return null;
  }
};

export const formatDateForListItem = (startDateTime) => {
  const date = new Date(startDateTime);

  // Check if the year is the current year
  if (isThisYear(date)) {
    // Format as 'Sep 16'
    return format(date, 'MMM d');
  } else {
    // Format as 'Sep 16, 2025'
    return format(date, 'MMM d, yyyy');
  }
};

export const formatDateString = (dateString) => {
  // Parse the input date string into a Date objectformatDateString
  const date = parseISO(dateString);

  // Get the day of the month
  const day = date.getDate();

  // Helper function to get the ordinal suffix
  const ordinalSuffix = (day) => {
    if (day >= 11 && day <= 13) return 'th'; // Special case for 11th, 12th, 13th
    switch (day % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  };

  // Format the date and append the ordinal suffix to the day
  const dayWithSuffix = day + ordinalSuffix(day);
  const formattedDate = `${format(date, 'EEEE •  MMM')} ${dayWithSuffix}`;

  return formattedDate;
};

export const createDateRange = (date, period) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  let start, end;

  if (period === 'month') {
    // Start: Midnight on the first day of the month (local time)
    start = new Date(year, month, 1, 0, 0, 0, 0); // Local midnight on the first day of the month

    // End: Last millisecond before midnight on the last day of the month (local time)
    end = new Date(year, month + 1, 0, 23, 59, 59, 999); // Last millisecond of the last day of the month
  } else if (period === 'week') {
    // Get the current day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const currentDayOfWeek = date.getDay();

    // Calculate the difference to the previous Monday
    const diffToMonday = (currentDayOfWeek + 6) % 7; // Days to subtract to get to Monday

    // Start: Midnight on the Monday of the week (local time)
    start = new Date(date);
    start.setDate(day - diffToMonday); // Adjust to previous Monday
    start.setHours(0, 0, 0, 0); // Set time to local midnight

    // End: Last millisecond before midnight on the following Sunday (local time)
    end = new Date(start);
    end.setDate(start.getDate() + 6); // Move to Sunday
    end.setHours(23, 59, 59, 999); // Set time to last millisecond of the day
  } else {
    throw new Error("Invalid period. Must be 'month' or 'week'.");
  }

  return {
    start, // Local time for the start of the month/week
    end, // Local time for the end of the month/week
  };
};

export const generateRangeDates = (start, end) => {
  // Initialize an empty array to store the results
  const datesArray = [];
  // Create a new Date object for start and end to avoid modifying original dates
  let currentDate = new Date(start);
  const endDate = new Date(end);
  // Loop through each day until we reach the end date
  while (currentDate <= endDate) {
    // Format the current date as YYYY-MM-DD and push it to the result array
    datesArray.push({
      date: format(currentDate, 'yyyy-MM-dd'), // Formatting the date as YYYY-MM-DD
    });
    // Move to the next day
    currentDate = addDays(currentDate, 1);
  }
  // Return the array of date objects
  return datesArray;
};

export const getEventsForDate = (targetDateStr, events) => {
  // Convert the provided date string (YYYY-MM-DD) to a local Date object
  const targetDate = new Date(targetDateStr);

  // Get the start and end of the day in local time
  const startOfDayLocal = new Date(targetDate);
  startOfDayLocal.setHours(0, 0, 0, 0); // Start of the day

  const endOfDayLocal = new Date(targetDate);
  endOfDayLocal.setHours(23, 59, 59, 999); // End of the day

  // Filter events based on the converted startDateTime values
  return events.filter((event) => {
    // Parse the event's startDateTime and convert to local time
    const eventDateUTC = new Date(event.startDateTime);
    const eventDateLocal = new Date(
      eventDateUTC.getTime() - eventDateUTC.getTimezoneOffset() * 60000
    );

    // Extract the local date part
    const eventDateLocalStr = eventDateLocal.toISOString().split('T')[0];

    // Check if the event's local date matches the target date
    return eventDateLocalStr === targetDateStr;
  });
};

export const times = [
  {
    display12: '12:00 AM',
    hour12: '12',
    hour24: '00',
    minute: '00',
    amPm: 'am',
  },
  {
    display12: '12:05 AM',
    hour12: '12',
    hour24: '00',
    minute: '05',
    amPm: 'am',
  },
  {
    display12: '12:10 AM',
    hour12: '12',
    hour24: '00',
    minute: '10',
    amPm: 'am',
  },
  {
    display12: '12:15 AM',
    hour12: '12',
    hour24: '00',
    minute: '15',
    amPm: 'am',
  },
  {
    display12: '12:20 AM',
    hour12: '12',
    hour24: '00',
    minute: '20',
    amPm: 'am',
  },
  {
    display12: '12:25 AM',
    hour12: '12',
    hour24: '00',
    minute: '25',
    amPm: 'am',
  },
  {
    display12: '12:30 AM',
    hour12: '12',
    hour24: '00',
    minute: '30',
    amPm: 'am',
  },
  {
    display12: '12:35 AM',
    hour12: '12',
    hour24: '00',
    minute: '35',
    amPm: 'am',
  },
  {
    display12: '12:40 AM',
    hour12: '12',
    hour24: '00',
    minute: '40',
    amPm: 'am',
  },
  {
    display12: '12:45 AM',
    hour12: '12',
    hour24: '00',
    minute: '45',
    amPm: 'am',
  },
  {
    display12: '12:50 AM',
    hour12: '12',
    hour24: '00',
    minute: '50',
    amPm: 'am',
  },
  {
    display12: '12:55 AM',
    hour12: '12',
    hour24: '00',
    minute: '55',
    amPm: 'am',
  },
  {
    display12: '1:00 AM',
    hour12: '1',
    hour24: '01',
    minute: '00',
    amPm: 'am',
  },
  {
    display12: '1:05 AM',
    hour12: '1',
    hour24: '01',
    minute: '05',
    amPm: 'am',
  },
  {
    display12: '1:10 AM',
    hour12: '1',
    hour24: '01',
    minute: '10',
    amPm: 'am',
  },
  {
    display12: '1:15 AM',
    hour12: '1',
    hour24: '01',
    minute: '15',
    amPm: 'am',
  },
  {
    display12: '1:20 AM',
    hour12: '1',
    hour24: '01',
    minute: '20',
    amPm: 'am',
  },
  {
    display12: '1:25 AM',
    hour12: '1',
    hour24: '01',
    minute: '25',
    amPm: 'am',
  },
  {
    display12: '1:30 AM',
    hour12: '1',
    hour24: '01',
    minute: '30',
    amPm: 'am',
  },
  {
    display12: '1:35 AM',
    hour12: '1',
    hour24: '01',
    minute: '35',
    amPm: 'am',
  },
  {
    display12: '1:40 AM',
    hour12: '1',
    hour24: '01',
    minute: '40',
    amPm: 'am',
  },
  {
    display12: '1:45 AM',
    hour12: '1',
    hour24: '01',
    minute: '45',
    amPm: 'am',
  },
  {
    display12: '1:50 AM',
    hour12: '1',
    hour24: '01',
    minute: '50',
    amPm: 'am',
  },
  {
    display12: '1:55 AM',
    hour12: '1',
    hour24: '01',
    minute: '55',
    amPm: 'am',
  },
  {
    display12: '2:00 AM',
    hour12: '2',
    hour24: '02',
    minute: '00',
    amPm: 'am',
  },
  {
    display12: '2:05 AM',
    hour12: '2',
    hour24: '02',
    minute: '05',
    amPm: 'am',
  },
  {
    display12: '2:10 AM',
    hour12: '2',
    hour24: '02',
    minute: '10',
    amPm: 'am',
  },
  {
    display12: '2:15 AM',
    hour12: '2',
    hour24: '02',
    minute: '15',
    amPm: 'am',
  },
  {
    display12: '2:20 AM',
    hour12: '2',
    hour24: '02',
    minute: '20',
    amPm: 'am',
  },
  {
    display12: '2:25 AM',
    hour12: '2',
    hour24: '02',
    minute: '25',
    amPm: 'am',
  },
  {
    display12: '2:30 AM',
    hour12: '2',
    hour24: '02',
    minute: '30',
    amPm: 'am',
  },
  {
    display12: '2:35 AM',
    hour12: '2',
    hour24: '02',
    minute: '35',
    amPm: 'am',
  },
  {
    display12: '2:40 AM',
    hour12: '2',
    hour24: '02',
    minute: '40',
    amPm: 'am',
  },
  {
    display12: '2:45 AM',
    hour12: '2',
    hour24: '02',
    minute: '45',
    amPm: 'am',
  },
  {
    display12: '2:50 AM',
    hour12: '2',
    hour24: '02',
    minute: '50',
    amPm: 'am',
  },
  {
    display12: '2:55 AM',
    hour12: '2',
    hour24: '02',
    minute: '55',
    amPm: 'am',
  },
  {
    display12: '3:00 AM',
    hour12: '3',
    hour24: '03',
    minute: '00',
    amPm: 'am',
  },
  {
    display12: '3:05 AM',
    hour12: '3',
    hour24: '03',
    minute: '05',
    amPm: 'am',
  },
  {
    display12: '3:10 AM',
    hour12: '3',
    hour24: '03',
    minute: '10',
    amPm: 'am',
  },
  {
    display12: '3:15 AM',
    hour12: '3',
    hour24: '03',
    minute: '15',
    amPm: 'am',
  },
  {
    display12: '3:20 AM',
    hour12: '3',
    hour24: '03',
    minute: '20',
    amPm: 'am',
  },
  {
    display12: '3:25 AM',
    hour12: '3',
    hour24: '03',
    minute: '25',
    amPm: 'am',
  },
  {
    display12: '3:30 AM',
    hour12: '3',
    hour24: '03',
    minute: '30',
    amPm: 'am',
  },
  {
    display12: '3:35 AM',
    hour12: '3',
    hour24: '03',
    minute: '35',
    amPm: 'am',
  },
  {
    display12: '3:40 AM',
    hour12: '3',
    hour24: '03',
    minute: '40',
    amPm: 'am',
  },
  {
    display12: '3:45 AM',
    hour12: '3',
    hour24: '03',
    minute: '45',
    amPm: 'am',
  },
  {
    display12: '3:50 AM',
    hour12: '3',
    hour24: '03',
    minute: '50',
    amPm: 'am',
  },
  {
    display12: '3:55 AM',
    hour12: '3',
    hour24: '03',
    minute: '55',
    amPm: 'am',
  },
  {
    display12: '4:00 AM',
    hour12: '4',
    hour24: '04',
    minute: '00',
    amPm: 'am',
  },
  {
    display12: '4:05 AM',
    hour12: '4',
    hour24: '04',
    minute: '05',
    amPm: 'am',
  },
  {
    display12: '4:10 AM',
    hour12: '4',
    hour24: '04',
    minute: '10',
    amPm: 'am',
  },
  {
    display12: '4:15 AM',
    hour12: '4',
    hour24: '04',
    minute: '15',
    amPm: 'am',
  },
  {
    display12: '4:20 AM',
    hour12: '4',
    hour24: '04',
    minute: '20',
    amPm: 'am',
  },
  {
    display12: '4:25 AM',
    hour12: '4',
    hour24: '04',
    minute: '25',
    amPm: 'am',
  },
  {
    display12: '4:30 AM',
    hour12: '4',
    hour24: '04',
    minute: '30',
    amPm: 'am',
  },
  {
    display12: '4:35 AM',
    hour12: '4',
    hour24: '04',
    minute: '35',
    amPm: 'am',
  },
  {
    display12: '4:40 AM',
    hour12: '4',
    hour24: '04',
    minute: '40',
    amPm: 'am',
  },
  {
    display12: '4:45 AM',
    hour12: '4',
    hour24: '04',
    minute: '45',
    amPm: 'am',
  },
  {
    display12: '4:50 AM',
    hour12: '4',
    hour24: '04',
    minute: '50',
    amPm: 'am',
  },
  {
    display12: '4:55 AM',
    hour12: '4',
    hour24: '04',
    minute: '55',
    amPm: 'am',
  },
  {
    display12: '5:00 AM',
    hour12: '5',
    hour24: '05',
    minute: '00',
    amPm: 'am',
  },
  {
    display12: '5:05 AM',
    hour12: '5',
    hour24: '05',
    minute: '05',
    amPm: 'am',
  },
  {
    display12: '5:10 AM',
    hour12: '5',
    hour24: '05',
    minute: '10',
    amPm: 'am',
  },
  {
    display12: '5:15 AM',
    hour12: '5',
    hour24: '05',
    minute: '15',
    amPm: 'am',
  },
  {
    display12: '5:20 AM',
    hour12: '5',
    hour24: '05',
    minute: '20',
    amPm: 'am',
  },
  {
    display12: '5:25 AM',
    hour12: '5',
    hour24: '05',
    minute: '25',
    amPm: 'am',
  },
  {
    display12: '5:30 AM',
    hour12: '5',
    hour24: '05',
    minute: '30',
    amPm: 'am',
  },
  {
    display12: '5:35 AM',
    hour12: '5',
    hour24: '05',
    minute: '35',
    amPm: 'am',
  },
  {
    display12: '5:40 AM',
    hour12: '5',
    hour24: '05',
    minute: '40',
    amPm: 'am',
  },
  {
    display12: '5:45 AM',
    hour12: '5',
    hour24: '05',
    minute: '45',
    amPm: 'am',
  },
  {
    display12: '5:50 AM',
    hour12: '5',
    hour24: '05',
    minute: '50',
    amPm: 'am',
  },
  {
    display12: '5:55 AM',
    hour12: '5',
    hour24: '05',
    minute: '55',
    amPm: 'am',
  },
  {
    display12: '6:00 AM',
    hour12: '6',
    hour24: '06',
    minute: '00',
    amPm: 'am',
  },
  {
    display12: '6:05 AM',
    hour12: '6',
    hour24: '06',
    minute: '05',
    amPm: 'am',
  },
  {
    display12: '6:10 AM',
    hour12: '6',
    hour24: '06',
    minute: '10',
    amPm: 'am',
  },
  {
    display12: '6:15 AM',
    hour12: '6',
    hour24: '06',
    minute: '15',
    amPm: 'am',
  },
  {
    display12: '6:20 AM',
    hour12: '6',
    hour24: '06',
    minute: '20',
    amPm: 'am',
  },
  {
    display12: '6:25 AM',
    hour12: '6',
    hour24: '06',
    minute: '25',
    amPm: 'am',
  },
  {
    display12: '6:30 AM',
    hour12: '6',
    hour24: '06',
    minute: '30',
    amPm: 'am',
  },
  {
    display12: '6:35 AM',
    hour12: '6',
    hour24: '06',
    minute: '35',
    amPm: 'am',
  },
  {
    display12: '6:40 AM',
    hour12: '6',
    hour24: '06',
    minute: '40',
    amPm: 'am',
  },
  {
    display12: '6:45 AM',
    hour12: '6',
    hour24: '06',
    minute: '45',
    amPm: 'am',
  },
  {
    display12: '6:50 AM',
    hour12: '6',
    hour24: '06',
    minute: '50',
    amPm: 'am',
  },
  {
    display12: '6:55 AM',
    hour12: '6',
    hour24: '06',
    minute: '55',
    amPm: 'am',
  },
  {
    display12: '7:00 AM',
    hour12: '7',
    hour24: '07',
    minute: '00',
    amPm: 'am',
  },
  {
    display12: '7:05 AM',
    hour12: '7',
    hour24: '07',
    minute: '05',
    amPm: 'am',
  },
  {
    display12: '7:10 AM',
    hour12: '7',
    hour24: '07',
    minute: '10',
    amPm: 'am',
  },
  {
    display12: '7:15 AM',
    hour12: '7',
    hour24: '07',
    minute: '15',
    amPm: 'am',
  },
  {
    display12: '7:20 AM',
    hour12: '7',
    hour24: '07',
    minute: '20',
    amPm: 'am',
  },
  {
    display12: '7:25 AM',
    hour12: '7',
    hour24: '07',
    minute: '25',
    amPm: 'am',
  },
  {
    display12: '7:30 AM',
    hour12: '7',
    hour24: '07',
    minute: '30',
    amPm: 'am',
  },
  {
    display12: '7:35 AM',
    hour12: '7',
    hour24: '07',
    minute: '35',
    amPm: 'am',
  },
  {
    display12: '7:40 AM',
    hour12: '7',
    hour24: '07',
    minute: '40',
    amPm: 'am',
  },
  {
    display12: '7:45 AM',
    hour12: '7',
    hour24: '07',
    minute: '45',
    amPm: 'am',
  },
  {
    display12: '7:50 AM',
    hour12: '7',
    hour24: '07',
    minute: '50',
    amPm: 'am',
  },
  {
    display12: '7:55 AM',
    hour12: '7',
    hour24: '07',
    minute: '55',
    amPm: 'am',
  },
  {
    display12: '8:00 AM',
    hour12: '8',
    hour24: '08',
    minute: '00',
    amPm: 'am',
  },
  {
    display12: '8:05 AM',
    hour12: '8',
    hour24: '08',
    minute: '05',
    amPm: 'am',
  },
  {
    display12: '8:10 AM',
    hour12: '8',
    hour24: '08',
    minute: '10',
    amPm: 'am',
  },
  {
    display12: '8:15 AM',
    hour12: '8',
    hour24: '08',
    minute: '15',
    amPm: 'am',
  },
  {
    display12: '8:20 AM',
    hour12: '8',
    hour24: '08',
    minute: '20',
    amPm: 'am',
  },
  {
    display12: '8:25 AM',
    hour12: '8',
    hour24: '08',
    minute: '25',
    amPm: 'am',
  },
  {
    display12: '8:30 AM',
    hour12: '8',
    hour24: '08',
    minute: '30',
    amPm: 'am',
  },
  {
    display12: '8:35 AM',
    hour12: '8',
    hour24: '08',
    minute: '35',
    amPm: 'am',
  },
  {
    display12: '8:40 AM',
    hour12: '8',
    hour24: '08',
    minute: '40',
    amPm: 'am',
  },
  {
    display12: '8:45 AM',
    hour12: '8',
    hour24: '08',
    minute: '45',
    amPm: 'am',
  },
  {
    display12: '8:50 AM',
    hour12: '8',
    hour24: '08',
    minute: '50',
    amPm: 'am',
  },
  {
    display12: '8:55 AM',
    hour12: '8',
    hour24: '08',
    minute: '55',
    amPm: 'am',
  },
  {
    display12: '9:00 AM',
    hour12: '9',
    hour24: '09',
    minute: '00',
    amPm: 'am',
  },
  {
    display12: '9:05 AM',
    hour12: '9',
    hour24: '09',
    minute: '05',
    amPm: 'am',
  },
  {
    display12: '9:10 AM',
    hour12: '9',
    hour24: '09',
    minute: '10',
    amPm: 'am',
  },
  {
    display12: '9:15 AM',
    hour12: '9',
    hour24: '09',
    minute: '15',
    amPm: 'am',
  },
  {
    display12: '9:20 AM',
    hour12: '9',
    hour24: '09',
    minute: '20',
    amPm: 'am',
  },
  {
    display12: '9:25 AM',
    hour12: '9',
    hour24: '09',
    minute: '25',
    amPm: 'am',
  },
  {
    display12: '9:30 AM',
    hour12: '9',
    hour24: '09',
    minute: '30',
    amPm: 'am',
  },
  {
    display12: '9:35 AM',
    hour12: '9',
    hour24: '09',
    minute: '35',
    amPm: 'am',
  },
  {
    display12: '9:40 AM',
    hour12: '9',
    hour24: '09',
    minute: '40',
    amPm: 'am',
  },
  {
    display12: '9:45 AM',
    hour12: '9',
    hour24: '09',
    minute: '45',
    amPm: 'am',
  },
  {
    display12: '9:50 AM',
    hour12: '9',
    hour24: '09',
    minute: '50',
    amPm: 'am',
  },
  {
    display12: '9:55 AM',
    hour12: '9',
    hour24: '09',
    minute: '55',
    amPm: 'am',
  },
  {
    display12: '10:00 AM',
    hour12: '10',
    hour24: '10',
    minute: '00',
    amPm: 'am',
  },
  {
    display12: '10:05 AM',
    hour12: '10',
    hour24: '10',
    minute: '05',
    amPm: 'am',
  },
  {
    display12: '10:10 AM',
    hour12: '10',
    hour24: '10',
    minute: '10',
    amPm: 'am',
  },
  {
    display12: '10:15 AM',
    hour12: '10',
    hour24: '10',
    minute: '15',
    amPm: 'am',
  },
  {
    display12: '10:20 AM',
    hour12: '10',
    hour24: '10',
    minute: '20',
    amPm: 'am',
  },
  {
    display12: '10:25 AM',
    hour12: '10',
    hour24: '10',
    minute: '25',
    amPm: 'am',
  },
  {
    display12: '10:30 AM',
    hour12: '10',
    hour24: '10',
    minute: '30',
    amPm: 'am',
  },
  {
    display12: '10:35 AM',
    hour12: '10',
    hour24: '10',
    minute: '35',
    amPm: 'am',
  },
  {
    display12: '10:40 AM',
    hour12: '10',
    hour24: '10',
    minute: '40',
    amPm: 'am',
  },
  {
    display12: '10:45 AM',
    hour12: '10',
    hour24: '10',
    minute: '45',
    amPm: 'am',
  },
  {
    display12: '10:50 AM',
    hour12: '10',
    hour24: '10',
    minute: '50',
    amPm: 'am',
  },
  {
    display12: '10:55 AM',
    hour12: '10',
    hour24: '10',
    minute: '55',
    amPm: 'am',
  },
  {
    display12: '11:00 AM',
    hour12: '11',
    hour24: '11',
    minute: '00',
    amPm: 'am',
  },
  {
    display12: '11:05 AM',
    hour12: '11',
    hour24: '11',
    minute: '05',
    amPm: 'am',
  },
  {
    display12: '11:10 AM',
    hour12: '11',
    hour24: '11',
    minute: '10',
    amPm: 'am',
  },
  {
    display12: '11:15 AM',
    hour12: '11',
    hour24: '11',
    minute: '15',
    amPm: 'am',
  },
  {
    display12: '11:20 AM',
    hour12: '11',
    hour24: '11',
    minute: '20',
    amPm: 'am',
  },
  {
    display12: '11:25 AM',
    hour12: '11',
    hour24: '11',
    minute: '25',
    amPm: 'am',
  },
  {
    display12: '11:30 AM',
    hour12: '11',
    hour24: '11',
    minute: '30',
    amPm: 'am',
  },
  {
    display12: '11:35 AM',
    hour12: '11',
    hour24: '11',
    minute: '35',
    amPm: 'am',
  },
  {
    display12: '11:40 AM',
    hour12: '11',
    hour24: '11',
    minute: '40',
    amPm: 'am',
  },
  {
    display12: '11:45 AM',
    hour12: '11',
    hour24: '11',
    minute: '45',
    amPm: 'am',
  },
  {
    display12: '11:50 AM',
    hour12: '11',
    hour24: '11',
    minute: '50',
    amPm: 'am',
  },
  {
    display12: '11:55 AM',
    hour12: '11',
    hour24: '11',
    minute: '55',
    amPm: 'am',
  },
  {
    display12: '12:00 PM',
    hour12: '12',
    hour24: '12',
    minute: '00',
    amPm: 'pm',
  },
  {
    display12: '12:05 PM',
    hour12: '12',
    hour24: '12',
    minute: '05',
    amPm: 'pm',
  },
  {
    display12: '12:10 PM',
    hour12: '12',
    hour24: '12',
    minute: '10',
    amPm: 'pm',
  },
  {
    display12: '12:15 PM',
    hour12: '12',
    hour24: '12',
    minute: '15',
    amPm: 'pm',
  },
  {
    display12: '12:20 PM',
    hour12: '12',
    hour24: '12',
    minute: '20',
    amPm: 'pm',
  },
  {
    display12: '12:25 PM',
    hour12: '12',
    hour24: '12',
    minute: '25',
    amPm: 'pm',
  },
  {
    display12: '12:30 PM',
    hour12: '12',
    hour24: '12',
    minute: '30',
    amPm: 'pm',
  },
  {
    display12: '12:35 PM',
    hour12: '12',
    hour24: '12',
    minute: '35',
    amPm: 'pm',
  },
  {
    display12: '12:40 PM',
    hour12: '12',
    hour24: '12',
    minute: '40',
    amPm: 'pm',
  },
  {
    display12: '12:45 PM',
    hour12: '12',
    hour24: '12',
    minute: '45',
    amPm: 'pm',
  },
  {
    display12: '12:50 PM',
    hour12: '12',
    hour24: '12',
    minute: '50',
    amPm: 'pm',
  },
  {
    display12: '12:55 PM',
    hour12: '12',
    hour24: '12',
    minute: '55',
    amPm: 'pm',
  },
  {
    display12: '1:00 PM',
    hour12: '1',
    hour24: '13',
    minute: '00',
    amPm: 'pm',
  },
  {
    display12: '1:05 PM',
    hour12: '1',
    hour24: '13',
    minute: '05',
    amPm: 'pm',
  },
  {
    display12: '1:10 PM',
    hour12: '1',
    hour24: '13',
    minute: '10',
    amPm: 'pm',
  },
  {
    display12: '1:15 PM',
    hour12: '1',
    hour24: '13',
    minute: '15',
    amPm: 'pm',
  },
  {
    display12: '1:20 PM',
    hour12: '1',
    hour24: '13',
    minute: '20',
    amPm: 'pm',
  },
  {
    display12: '1:25 PM',
    hour12: '1',
    hour24: '13',
    minute: '25',
    amPm: 'pm',
  },
  {
    display12: '1:30 PM',
    hour12: '1',
    hour24: '13',
    minute: '30',
    amPm: 'pm',
  },
  {
    display12: '1:35 PM',
    hour12: '1',
    hour24: '13',
    minute: '35',
    amPm: 'pm',
  },
  {
    display12: '1:40 PM',
    hour12: '1',
    hour24: '13',
    minute: '40',
    amPm: 'pm',
  },
  {
    display12: '1:45 PM',
    hour12: '1',
    hour24: '13',
    minute: '45',
    amPm: 'pm',
  },
  {
    display12: '1:50 PM',
    hour12: '1',
    hour24: '13',
    minute: '50',
    amPm: 'pm',
  },
  {
    display12: '1:55 PM',
    hour12: '1',
    hour24: '13',
    minute: '55',
    amPm: 'pm',
  },
  {
    display12: '2:00 PM',
    hour12: '2',
    hour24: '14',
    minute: '00',
    amPm: 'pm',
  },
  {
    display12: '2:05 PM',
    hour12: '2',
    hour24: '14',
    minute: '05',
    amPm: 'pm',
  },
  {
    display12: '2:10 PM',
    hour12: '2',
    hour24: '14',
    minute: '10',
    amPm: 'pm',
  },
  {
    display12: '2:15 PM',
    hour12: '2',
    hour24: '14',
    minute: '15',
    amPm: 'pm',
  },
  {
    display12: '2:20 PM',
    hour12: '2',
    hour24: '14',
    minute: '20',
    amPm: 'pm',
  },
  {
    display12: '2:25 PM',
    hour12: '2',
    hour24: '14',
    minute: '25',
    amPm: 'pm',
  },
  {
    display12: '2:30 PM',
    hour12: '2',
    hour24: '14',
    minute: '30',
    amPm: 'pm',
  },
  {
    display12: '2:35 PM',
    hour12: '2',
    hour24: '14',
    minute: '35',
    amPm: 'pm',
  },
  {
    display12: '2:40 PM',
    hour12: '2',
    hour24: '14',
    minute: '40',
    amPm: 'pm',
  },
  {
    display12: '2:45 PM',
    hour12: '2',
    hour24: '14',
    minute: '45',
    amPm: 'pm',
  },
  {
    display12: '2:50 PM',
    hour12: '2',
    hour24: '14',
    minute: '50',
    amPm: 'pm',
  },
  {
    display12: '2:55 PM',
    hour12: '2',
    hour24: '14',
    minute: '55',
    amPm: 'pm',
  },
  {
    display12: '3:00 PM',
    hour12: '3',
    hour24: '15',
    minute: '00',
    amPm: 'pm',
  },
  {
    display12: '3:05 PM',
    hour12: '3',
    hour24: '15',
    minute: '05',
    amPm: 'pm',
  },
  {
    display12: '3:10 PM',
    hour12: '3',
    hour24: '15',
    minute: '10',
    amPm: 'pm',
  },
  {
    display12: '3:15 PM',
    hour12: '3',
    hour24: '15',
    minute: '15',
    amPm: 'pm',
  },
  {
    display12: '3:20 PM',
    hour12: '3',
    hour24: '15',
    minute: '20',
    amPm: 'pm',
  },
  {
    display12: '3:25 PM',
    hour12: '3',
    hour24: '15',
    minute: '25',
    amPm: 'pm',
  },
  {
    display12: '3:30 PM',
    hour12: '3',
    hour24: '15',
    minute: '30',
    amPm: 'pm',
  },
  {
    display12: '3:35 PM',
    hour12: '3',
    hour24: '15',
    minute: '35',
    amPm: 'pm',
  },
  {
    display12: '3:40 PM',
    hour12: '3',
    hour24: '15',
    minute: '40',
    amPm: 'pm',
  },
  {
    display12: '3:45 PM',
    hour12: '3',
    hour24: '15',
    minute: '45',
    amPm: 'pm',
  },
  {
    display12: '3:50 PM',
    hour12: '3',
    hour24: '15',
    minute: '50',
    amPm: 'pm',
  },
  {
    display12: '3:55 PM',
    hour12: '3',
    hour24: '15',
    minute: '55',
    amPm: 'pm',
  },
  {
    display12: '4:00 PM',
    hour12: '4',
    hour24: '16',
    minute: '00',
    amPm: 'pm',
  },
  {
    display12: '4:05 PM',
    hour12: '4',
    hour24: '16',
    minute: '05',
    amPm: 'pm',
  },
  {
    display12: '4:10 PM',
    hour12: '4',
    hour24: '16',
    minute: '10',
    amPm: 'pm',
  },
  {
    display12: '4:15 PM',
    hour12: '4',
    hour24: '16',
    minute: '15',
    amPm: 'pm',
  },
  {
    display12: '4:20 PM',
    hour12: '4',
    hour24: '16',
    minute: '20',
    amPm: 'pm',
  },
  {
    display12: '4:25 PM',
    hour12: '4',
    hour24: '16',
    minute: '25',
    amPm: 'pm',
  },
  {
    display12: '4:30 PM',
    hour12: '4',
    hour24: '16',
    minute: '30',
    amPm: 'pm',
  },
  {
    display12: '4:35 PM',
    hour12: '4',
    hour24: '16',
    minute: '35',
    amPm: 'pm',
  },
  {
    display12: '4:40 PM',
    hour12: '4',
    hour24: '16',
    minute: '40',
    amPm: 'pm',
  },
  {
    display12: '4:45 PM',
    hour12: '4',
    hour24: '16',
    minute: '45',
    amPm: 'pm',
  },
  {
    display12: '4:50 PM',
    hour12: '4',
    hour24: '16',
    minute: '50',
    amPm: 'pm',
  },
  {
    display12: '4:55 PM',
    hour12: '4',
    hour24: '16',
    minute: '55',
    amPm: 'pm',
  },
  {
    display12: '5:00 PM',
    hour12: '5',
    hour24: '17',
    minute: '00',
    amPm: 'pm',
  },
  {
    display12: '5:05 PM',
    hour12: '5',
    hour24: '17',
    minute: '05',
    amPm: 'pm',
  },
  {
    display12: '5:10 PM',
    hour12: '5',
    hour24: '17',
    minute: '10',
    amPm: 'pm',
  },
  {
    display12: '5:15 PM',
    hour12: '5',
    hour24: '17',
    minute: '15',
    amPm: 'pm',
  },
  {
    display12: '5:20 PM',
    hour12: '5',
    hour24: '17',
    minute: '20',
    amPm: 'pm',
  },
  {
    display12: '5:25 PM',
    hour12: '5',
    hour24: '17',
    minute: '25',
    amPm: 'pm',
  },
  {
    display12: '5:30 PM',
    hour12: '5',
    hour24: '17',
    minute: '30',
    amPm: 'pm',
  },
  {
    display12: '5:35 PM',
    hour12: '5',
    hour24: '17',
    minute: '35',
    amPm: 'pm',
  },
  {
    display12: '5:40 PM',
    hour12: '5',
    hour24: '17',
    minute: '40',
    amPm: 'pm',
  },
  {
    display12: '5:45 PM',
    hour12: '5',
    hour24: '17',
    minute: '45',
    amPm: 'pm',
  },
  {
    display12: '5:50 PM',
    hour12: '5',
    hour24: '17',
    minute: '50',
    amPm: 'pm',
  },
  {
    display12: '5:55 PM',
    hour12: '5',
    hour24: '17',
    minute: '55',
    amPm: 'pm',
  },
  {
    display12: '6:00 PM',
    hour12: '6',
    hour24: '18',
    minute: '00',
    amPm: 'pm',
  },
  {
    display12: '6:05 PM',
    hour12: '6',
    hour24: '18',
    minute: '05',
    amPm: 'pm',
  },
  {
    display12: '6:10 PM',
    hour12: '6',
    hour24: '18',
    minute: '10',
    amPm: 'pm',
  },
  {
    display12: '6:15 PM',
    hour12: '6',
    hour24: '18',
    minute: '15',
    amPm: 'pm',
  },
  {
    display12: '6:20 PM',
    hour12: '6',
    hour24: '18',
    minute: '20',
    amPm: 'pm',
  },
  {
    display12: '6:25 PM',
    hour12: '6',
    hour24: '18',
    minute: '25',
    amPm: 'pm',
  },
  {
    display12: '6:30 PM',
    hour12: '6',
    hour24: '18',
    minute: '30',
    amPm: 'pm',
  },
  {
    display12: '6:35 PM',
    hour12: '6',
    hour24: '18',
    minute: '35',
    amPm: 'pm',
  },
  {
    display12: '6:40 PM',
    hour12: '6',
    hour24: '18',
    minute: '40',
    amPm: 'pm',
  },
  {
    display12: '6:45 PM',
    hour12: '6',
    hour24: '18',
    minute: '45',
    amPm: 'pm',
  },
  {
    display12: '6:50 PM',
    hour12: '6',
    hour24: '18',
    minute: '50',
    amPm: 'pm',
  },
  {
    display12: '6:55 PM',
    hour12: '6',
    hour24: '18',
    minute: '55',
    amPm: 'pm',
  },
  {
    display12: '7:00 PM',
    hour12: '7',
    hour24: '19',
    minute: '00',
    amPm: 'pm',
  },
  {
    display12: '7:05 PM',
    hour12: '7',
    hour24: '19',
    minute: '05',
    amPm: 'pm',
  },
  {
    display12: '7:10 PM',
    hour12: '7',
    hour24: '19',
    minute: '10',
    amPm: 'pm',
  },
  {
    display12: '7:15 PM',
    hour12: '7',
    hour24: '19',
    minute: '15',
    amPm: 'pm',
  },
  {
    display12: '7:20 PM',
    hour12: '7',
    hour24: '19',
    minute: '20',
    amPm: 'pm',
  },
  {
    display12: '7:25 PM',
    hour12: '7',
    hour24: '19',
    minute: '25',
    amPm: 'pm',
  },
  {
    display12: '7:30 PM',
    hour12: '7',
    hour24: '19',
    minute: '30',
    amPm: 'pm',
  },
  {
    display12: '7:35 PM',
    hour12: '7',
    hour24: '19',
    minute: '35',
    amPm: 'pm',
  },
  {
    display12: '7:40 PM',
    hour12: '7',
    hour24: '19',
    minute: '40',
    amPm: 'pm',
  },
  {
    display12: '7:45 PM',
    hour12: '7',
    hour24: '19',
    minute: '45',
    amPm: 'pm',
  },
  {
    display12: '7:50 PM',
    hour12: '7',
    hour24: '19',
    minute: '50',
    amPm: 'pm',
  },
  {
    display12: '7:55 PM',
    hour12: '7',
    hour24: '19',
    minute: '55',
    amPm: 'pm',
  },
  {
    display12: '8:00 PM',
    hour12: '8',
    hour24: '20',
    minute: '00',
    amPm: 'pm',
  },
  {
    display12: '8:05 PM',
    hour12: '8',
    hour24: '20',
    minute: '05',
    amPm: 'pm',
  },
  {
    display12: '8:10 PM',
    hour12: '8',
    hour24: '20',
    minute: '10',
    amPm: 'pm',
  },
  {
    display12: '8:15 PM',
    hour12: '8',
    hour24: '20',
    minute: '15',
    amPm: 'pm',
  },
  {
    display12: '8:20 PM',
    hour12: '8',
    hour24: '20',
    minute: '20',
    amPm: 'pm',
  },
  {
    display12: '8:25 PM',
    hour12: '8',
    hour24: '20',
    minute: '25',
    amPm: 'pm',
  },
  {
    display12: '8:30 PM',
    hour12: '8',
    hour24: '20',
    minute: '30',
    amPm: 'pm',
  },
  {
    display12: '8:35 PM',
    hour12: '8',
    hour24: '20',
    minute: '35',
    amPm: 'pm',
  },
  {
    display12: '8:40 PM',
    hour12: '8',
    hour24: '20',
    minute: '40',
    amPm: 'pm',
  },
  {
    display12: '8:45 PM',
    hour12: '8',
    hour24: '20',
    minute: '45',
    amPm: 'pm',
  },
  {
    display12: '8:50 PM',
    hour12: '8',
    hour24: '20',
    minute: '50',
    amPm: 'pm',
  },
  {
    display12: '8:55 PM',
    hour12: '8',
    hour24: '20',
    minute: '55',
    amPm: 'pm',
  },
  {
    display12: '9:00 PM',
    hour12: '9',
    hour24: '21',
    minute: '00',
    amPm: 'pm',
  },
  {
    display12: '9:05 PM',
    hour12: '9',
    hour24: '21',
    minute: '05',
    amPm: 'pm',
  },
  {
    display12: '9:10 PM',
    hour12: '9',
    hour24: '21',
    minute: '10',
    amPm: 'pm',
  },
  {
    display12: '9:15 PM',
    hour12: '9',
    hour24: '21',
    minute: '15',
    amPm: 'pm',
  },
  {
    display12: '9:20 PM',
    hour12: '9',
    hour24: '21',
    minute: '20',
    amPm: 'pm',
  },
  {
    display12: '9:25 PM',
    hour12: '9',
    hour24: '21',
    minute: '25',
    amPm: 'pm',
  },
  {
    display12: '9:30 PM',
    hour12: '9',
    hour24: '21',
    minute: '30',
    amPm: 'pm',
  },
  {
    display12: '9:35 PM',
    hour12: '9',
    hour24: '21',
    minute: '35',
    amPm: 'pm',
  },
  {
    display12: '9:40 PM',
    hour12: '9',
    hour24: '21',
    minute: '40',
    amPm: 'pm',
  },
  {
    display12: '9:45 PM',
    hour12: '9',
    hour24: '21',
    minute: '45',
    amPm: 'pm',
  },
  {
    display12: '9:50 PM',
    hour12: '9',
    hour24: '21',
    minute: '50',
    amPm: 'pm',
  },
  {
    display12: '9:55 PM',
    hour12: '9',
    hour24: '21',
    minute: '55',
    amPm: 'pm',
  },
  {
    display12: '10:00 PM',
    hour12: '10',
    hour24: '22',
    minute: '00',
    amPm: 'pm',
  },
  {
    display12: '10:05 PM',
    hour12: '10',
    hour24: '22',
    minute: '05',
    amPm: 'pm',
  },
  {
    display12: '10:10 PM',
    hour12: '10',
    hour24: '22',
    minute: '10',
    amPm: 'pm',
  },
  {
    display12: '10:15 PM',
    hour12: '10',
    hour24: '22',
    minute: '15',
    amPm: 'pm',
  },
  {
    display12: '10:20 PM',
    hour12: '10',
    hour24: '22',
    minute: '20',
    amPm: 'pm',
  },
  {
    display12: '10:25 PM',
    hour12: '10',
    hour24: '22',
    minute: '25',
    amPm: 'pm',
  },
  {
    display12: '10:30 PM',
    hour12: '10',
    hour24: '22',
    minute: '30',
    amPm: 'pm',
  },
  {
    display12: '10:35 PM',
    hour12: '10',
    hour24: '22',
    minute: '35',
    amPm: 'pm',
  },
  {
    display12: '10:40 PM',
    hour12: '10',
    hour24: '22',
    minute: '40',
    amPm: 'pm',
  },
  {
    display12: '10:45 PM',
    hour12: '10',
    hour24: '22',
    minute: '45',
    amPm: 'pm',
  },
  {
    display12: '10:50 PM',
    hour12: '10',
    hour24: '22',
    minute: '50',
    amPm: 'pm',
  },
  {
    display12: '10:55 PM',
    hour12: '10',
    hour24: '22',
    minute: '55',
    amPm: 'pm',
  },
  {
    display12: '11:00 PM',
    hour12: '11',
    hour24: '23',
    minute: '00',
    amPm: 'pm',
  },
  {
    display12: '11:05 PM',
    hour12: '11',
    hour24: '23',
    minute: '05',
    amPm: 'pm',
  },
  {
    display12: '11:10 PM',
    hour12: '11',
    hour24: '23',
    minute: '10',
    amPm: 'pm',
  },
  {
    display12: '11:15 PM',
    hour12: '11',
    hour24: '23',
    minute: '15',
    amPm: 'pm',
  },
  {
    display12: '11:20 PM',
    hour12: '11',
    hour24: '23',
    minute: '20',
    amPm: 'pm',
  },
  {
    display12: '11:25 PM',
    hour12: '11',
    hour24: '23',
    minute: '25',
    amPm: 'pm',
  },
  {
    display12: '11:30 PM',
    hour12: '11',
    hour24: '23',
    minute: '30',
    amPm: 'pm',
  },
  {
    display12: '11:35 PM',
    hour12: '11',
    hour24: '23',
    minute: '35',
    amPm: 'pm',
  },
  {
    display12: '11:40 PM',
    hour12: '11',
    hour24: '23',
    minute: '40',
    amPm: 'pm',
  },
  {
    display12: '11:45 PM',
    hour12: '11',
    hour24: '23',
    minute: '45',
    amPm: 'pm',
  },
  {
    display12: '11:50 PM',
    hour12: '11',
    hour24: '23',
    minute: '50',
    amPm: 'pm',
  },
  {
    display12: '11:55 PM',
    hour12: '11',
    hour24: '23',
    minute: '55',
    amPm: 'pm',
  },
];
