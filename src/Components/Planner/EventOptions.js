import React, { useRef, useEffect } from 'react';
import styles from './EventOptions.module.css';
import EditIcon from '../Icons/EditIcon';
import DuplicateIcon from '../Icons/DuplicateIcon';
import TrashIcon from '../Icons/TrashIcon';

function EventOptions({
  handleEdit,
  handleDuplicate,
  handleStartDelete,
  showOptions,
  setShowOptions,
  optionsPosition,
}) {
  const optionsRef = useRef(null);

  const handleClickOutside = (event) => {
    if (optionsRef.current && !optionsRef.current.contains(event.target)) {
      setShowOptions({ show: false });
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div
      className={styles.eventOptionsMenu}
      ref={optionsRef}
      style={{ [showOptions.position]: '100%' }}
    >
      <div className={styles.eventOptionsMenuButton} onClick={handleEdit}>
        <EditIcon fill="white" width="16px" marginTop="0px" />
        <span>Edit</span>
      </div>
      <div className={styles.eventOptionsMenuButton} onClick={handleDuplicate}>
        <DuplicateIcon fill="white" width="16px" />
        <span>Duplicate</span>
      </div>
      <div
        className={styles.eventOptionsMenuButton}
        onClick={handleStartDelete}
      >
        <TrashIcon fill="white" width="16px" />
        <span>Delete</span>
      </div>
    </div>
  );
}

export default EventOptions;
