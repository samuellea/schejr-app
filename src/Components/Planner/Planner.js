import React, { useState, useEffect, useRef } from 'react';
import styles from './Planner.module.css';
import ChevronIcon from '../Icons/ChevronIcon';
import * as h from '../../helpers';
import * as u from '../../utils';
import Day from './Day';
import PlaceholderDay from './PlaceholderDay';

function Planner({
  showPlanner,
  togglePlanner,
  plannerMax,
  toggleExpand,
  events,
  setEvents,
  viewMonth,
  setViewMonth,
  handleEvents,
  existingTags,
  setExistingTags,
  handleEntities,
}) {
  const [dates, setDates] = useState([]);
  const [eventsLoaded, setEventsLoaded] = useState(true);
  const [scrollTop, setScrollTop] = useState(0);

  const userUID = localStorage.getItem('firebaseID');

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollPosition = scrollRef.current.scrollTop;
      console.log(scrollPosition);
      setScrollTop(scrollPosition);
    }
  };

  const handleNavMonth = (dir) => {
    const newDate = new Date(viewMonth);
    const currentMonth = viewMonth.getMonth();
    if (dir === '+') {
      newDate.setMonth(currentMonth + 1);
    } else {
      newDate.setMonth(currentMonth - 1);
    }
    setViewMonth(newDate);
  };

  useEffect(() => {
    if (events !== null) {
      // console.log(events);
      setEventsLoaded(true);
    }
  }, [events]);

  const getAndSetMonthUserEvents = async (viewMonth) => {
    setEventsLoaded(false);
    const month = viewMonth.getUTCMonth();
    const year = viewMonth.getUTCFullYear();
    try {
      const monthUserEvents = await u.fetchUserEventsByMonth(
        userUID,
        month,
        year
      );
      // need to set in state now
      setEvents(monthUserEvents, 'setAll');
    } catch (error) {}
  };

  useEffect(() => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const firstDayOfMonthUTC = new Date(Date.UTC(year, month, 1));
    // firstDayOfMonthUTC.setUTCHours(0, 0, 0, 0);
    setViewMonth(firstDayOfMonthUTC);
    // The time defaults to midnight (00:00:00) when only the year, month, and day are specified.
    getAndSetMonthUserEvents(viewMonth);
  }, []);

  useEffect(() => {
    const datesForMonth = h.generateMonthlyDays(viewMonth);
    setDates(datesForMonth);
    getAndSetMonthUserEvents(viewMonth);
  }, [viewMonth]);

  const scrollRef = useRef(null);

  return (
    <div
      className={styles.container}
      style={{
        height: !showPlanner ? '0%' : plannerMax ? '100%' : '50%',
        padding: !showPlanner
          ? '0px'
          : plannerMax
          ? '0px 28px 12px 0px'
          : '12px 28px 12px 0px',
      }}
    >
      {showPlanner ? (
        <div className={styles.contentAndControls}>
          <div className={styles.contentContainer}>
            <div className={styles.monthNavigator}>
              <div
                className={styles.navButton}
                onClick={() => handleNavMonth('-')}
              >
                <div className={styles.navIconL}></div>
              </div>
              <div className={styles.monthNavLabel}>
                <span>
                  <h4>
                    {viewMonth.toLocaleString('default', { month: 'long' })}
                  </h4>
                </span>

                <span className={styles.monthNavYear}>
                  <h4>{viewMonth.getFullYear()}</h4>
                </span>
              </div>
              <div
                className={styles.navButton}
                onClick={() => handleNavMonth('+')}
              >
                <div className={styles.navIconR}></div>
              </div>
            </div>

            <div
              className={styles.datesArea}
              ref={scrollRef}
              onScroll={handleScroll}
            >
              {dates.map((date) => {
                const eventsForThisDate = h.getEventsForDate(date.date, events);
                return eventsLoaded ? (
                  <Day
                    date={date}
                    dateEvents={eventsForThisDate}
                    viewMonth={viewMonth}
                    key={`day-${date.date}`}
                    events={events}
                    handleEvents={handleEvents}
                    existingTags={existingTags}
                    setExistingTags={setExistingTags}
                    handleEntities={handleEntities}
                    setEventsLoaded={setEventsLoaded}
                  />
                ) : (
                  <PlaceholderDay key={`placeholderDay-${date.date}`} />
                );
              })}
            </div>
          </div>

          <div className={styles.controlsContainer}>
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
        </div>
      ) : null}
    </div>
  );
}

export default Planner;
