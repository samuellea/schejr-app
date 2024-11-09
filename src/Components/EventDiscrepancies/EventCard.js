import React, { useState } from 'react';
import styles from './EventCard.module.css';
import * as h from '../../helpers';

function EventCard({ event, changedFields = [], missingLabel = null }) {
  if (missingLabel) {
    const missingLabelSpans = missingLabel.split(' ').map((e) => {
      if (e === 'added')
        return <span style={{ color: 'rgb(0, 194, 0)' }}>{e} </span>;
      if (e === 'removed')
        return <span style={{ color: 'rgb(258, 0, 0)' }}>{e} </span>;
      return <span>{e} </span>;
    });
    return (
      <div className={styles.eventCard}>
        <span className={styles.missingLabel}>{missingLabelSpans}</span>
      </div>
    );
  } else {
    return (
      <div className={styles.eventCard}>
        <span
          className={styles.eventTitle}
          id={changedFields.includes('title') ? styles.changed : null}
        >
          {event.title}
        </span>
        <span
          className={styles.eventDateTime}
          id={changedFields.includes('startDateTime') ? styles.changed : null}
        >
          {h.formatDateTimeDiscrepancyCard(event.startDateTime, event.timeSet)}
        </span>
      </div>
    );
  }
}

export default EventCard;
