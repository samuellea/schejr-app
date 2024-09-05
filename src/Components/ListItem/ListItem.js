import React, { useState, useEffect, useRef } from 'react';
import styles from './ListItem.module.css';
import * as u from '../../utils';
import * as h from '../../helpers';
import TrashIcon from '../Icons/TrashIcon';
import EditIcon from '../Icons/EditIcon';
import DragIcon from '../Icons/DragIcon';
import ConfirmDeleteModal from '../ConfirmDeleteModal/ConfirmDeleteModal';
import toast from 'react-hot-toast';

function ListItem({
  listItem,
  handleEditListItem,
  existingTags,
  deleteListItem,
  updateListItem,
}) {
  const [listItemRenameText, setListItemRenameText] = useState(listItem.title);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleTitleChange = (e) => {
    const text = e.target.value;
    setListItemRenameText(text);
  };

  const handleTitleOnBlur = () => {
    updateListItem(listItem, 'title', listItemRenameText);
  };

  useEffect(() => {
    setListItemRenameText(listItem.title);
  }, [listItem]);

  const inputRef = useRef(null);

  useEffect(() => {
    const adjustInputWidth = () => {
      if (inputRef.current) {
        const span = document.createElement('span');
        span.style.visibility = 'hidden';
        span.style.whiteSpace = 'nowrap';
        span.style.fontSize = getComputedStyle(inputRef.current).fontSize;
        span.style.fontWeight = getComputedStyle(inputRef.current).fontWeight;
        span.textContent = listItemRenameText || inputRef.current.placeholder;
        document.body.appendChild(span);

        inputRef.current.style.width = `${span.offsetWidth + 20}px`; // Add a small buffer

        document.body.removeChild(span);
      }
    };

    adjustInputWidth();
  }, [listItemRenameText]); // Adjust width whenever inputValue changes

  const handleConfirmDeleteListItem = async (listItem) => {
    const listItemTitle = listItem.title;
    try {
      await deleteListItem(listItem);
      setShowDeleteModal(false);
      toast(`Deleted ${listItemTitle}`, {
        duration: 3000,
      });
    } catch (error) {
      toast(`Problem deleting ${listItemTitle}`, {
        duration: 3000,
      });
      setShowDeleteModal(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.listItemDragHandle}>
        <DragIcon fill="#9b9b9b" />
      </div>

      <button
        className={styles.editListItemButton}
        onClick={() => handleEditListItem(listItem.listItemID)}
      >
        <EditIcon fill="#9b9b9b" width="16px" />
      </button>
      <div className={styles.titleTagsDatesWrapper}>
        {/* <p className={styles.listItemTitle}>{listItem.title}</p> */}
        <input
          className={styles.listItemTitle}
          onChange={handleTitleChange}
          onBlur={handleTitleOnBlur}
          value={listItemRenameText}
          id="flexidiv"
          ref={inputRef}
        />
        <div className={styles.tagsContainer} id="flexidiv">
          {listItem?.tags?.map((tag) => {
            const matchingTag = existingTags?.find(
              (existingTag) => existingTag.tagID === tag
            );
            return (
              <div
                className={styles.tag}
                key={`list-item-inner-${tag}`}
                style={{ backgroundColor: matchingTag?.color }}
              >
                {matchingTag?.name}
              </div>
            );
          })}
        </div>
        {h.dateLabel(listItem.date) ? (
          <div className={styles.dateContainer} id="flexidiv">
            {h.dateLabel(listItem.date)}
          </div>
        ) : null}
        {/* <div className={styles.first} id={styles.flexidiv}>
          title
        </div>
        <div className={styles.second} id={styles.flexidiv}>
          tag tag tag tag tag tag tag tag tag tag tag tag tag tag tag tag tag
          tag tag tag
        </div>
        <div className={styles.third} id={styles.flexidiv}>
          date date date
        </div> */}
        <button
          className={styles.deleteListItemButton}
          onClick={() => setShowDeleteModal(true)}
        >
          <TrashIcon fill="#9b9b9b" width="16px" />
        </button>
      </div>
      {showDeleteModal ? (
        <ConfirmDeleteModal
          message="Are you sure you want to delete this option?"
          handleConfirm={() => handleConfirmDeleteListItem(listItem)}
          handleCancel={() => setShowDeleteModal(false)}
          confirmLabel="Delete"
        />
      ) : null}
    </div>
  );
}

export default ListItem;
