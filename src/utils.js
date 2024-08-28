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
} from 'firebase/database';

export const createNewList = async (listData) => {
  try {
    // Create a reference to the 'lists' endpoint
    const listsRef = ref(database, 'lists');
    // Generate a new key under the 'lists' endpoint
    const newListRef = push(listsRef);
    // Set the data at the new reference
    await set(newListRef, listData);
    console.log('New list created with ID:', newListRef.key);
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
    console.log('Object updated successfully');
  } catch (error) {
    console.error('Error updating list:', error);
    throw error;
  }
};

export const patchListItem = async (listItemID, newData) => {
  console.log(listItemID);
  console.log(newData);
  try {
    const listItemRef = ref(database, `listItems/${listItemID}`);
    await update(listItemRef, newData);
    console.log('Object updated successfully');
  } catch (error) {
    console.error('Error updating list item:', error);
    throw error;
  }
};

export const patchTag = async (tagID, newData) => {
  try {
    const tagRef = ref(database, `tags/${tagID}`);
    await update(tagRef, newData);
    console.log('Tag updated successfully');
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
      console.log('No lists found for the user.');
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
    console.log('Object deleted successfully');
  } catch (error) {
    console.error('Error deleting list:', error);
    throw error;
  }
};

export const deleteTagByID = async (tagID) => {
  try {
    const objectRef = ref(database, `tags/${tagID}`);
    await remove(objectRef);
    console.log('Tag deleted successfully');
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
    console.log('New list item created with ID:', newListItemRef.key);
    return newListItemRef.key; // Return the unique ID of the newly created list
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
      console.log('No list itmes found for this list.');
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
    console.log('List item deleted successfully');
  } catch (error) {
    console.error('Error deleting list item:', error);
    throw error;
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
      console.log('No tags found for this user.');
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
    console.log('New tag created with ID:', newTagRef.key);
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

      // console.log(updates);
      // only sending tags! ensure all other information for each listItem object is included!
      // Perform batch update
      if (Object.keys(updates).length > 0) {
        await update(ref(database), updates);
        console.log('Removed tag from all matching list items');
      } else {
        console.log('No items needed updating.');
      }
    } else {
      console.log('No items found.');
    }
  } catch (error) {
    console.error('Error updating items:', error);
  }
};
