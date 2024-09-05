import React, { useState } from 'react';
import styles from './ListButton.module.css';
import * as u from '../../utils';
import TagsIcon from '../Icons/TagsIcon';
import TrashIcon from '../Icons/TrashIcon';
import ConfirmDeleteModal from '../ConfirmDeleteModal/ConfirmDeleteModal';
import toast from 'react-hot-toast';

function ListButton({
  listName,
  createdAt,
  listID,
  handleSelectListButton,
  selected,
  handleDeleteList,
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const combined = `${styles.container} ${selected ? styles.selected : null}`;

  const handleConfirmDeleteList = async () => {
    const listTitle = listName;
    try {
      await handleDeleteList(listID);
      setShowDeleteModal(false);
      toast(`Deleted ${listTitle}`, {
        duration: 3000,
      });
    } catch (error) {
      toast(`Problem deleting ${listTitle}`, {
        duration: 3000,
      });
      setShowDeleteModal(false);
    }
  };

  return (
    <div
      className={combined}
      onClick={() => handleSelectListButton(listID)}
      key={`listButton-${listID}`}
    >
      <TagsIcon />
      <p className={styles.listTitle}>{listName}</p>
      <div
        role="button"
        className={styles.deleteListButton}
        onClick={() => setShowDeleteModal(true)}
      >
        <TrashIcon fill="#9b9b9b" width="16px" />
      </div>
      {showDeleteModal ? (
        <ConfirmDeleteModal
          message="Are you sure you want to delete this option?"
          handleConfirm={() => handleConfirmDeleteList()}
          handleCancel={() => setShowDeleteModal(false)}
          confirmLabel="Delete"
        />
      ) : null}
    </div>
  );
}

export default ListButton;
