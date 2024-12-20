import React, { useState, useRef, useEffect } from 'react';
import styles from './Sort.module.css';
import TitleIcon from '../Icons/TitleIcon';
import TagsIcon from '../Icons/TagsIcon';
import DateIcon from '../Icons/DateIcon';
import TickIcon from '../Icons/TickIcon';
import ArrowIcon from '../Icons/ArrowIcon';
import CloseIcon from '../Icons/CloseIcon';
import * as u from '../../utils';
import SearchIcon from '../Icons/SearchIcon';

function Sort({
  selectedList,
  updateList,
  sortOn,
  setSortOn,
  order,
  setOrder,
  handleToggleOrder,
  existingTags,
  searchString,
  setSearchString,
}) {
  const [showDropdown, setShowDropdown] = useState(false);

  const sortDropdownRef = useRef(null);

  // const sortOnRef = useRef(null);
  // const orderRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []); // Depend on childClickedOutside

  useEffect(() => {
    if (selectedList.sortOn === 'manualOrder') {
      setSortOn('manualOrder');
      setOrder('ascending');
    }
  }, [selectedList]); // Depend on childClickedOutside

  const capitalizedOrderLabel = order.charAt(0).toUpperCase() + order.slice(1);
  const capitalizedSortLabel =
    sortOn === 'startDate'
      ? 'Date'
      : sortOn.charAt(0).toUpperCase() + sortOn.slice(1);
  // const arrowDirection = order !== 'ascending' ? 'rotate(180deg)' : 'rotate(0deg)'

  const toggleDropdown = (event) => {
    event.stopPropagation();
    setShowDropdown((prev) => !prev);
  };

  const sortDropdownCombined = `${styles.sortDropdown} ${
    showDropdown ? styles.dropdownOpen : null
  }`;

  const handleClearSort = async () => {
    const newListValues = { sortOn: 'manualOrder', order: 'ascending' };
    updateList(selectedList, newListValues);
    setSortOn('manualOrder');
    setOrder('ascending');
    setShowDropdown(false);
  };

  const sortWindowCombined = `${styles.sortWindow} ${
    sortOn !== 'manualOrder' ? styles.sortWindowActive : null
  }`;

  const orderWindowCombined = `${styles.sortWindow} ${styles.orderWindowActive}`;

  const handleSortSelect = async (sortOn) => {
    const newListValues = { sortOn: sortOn, order: order };
    updateList(selectedList, newListValues);
    setSortOn(sortOn);
    setShowDropdown(false);
  };

  const handleSearchChange = (e) => {
    const text = e.target.value;
    setSearchString(text);
  };

  return (
    <div
      className={styles.container}
      style={{
        flexDirection:
          window.innerWidth < 768
            ? sortOn !== 'manualOrder'
              ? 'column'
              : 'row'
            : 'row',
      }}
    >
      <div className={styles.sortWrapper}>
        <div className={sortWindowCombined} onClick={toggleDropdown}>
          {sortOn !== 'manualOrder' ? capitalizedSortLabel : 'Sort'}
        </div>

        {sortOn !== 'manualOrder' ? (
          <div className={orderWindowCombined} onClick={handleToggleOrder}>
            {capitalizedOrderLabel}
            {sortOn !== 'manualOrder' ? (
              <ArrowIcon
                width="14px"
                fill="rgb(109, 182, 255)"
                flip={order !== 'ascending' ? true : false}
              />
            ) : null}
          </div>
        ) : null}
        {sortOn !== 'manualOrder' ? (
          <div className={styles.clearSortButton} onClick={handleClearSort}>
            <CloseIcon fill="#8b9898" width="14px" />
            <span className={styles.clearSortButtonLabel}>Clear Sort</span>
          </div>
        ) : null}

        <div className={sortDropdownCombined} ref={sortDropdownRef}>
          <div
            className={`${styles.sortButtons} ${
              sortOn === 'title' ? styles.selected : null
            }`}
            onClick={() => handleSortSelect('title')}
          >
            <TitleIcon />
            <span className={styles.sortLabel}>Title</span>
            {sortOn === 'title' ? (
              <span className={styles.sortTick}>
                <TickIcon width="14px" />
              </span>
            ) : null}
          </div>
          <div
            className={`${styles.sortButtons} ${
              sortOn === 'tags' ? styles.selected : null
            }`}
            onClick={() => handleSortSelect('tags')}
          >
            <TagsIcon />
            <span className={styles.sortLabel}>Tags</span>
            {sortOn === 'tags' ? (
              <span className={styles.sortTick}>
                <TickIcon width="14px" />
              </span>
            ) : null}
          </div>
          <div
            className={`${styles.sortButtons} ${
              sortOn === 'startDate' ? styles.selected : null
            }`}
            onClick={() => handleSortSelect('startDate')}
          >
            <DateIcon />
            <span className={styles.sortLabel}>Date</span>
            {sortOn === 'startDate' ? (
              <span className={styles.sortTick}>
                <TickIcon width="14px" />
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <div className={styles.searchWrapper}>
        <div
          className={styles.searchContainer}
          style={{
            margin:
              window.innerWidth < 768
                ? sortOn !== 'manualOrder'
                  ? '6px 0px 0px 0px'
                  : '0px 0px 0px 6px'
                : '0px 0px 0px 6px',
          }}
        >
          <div
            className={styles.searchInputWrapper}
            style={{
              borderColor: searchString.length > 0 ? 'white' : '#8b989896',
            }}
          >
            <SearchIcon width="16px" fill="white" />
            <input
              className={styles.searchInput}
              type="text"
              id="listSearch"
              placeholder="Search"
              value={searchString}
              onChange={handleSearchChange}
              // onKeyDown={(event) => handleKeyDown(event)}
            />
            {searchString.length > 0 ? (
              <div
                className={styles.clearSearchContainer}
                role="button"
                onClick={() => setSearchString('')}
              >
                <CloseIcon
                  fill="#191919"
                  width="12px"
                  margin="0px 0px 0px 0px"
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sort;

/*


*/
