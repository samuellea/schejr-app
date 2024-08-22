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
