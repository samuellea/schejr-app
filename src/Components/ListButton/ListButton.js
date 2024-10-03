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
  // handleDeleteList,
  deleteListAndRelated,
  setListDeleteBackground,
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const combined = `${styles.container} ${selected ? styles.selected : null}`;

  const handleShowDeleteModal = (flag) => {
    setListDeleteBackground(flag);
    setShowDeleteModal(flag);
  };

  const handleConfirmDeleteList = async () => {
    const listTitle = listName;
    try {
      await deleteListAndRelated(listID);
      setListDeleteBackground(false);
      setShowDeleteModal(false);
      toast(`Deleted ${listTitle}`, {
        duration: 3000,
      });
    } catch (error) {
      toast(`Problem deleting ${listTitle}`, {
        duration: 3000,
      });
      setListDeleteBackground(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className={combined} key={`listButton-${listID}`}>
      <div
        className={styles.listTitleWrapper}
        onClick={() => handleSelectListButton(listID)}
      >
        <TagsIcon />
        <p className={styles.listTitle}>{listName}</p>
      </div>
      <div className={styles.trashCanWrapper}>
        <div
          role="button"
          className={styles.deleteListButton}
          onClick={() => handleShowDeleteModal(true)}
        >
          <TrashIcon fill="#9b9b9b" width="16px" />
        </div>
      </div>

      {showDeleteModal ? (
        <ConfirmDeleteModal
          message={`Delete list ${listName}?`}
          handleConfirm={() => handleConfirmDeleteList()}
          handleCancel={() => handleShowDeleteModal(false)}
          confirmLabel="Delete"
        />
      ) : null}
    </div>
  );
}

export default ListButton;
