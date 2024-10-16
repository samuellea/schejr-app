import React, { useState } from 'react';
import styles from './EventCard.module.css';
import * as h from '../../helpers';

function EventCard({ event, changedFields = [], missingLabel = null }) {
  if (missingLabel) {
    return (
      <div className={styles.eventCard}>
        <span>{missingLabel}</span>
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
