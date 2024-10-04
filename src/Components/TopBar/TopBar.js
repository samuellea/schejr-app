import React from 'react';
import styles from './TopBar.module.css';
import ChevronIcon from '../Icons/ChevronIcon';
import LogoutIcon from '../Icons/LogoutIcon';
import DateIcon from '../Icons/DateIcon';

function TopBar({
  toggleSidebar,
  showSidebar,
  displayName,
  setShowLogoutModal,
}) {
  return (
    <div className={styles.container}>
      <div className={styles.listsHeader}>
        <div
          role="button"
          className={styles.topbarButton}
          onClick={toggleSidebar}
          id={styles.toggleSidebar}
        >
          <ChevronIcon
            fill="white"
            width="16px"
            flip={showSidebar ? '0' : '180'}
          />
        </div>
        {showSidebar ? (
          <p className={styles.topbarText} id={styles.sidebarHeader}>
            {displayName}'s lists
          </p>
        ) : null}
        {!showSidebar ? (
          <>
            <DateIcon fill="white" width="16px" />
            <p className={styles.topbarText} id={styles.showListsLabel}>
              Show lists
            </p>
          </>
        ) : null}
      </div>
      <div className={styles.logoutContainer}>
        <div
          className={styles.logoutButton}
          onClick={() => setShowLogoutModal(true)}
        >
          <span>Log out</span>
          <LogoutIcon fill="white" width="18px" margin="2px 0px 0px 0px" />
        </div>
      </div>
    </div>
  );
}

export default TopBar;

/*

      


        <div
          role="button"
          className={styles.listsHeaderButton}
          onClick={createList}
        >
          <EditIcon fill="white" width="16px" />
        </div>

*/
