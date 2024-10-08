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
  viewMonth,
  setViewMonth,
  handleEvents,
  existingTags,
  setExistingTags,
  handleEntities,
  viewWeek,
  setViewWeek,
}) {
  const [dates, setDates] = useState([]);
  const [eventsLoaded, setEventsLoaded] = useState(true);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewMode, setViewMode] = useState('month'); // 'week'

  const userUID = localStorage.getItem('firebaseID');

  const handleScroll = () => {
    if (scrollRef.current) {
      // const scrollPosition = scrollRef.current.scrollTop;
      // console.log(scrollPosition);
      // setScrollTop(scrollPosition);
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
      console.log(monthUserEvents);
      // need to set in state now
      setEvents(monthUserEvents, 'setAll');
    } catch (error) {}
  };

  const getAndSetWeekUserEvents = async (datesForWeek) => {
    setEventsLoaded(false);
    const startDate = datesForWeek[0];
    const endDate = datesForWeek[datesForWeek.length - 1];
    try {
      const weekUserEvents = await u.fetchUserEventsByWeek(
        userUID,
        startDate,
        endDate
      );
      console.log(weekUserEvents);
      // need to set in state now
      setEvents(weekUserEvents, 'setAll');
    } catch (error) {}
  };

  useEffect(() => {
    if (events !== null) {
      // console.log(events);
      setEventsLoaded(true);
    }
  }, [events]);

  useEffect(() => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const firstDayOfMonthUTC = new Date(Date.UTC(year, month, 1));
    // firstDayOfMonthUTC.setUTCHours(0, 0, 0, 0);
    setViewMonth(firstDayOfMonthUTC);
    // The time defaults to midnight (00:00:00) when only the year, month, and day are specified.
    // getAndSetMonthUserEvents(viewMonth);
  }, []);

  useEffect(() => {
    if (viewMode === 'month') {
      const datesForMonth = h.generateMonthlyDays(viewMonth);
      setDates(datesForMonth);
      getAndSetMonthUserEvents(viewMonth);
    }

    if (viewMode === 'week') {
      const weekData = h.generateWeeklyDays(viewWeek).dates;
      const { datesForWeek, weekNum } = weekData;
      setDates(datesForWeek);
      getAndSetWeekUserEvents(datesForWeek);
    }
  }, [viewMonth]);

  useEffect(() => {}, [viewWeek]);

  useEffect(() => {
    // setDates when viewMode changed
    // console.log(dates);
    if (viewMode === 'month') {
      const datesForMonth = h.generateMonthlyDays(viewMonth);
      // console.log(datesForMonth);
      setDates(datesForMonth);
      getAndSetMonthUserEvents(viewMonth);
    }
    if (viewMode === 'week') {
      const weekData = h.generateWeeklyDays(viewWeek).dates;
      const { datesForWeek, weekNum } = weekData;
      setDates(datesForWeek);
      getAndSetWeekUserEvents(datesForWeek);
    }
  }, [viewMode]);

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
      ) : null}
    </div>
  );
}

export default Planner;
