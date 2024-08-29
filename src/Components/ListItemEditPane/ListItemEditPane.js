import React, { useState } from 'react';
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
  const [listItemRenameText, setListItemRenameText] = useState(listItem.title);

  const handleTitleChange = (e) => {
    const text = e.target.value;
    setListItemRenameText(text);
    // updateListItem(listItem.listItemID, 'title', text);
  };

  const handleTitleOnBlur = () => {
    updateListItem(listItem.listItemID, 'title', listItemRenameText);
  };

  return (
    <div className={styles.container}>
      <button onClick={handleCloseEditPane}>《</button>
      <input
        className={styles.listTitleInput}
        type="text"
        id="listTitle"
        onChange={(event) => handleTitleChange(event)}
        value={listItemRenameText}
        onBlur={handleTitleOnBlur}
      ></input>
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
