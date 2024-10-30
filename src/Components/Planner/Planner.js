import React, { useState, useEffect, useRef } from 'react';
import styles from './Planner.module.css';
import ChevronIcon from '../Icons/ChevronIcon';
import * as h from '../../helpers';
import * as u from '../../utils';
import Day from './Day';
import PlaceholderDay from './PlaceholderDay';
import {
  startOfWeek,
  addDays,
  getISOWeek,
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
} from 'date-fns';
import MonthIcon from '../Icons/MonthIcon';
import WeekIcon from '../Icons/WeekIcons';

function Planner({
  showPlanner,
  togglePlanner,
  plannerMax,
  toggleExpand,
  events,
  setEvents,
  handleEvents,
  existingTags,
  setExistingTags,
  handleEntities,
  plannerRange,
  setPlannerRange,
  setModalBackground,
  showSidebar,
  eventDiscrepancies,
}) {
  const [dates, setDates] = useState([]);
  const [eventsLoaded, setEventsLoaded] = useState(true);
  const [viewMode, setViewMode] = useState('month'); // 'week'
  const [anchorDate, setAnchorDate] = useState(new Date()); // init. as today's date
  const [navLabel, setNavLabel] = useState('');
  // const [scrollPosition, setScrollPosition] = useState({ top: 0, bottom: 0 });
  const userUID = localStorage.getItem('firebaseID');

  // const handleScroll = () => {
  //   if (scrollRef.current) {
  //     const scrollTop = scrollRef.current.scrollTop;
  //     const scrollHeight = scrollRef.current.scrollHeight;
  //     const clientHeight = scrollRef.current.clientHeight;
  //     const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
  //     setScrollPosition({ top: scrollTop, bottom: distanceFromBottom });
  //   }
  // };

  const handleNav = (dir) => {
    if (viewMode === 'month') {
      if (dir === '+') {
        const nextMonth = addMonths(anchorDate, 1);
        setAnchorDate(nextMonth);
      }
      if (dir === '-') {
        const previousMonth = subMonths(anchorDate, 1);
        setAnchorDate(previousMonth);
      }
    }
    if (viewMode === 'week') {
      if (dir === '+') {
        const nextWeek = addWeeks(anchorDate, 1);
        setAnchorDate(nextWeek);
      }
      if (dir === '-') {
        const previousWeek = subWeeks(anchorDate, 1);
        setAnchorDate(previousWeek);
      }
    }
  };

  const getAndSetRangeUserEvents = async (start, end) => {
    setEventsLoaded(false);
    try {
      const rangeUserEvents = await u.fetchUserEventsByRange(
        userUID,
        start,
        end
      );
      console.log(rangeUserEvents);
      // need to set in state now
      setEvents(rangeUserEvents, 'setAll');
    } catch (error) {}
  };

  const generateNavLabel = (anchorDate) => {
    return viewMode === 'month'
      ? anchorDate.toLocaleString('default', {
          month: 'long',
          year: 'numeric',
        })
      : `Week ${getISOWeek(anchorDate)} • ${anchorDate.toLocaleString(
          'default',
          {
            year: 'numeric',
          }
        )}`;
  };

  const makeDatesFetchEvents = () => {
    const plannerRange = h.createDateRange(anchorDate, viewMode);
    setPlannerRange(plannerRange);
    const { start, end } = plannerRange;
    const datesForRange = h.generateRangeDates(start, end);
    setDates(datesForRange);
    const navLabel = generateNavLabel(anchorDate);
    setNavLabel(navLabel);
    getAndSetRangeUserEvents(start, end);
  };

  // useEffect which generated the dates for the default planner range, and fetches events that fall within that (+ sets in Home state)
  useEffect(() => {
    makeDatesFetchEvents();
  }, []);

  // useEffect which generates the dates for the specified planner range WHEN IT CHANGES, and fetches events that fall within that (+ sets in Home state)
  useEffect(() => {
    // when anchorDate changes, calculate date range based on viewMode, set in Home state
    makeDatesFetchEvents();
  }, [anchorDate]);

  useEffect(() => {
    if (eventDiscrepancies === null) {
      makeDatesFetchEvents();
    }
  }, [eventDiscrepancies]);

  useEffect(() => {
    const dateResetToToday = new Date();
    setAnchorDate(dateResetToToday);
  }, [viewMode]);

  useEffect(() => {
    if (events !== null) {
      setEventsLoaded(true);
    }
  }, [events]);

  const scrollRef = useRef(null);

  return (
    <div
      className={styles.container}
      style={{
        height: !showPlanner ? '0%' : plannerMax ? '100%' : '50%',
        padding: !showPlanner
          ? '0px'
          : plannerMax
          ? '0px 0px 0px 0px'
          : '0px 0px 0px 0px',
        borderTop: plannerMax ? 'none' : '1px solid rgba(155, 155, 155, 0.151)',
      }}
    >
      {/* {showSidebar ? <div className={styles.sidebarSpacer} /> : null} */}
      {/* <div className={styles.sidebarSpacer} /> */}
      {showPlanner ? (
        <div className={styles.plannerContentWrapper}>
          <div className={styles.contentAndControls}>
            <div className={styles.contentContainer}>
              <div
                className={styles.datesArea}
                ref={scrollRef}
                // onScroll={handleScroll}
              >
                {eventsLoaded
                  ? dates.map((date, i) => {
                      const eventsForThisDate = h.getEventsForDate(
                        date.date,
                        events
                      );
                      return eventsLoaded ? (
                        <Day
                          date={date}
                          dateEvents={eventsForThisDate}
                          key={`day-${date.date}`}
                          events={events}
                          handleEvents={handleEvents}
                          existingTags={existingTags}
                          setExistingTags={setExistingTags}
                          handleEntities={handleEntities}
                          setEventsLoaded={setEventsLoaded}
                          scrollRef={scrollRef}
                          // setModalBackground={setModalBackground}
                          isLast={i === dates.length - 1}
                        />
                      ) : (
                        <PlaceholderDay key={`placeholderDay-${date.date}`} />
                      );
                    })
                  : null}
              </div>
            </div>

            <div className={styles.controlsContainer}>
              <div className={styles.expandButtonsContainer}>
                {!plannerMax ? (
                  <div
                    role="button"
                    className={styles.listsHeaderButton}
                    onClick={togglePlanner}
                  >
                    <ChevronIcon fill="white" width="20px" flip={270} />
                  </div>
                ) : null}
                <div
                  role="button"
                  className={styles.listsHeaderButton}
                  onClick={toggleExpand}
                >
                  <ChevronIcon
                    fill="white"
                    width="20px"
                    flip={plannerMax ? 270 : 90}
                  />
                </div>
              </div>

              <div className={styles.monthNavigatorContainer}>
                <div className={styles.monthNavigator}>
                  <div
                    className={styles.navButton}
                    onClick={() => handleNav('-')}
                  >
                    <div className={styles.navIconL}></div>
                  </div>
                  <div className={styles.monthNavLabel}>
                    <span>
                      <h4>{navLabel}</h4>
                    </span>
                  </div>
                  <div
                    className={styles.navButton}
                    onClick={() => handleNav('+')}
                  >
                    <div className={styles.navIconR}></div>
                  </div>
                </div>
              </div>

              <div className={styles.viewModeContainer}>
                <div
                  role="button"
                  className={styles.viewModeButton}
                  id={viewMode === 'month' ? styles.viewButtonSelected : null}
                  onClick={() => setViewMode('month')}
                >
                  <MonthIcon width="24px" />
                  <span>Month</span>
                </div>
                <div
                  role="button"
                  className={styles.viewModeButton}
                  id={viewMode === 'week' ? styles.viewButtonSelected : null}
                  onClick={() => setViewMode('week')}
                >
                  <WeekIcon width="24px" />
                  <span>Week</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Planner;
