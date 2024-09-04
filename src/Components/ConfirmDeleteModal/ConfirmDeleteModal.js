import React from 'react';
import styles from './ConfirmDeleteModal.module.css';

function ConfirmDeleteModal({ message, handleConfirm, handleCancel }) {
  const confirmDeleteCombined = `${styles.confirmDeleteButton} ${styles.deleteModalButton}`;
  const cancelDeleteCombined = `${styles.cancelDeleteButton} ${styles.deleteModalButton}`;
  return (
    <div className={styles.deleteModalBackground}>
      <div className={styles.deleteModal}>
        <p styles={styles.deleteModalP}>{message}</p>
        <button className={confirmDeleteCombined} onClick={handleConfirm}>
          Delete
        </button>
        <button className={cancelDeleteCombined} onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default ConfirmDeleteModal;
