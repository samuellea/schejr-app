import React, { useEffect } from 'react';
import styles from './ConfirmDeleteModal.module.css';

function ConfirmDeleteModal({
  message,
  handleConfirm,
  handleCancel,
  confirmLabel,
}) {
  const confirmDeleteCombined = `${styles.confirmDeleteButton} ${styles.deleteModalButton}`;
  const cancelDeleteCombined = `${styles.cancelDeleteButton} ${styles.deleteModalButton}`;

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleConfirm();
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      handleCancel();
    }
  };

  useEffect(() => {
    // Attach event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className={styles.deleteModalBackground}>
      <div className={styles.deleteModal}>
        <p styles={styles.deleteModalP}>{message}</p>
        <button className={confirmDeleteCombined} onClick={handleConfirm}>
          {confirmLabel}
        </button>
        <button className={cancelDeleteCombined} onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default ConfirmDeleteModal;
