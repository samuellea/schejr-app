import React from 'react';
import styles from './TopBar.module.css';
import ChevronIcon from '../Icons/ChevronIcon';
import LogoutIcon from '../Icons/LogoutIcon';
import TagsIcon from '../Icons/TagsIcon';
import EditIcon from '../Icons/EditIcon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';

function TopBar({
  toggleSidebar,
  showSidebar,
  displayName,
  setShowLogoutModal,
  createList,
  discrDisable,
  listItemEditID,
  setShowSettings,
}) {
  return (
    <div className={styles.container}>
      {/* {listItemEditID !== null ? ( */}
      <div
        className={styles.listsHeader}
        style={{
          borderRight: showSidebar
            ? '1px solid rgba(155, 155, 155, 0.151)'
            : 'none',
          // minWidth: '20%',
        }}
      >
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
          <>
            <p className={styles.topbarText} id={styles.sidebarHeader}>
              {displayName.match(/^[^ ]+/)[0]}'s lists
            </p>

            <div
              role="button"
              className={styles.topbarButton}
              onClick={createList}
              id={styles.createList}
              style={{ pointerEvents: discrDisable ? 'none' : null }}
            >
              <EditIcon fill="white" width="16px" />
            </div>
          </>
        ) : null}
        {!showSidebar ? (
          <>
            <TagsIcon fill="white" width="16px" />
            <p className={styles.topbarText} id={styles.showListsLabel}>
              Show lists
            </p>
          </>
        ) : null}
      </div>
      {/* ) : null} */}
      <div className={styles.logoutContainer}>
        <div
          className={styles.settingsButton}
          onClick={() => setShowSettings(true)}
        >
          <FontAwesomeIcon
            icon={faCog}
            pointerEvents="none"
            style={{ margin: '0px 0px', color: 'white', fontSize: '16px' }}
          />
        </div>
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
