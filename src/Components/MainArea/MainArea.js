import React, { useState } from 'react';
import styles from './MainArea.module.css';
import List from '../List/List';
import ListItemEditPane from '../ListItemEditPane/ListItemEditPane';

function MainArea({ selectedList, updateList, userUID }) {
  // will show either the selected List, or if a list item is selected, a List Item expanded view
  const [listItemToEdit, setListItemToEdit] = useState(null);

  const handleEditListItem = (listItem) => {
    setListItemToEdit(listItem);
  };

  const handleCloseEditPane = () => {
    setListItemToEdit(null);
  };

  return (
    <div className={styles.container}>
      {selectedList ? (
        <List
          selectedList={selectedList}
          updateList={updateList}
          userUID={userUID}
          handleEditListItem={handleEditListItem}
        />
      ) : null}
      {listItemToEdit ? (
        <ListItemEditPane
          listItem={listItemToEdit}
          handleCloseEditPane={handleCloseEditPane}
        />
      ) : null}
    </div>
  );
}

export default MainArea;
