import React from 'react';
import styles from './ListItemEditPane.module.css';
import TagSelector from '../TagSelector/TagSelector';

function ListItemEditPane({
  listItem,
  handleCloseEditPane,
  userUID,
  updateListItem,
  setListItemsModified,
  fetchTags,
  existingTags,
}) {
  return (
    <div className={styles.container}>
      <button onClick={handleCloseEditPane}>《</button>
      <h1>Edit</h1>
      <TagSelector
        userUID={userUID}
        listItem={listItem}
        updateListItem={updateListItem}
        setListItemsModified={setListItemsModified}
        fetchTags={fetchTags}
        existingTags={existingTags}
      />
    </div>
  );
}

export default ListItemEditPane;
