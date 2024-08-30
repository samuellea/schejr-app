import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MainArea from '../MainArea/MainArea';
import styles from './Home.module.css';
import Sidebar from '../Sidebar/Sidebar';
import TopBar from '../TopBar/TopBar';
import * as u from '../../utils';
import * as h from '../../helpers';
import { DragDropContext } from '@hello-pangea/dnd'; // Updated import

function Home() {
  const [listsModified, setListsModified] = useState(false);
  const [lists, setLists] = useState([]);
  const [selectedListID, setSelectedListID] = useState(null);
  const [sidebarListSortOn, setSidebarListSortOn] = useState('createdAt');
  const [sidebarListAscending, setSidebarListAscending] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [listItemToEdit, setListItemToEdit] = useState(null);
  const [listItemsModified, setListItemsModified] = useState(false);

  const navigate = useNavigate();
  const userUID = localStorage.getItem('firebaseID');

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      // Item was dropped outside a droppable area
      console.log('Item was dropped outside any droppable area.');
      return;
    }

    console.log('Drag result:', result);
    console.log('Destination:', destination);
    console.log('Source:', source);
    console.log('Draggable ID:', draggableId);

    // handle dragging a ListItem to a different ListButton
    if (
      destination.droppableId !== 'list' &&
      destination.droppableId !== 'main-area'
    ) {
      const listItemID = draggableId;
      const destinationListID = destination.droppableId; // id of the List you're moving it to
      // update parentID and manualOrder

      // fetch the highest manual order value present on this List
      try {
        const maxManualOrderOnDestinationList =
          await u.getMaxManualOrderByParentID(destinationListID);
        const updates = {
          parentID: destinationListID,
          manualOrder: maxManualOrderOnDestinationList + 1,
        };
        console.log('listItemID: ', listItemID);
        console.log('updates: ', updates);
        try {
          const updatedListItem = await u.patchListItem(listItemID, updates);
          setListItemsModified(true);
        } catch (error) {
          console.log(error);
        }
      } catch (error) {}
    }

    // handle draggin a ListItem to a different order within a List
    if (destination.droppableId === 'list') {
      console.log('LIST!');
      const newManualOrderValue = destination.index + 1;
      const listItemID = draggableId;
    }
  };

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

      if (listsModified) {
        // Reset state whenever setListsModified(true) is called
        setListsModified(false);
      }
    };
    fetchLists();
  }, [listsModified]);

  const timeoutIdRef = useRef(null);

  useEffect(() => {
    autoSave();
  }, [lists]);

  useEffect(() => {
    console.log(selectedListID);
  }, [selectedListID]);

  const autoSave = () => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current); // Step 3: Clear any existing timeout
    }

    timeoutIdRef.current = setTimeout(() => {
      if (selectedListID) {
        const selectedListObj = lists.filter(
          (e) => e.listID === selectedListID
        )[0];
        const { createdAt, createdBy, title } = selectedListObj;
        const updatedListData = {
          createdAt,
          createdBy,
          title, // ADD OTHER FIELDS WHEN IMPLEMENTED! 🚨🚨🚨
        };
        console.log(selectedListID, ' <-- selectedListID');
        u.patchList(selectedListID, updatedListData);
      }
    }, 1000); // Set a new timeout for 2 seconds
  };

  const handleLogout = () => {
    console.log('Logging out user due to token expiration...');
    // Perform your logout logic here
    // Clear any user-related state or storage
    // Redirect to the login page
    localStorage.removeItem('email');
    localStorage.removeItem('firebaseID');
    localStorage.removeItem('expires');
    navigate('/login');
  };

  // Function which updates the list object (by id) in lists state - a separate, timed function will then update this list object on firebase
  const updateList = (listID, field, value) => {
    let newValue = value;
    if (field === 'title' && value === '') newValue = 'Untitled';

    const updatedListObj = {
      ...lists.filter((e) => e.listID === listID)[0],
      [field]: newValue,
    };

    const listsMinusUpdated = lists.filter((e) => e.listID !== listID);

    const listsPlusUpdated = [...listsMinusUpdated, updatedListObj];
    console.log(listsPlusUpdated);
    setLists(listsPlusUpdated);
  };

  const updateListItem = async (listItemID, field, value) => {
    // Function that can update name, tags, startTime and endTime for a list item object on FB
    const { listItemID: unneededListItemID, ...rest } = listItemToEdit;
    const updatedListItem = {
      ...rest,
      [field]: value,
    };
    try {
      const listItemUpdated = await u.patchListItem(
        listItemToEdit.listItemID,
        updatedListItem
      );
      setListItemsModified(true);
    } catch (error) {
      console.error('Failed to update list item:', error);
    }
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className={styles.container}>
        <TopBar toggleSidebar={toggleSidebar} />
        <MainArea
          selectedList={lists.find((e) => e.listID === selectedListID)}
          updateList={updateList}
          updateListItem={updateListItem}
          userUID={userUID}
          listItemToEdit={listItemToEdit}
          setListItemToEdit={setListItemToEdit}
          listItemsModified={listItemsModified}
          setListItemsModified={setListItemsModified}
        />
        <Sidebar
          userUID={userUID}
          sortedLists={h.sortByProperty(
            lists,
            sidebarListSortOn,
            sidebarListAscending
          )}
          selectedListID={selectedListID}
          setSelectedListID={setSelectedListID}
          setListsModified={setListsModified}
          toggleSidebar={toggleSidebar}
          showSidebar={showSidebar}
        />
      </div>
    </DragDropContext>
  );
}

export default Home;
