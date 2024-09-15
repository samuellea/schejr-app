import React, { useState, useEffect } from 'react';
import styles from './Planner.module.css';
import ChevronIcon from '../Icons/ChevronIcon';
import * as h from '../../helpers';
import Day from './Day';

function Planner({ showPlanner, togglePlanner, plannerMax, toggleExpand }) {
  const [viewMonth, setViewMonth] = useState(new Date()); // set current day/month/year as default current view
  const [dates, setDates] = useState(null);

  const handleNavMonth = (dir) => {
    const newDate = new Date(viewMonth);
    const currentMonth = newDate.getMonth();
    if (dir === '+') {
      newDate.setMonth(currentMonth + 1);
    } else {
      newDate.setMonth(currentMonth - 1);
    }
    setViewMonth(newDate);
  };

  useEffect(() => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const firstDayOfMonthUTC = new Date(Date.UTC(year, month, 1));
    // firstDayOfMonthUTC.setUTCHours(0, 0, 0, 0);
    setViewMonth(firstDayOfMonthUTC);
    // The time defaults to midnight (00:00:00) when only the year, month, and day are specified.
  }, []);

  useEffect(() => {
    const datesForMonth = h.generateMonthlyDays(viewMonth);
    setDates(datesForMonth);
  }, [viewMonth]);

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

            <div className={styles.datesArea}>
              {dates.map((date) => {
                return <Day date={date} viewMonth={viewMonth} />;
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
