import React, { useState, useEffect } from 'react';
import styles from './EventDiscrepancies.module.css';
import EventCard from './EventCard';
import Spinner from '../Spinner/Spinner';

function EventDiscrepancies({
  evDiscs,
  handleSubmitFixes,
  fixingDiscrepancies,
}) {
  console.log(evDiscs);
  const [bothButDiff, setBothButDiff] = useState(evDiscs.bothButDiff);
  const [schejrNotGCal, setSchejrNotGCal] = useState(evDiscs.schejrNotGCal);
  const [gcalNotSchejr, setGcalNotSchejr] = useState(evDiscs.gcalNotSchejr);
  const [canSubmit, setCanSubmit] = useState(false);

  useEffect(() => {
    const allChecked = ![
      ...bothButDiff,
      ...gcalNotSchejr,
      ...schejrNotGCal,
    ].some((obj) => obj.keep === null);
    if (allChecked) setCanSubmit(true);
    if (!allChecked) setCanSubmit(false);
  }, [bothButDiff, schejrNotGCal, gcalNotSchejr]);

  const handleCheckbox = (arr, choice, eventID) => {
    if (arr === 'bothButDiff') {
      const updatedObj = bothButDiff.find((e) => e.eventID === eventID);
      updatedObj.keep = choice;
      const arrMinusUpdated = bothButDiff.filter((e) => e.eventID !== eventID);
      const updatedArr = [...arrMinusUpdated, updatedObj];
      const updatedAndSorted = updatedArr.sort(
        (a, b) =>
          new Date(a.schejr.startDateTime) - new Date(b.schejr.startDateTime)
      );
      setBothButDiff(updatedAndSorted);
    }
    if (arr === 'schejrNotGCal') {
      const updatedObj = schejrNotGCal.find((e) => e.eventID === eventID);
      updatedObj.keep = choice;
      const arrMinusUpdated = schejrNotGCal.filter(
        (e) => e.eventID !== eventID
      );
      const updatedArr = [...arrMinusUpdated, updatedObj];
      const updatedAndSorted = updatedArr.sort(
        (a, b) => new Date(a.startDateTime) - new Date(b.startDateTime)
      );
      setSchejrNotGCal(updatedAndSorted);
    }
    if (arr === 'gcalNotSchejr') {
      const updatedObj = gcalNotSchejr.find((e) => e.eventID === eventID);
      updatedObj.keep = choice;
      const arrMinusUpdated = gcalNotSchejr.filter(
        (e) => e.eventID !== eventID
      );
      const updatedArr = [...arrMinusUpdated, updatedObj];
      const updatedAndSorted = updatedArr.sort(
        (a, b) => new Date(a.startDateTime) - new Date(b.startDateTime)
      );
      setGcalNotSchejr(updatedAndSorted);
    }
  };

  const handleSubmit = () => {
    const updatedEvDiscs = {
      bothButDiff: bothButDiff,
      schejrNotGCal: schejrNotGCal,
      gcalNotSchejr: gcalNotSchejr,
    };
    handleSubmitFixes(updatedEvDiscs);
  };

  return (
    <div className={styles.container}>
      {fixingDiscrepancies ? (
        <div className={styles.fixingSpinner}>
          <Spinner />
        </div>
      ) : (
        <>
          <span>Pick which side to keep</span>
          {bothButDiff.length ? (
            <div className={styles.section}>
              <div className={styles.header}>
                Event on both, but different details:
              </div>
              {bothButDiff.map((obj) => {
                const objInState = bothButDiff.find(
                  (e) => e.eventID === obj.eventID
                );
                const { keep } = objInState;
                return (
                  <div
                    className={styles.comparer}
                    key={obj.eventID}
                    style={{ borderColor: keep !== null ? 'lime' : 'gray' }}
                  >
                    <div className={styles.comparerDirectionOverlay}>
                      <span>
                        {keep === 'schejr' ? '➡️' : keep === 'gcal' ? '⬅️' : ''}
                      </span>
                    </div>
                    <div className={styles.side} id={styles.left}>
                      <div className={styles.checkboxContainer}>
                        <input
                          type="checkbox"
                          onChange={() =>
                            handleCheckbox('bothButDiff', 'schejr', obj.eventID)
                          }
                          checked={objInState.keep === 'schejr'}
                        />
                      </div>
                      <div className={styles.cardContainer}>
                        <EventCard event={obj.schejr} />
                      </div>
                    </div>
                    <div className={styles.side} id={styles.right}>
                      <div className={styles.cardContainer}>
                        <EventCard
                          event={obj.gcal}
                          changedFields={obj.changedFields}
                        />
                      </div>
                      <div className={styles.checkboxContainer}>
                        <input
                          type="checkbox"
                          onChange={() =>
                            handleCheckbox('bothButDiff', 'gcal', obj.eventID)
                          }
                          checked={objInState.keep === 'gcal'}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
          {schejrNotGCal.length ? (
            <div className={styles.section}>
              <div className={styles.header}>
                Event on Schejr, but not Google Calendar:
              </div>
              {schejrNotGCal.map((obj) => {
                const objInState = schejrNotGCal.find(
                  (e) => e.eventID === obj.eventID
                );
                const { keep } = objInState;
                return (
                  <div
                    className={styles.comparer}
                    key={obj.eventID}
                    style={{
                      borderColor:
                        keep === 'true'
                          ? 'lime'
                          : keep === 'false'
                          ? 'red'
                          : 'gray',
                    }}
                  >
                    <div className={styles.comparerDirectionOverlay}>
                      <span>
                        {keep === 'true' ? '➡️' : keep === 'false' ? '❌' : ''}
                      </span>
                    </div>
                    <div className={styles.side} id={styles.left}>
                      <div className={styles.checkboxContainer}>
                        <input
                          type="checkbox"
                          onChange={() =>
                            handleCheckbox('schejrNotGCal', 'true', obj.eventID)
                          }
                          checked={objInState.keep === 'true'}
                        />
                      </div>
                      <div className={styles.cardContainer}>
                        <EventCard event={obj} />
                      </div>
                    </div>
                    <div className={styles.side} id={styles.right}>
                      <div className={styles.cardContainer}>
                        <EventCard
                          missingLabel={
                            objInState.keep === 'true'
                              ? 'Will be added to Google Calendar'
                              : objInState.keep === 'false'
                              ? 'Will be removed from Schejr'
                              : 'Missing from Google Calendar'
                          }
                        />
                      </div>
                      <div className={styles.checkboxContainer}>
                        <input
                          type="checkbox"
                          onChange={() =>
                            handleCheckbox(
                              'schejrNotGCal',
                              'false',
                              obj.eventID
                            )
                          }
                          checked={objInState.keep === 'false'}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
          {gcalNotSchejr.length ? (
            <div className={styles.section}>
              <div className={styles.header}>
                Event on Google Calendar, but not Schejr:
              </div>
              {gcalNotSchejr.map((obj) => {
                const objInState = gcalNotSchejr.find(
                  (e) => e.eventID === obj.eventID
                );
                const { keep } = objInState;
                return (
                  <div
                    className={styles.comparer}
                    key={obj.eventID}
                    style={{
                      borderColor:
                        keep === 'true'
                          ? 'lime'
                          : keep === 'false'
                          ? 'red'
                          : 'gray',
                    }}
                  >
                    <div className={styles.comparerDirectionOverlay}>
                      <span>
                        {keep === 'true' ? '⬅️' : keep === 'false' ? '❌' : ''}
                      </span>
                    </div>
                    <div className={styles.side} id={styles.left}>
                      <div className={styles.checkboxContainer}>
                        <input
                          type="checkbox"
                          onChange={() =>
                            handleCheckbox(
                              'gcalNotSchejr',
                              'false',
                              obj.eventID
                            )
                          }
                          checked={objInState.keep === 'false'}
                        />
                      </div>
                      <div className={styles.cardContainer}>
                        <EventCard
                          missingLabel={
                            objInState.keep === 'true'
                              ? 'Will be added to Schejr'
                              : objInState.keep === 'false'
                              ? 'Will be removed from Google Calendar'
                              : 'Missing from Schejr'
                          }
                        />
                      </div>
                    </div>
                    <div className={styles.side} id={styles.right}>
                      <div className={styles.cardContainer}>
                        <EventCard event={obj} />
                      </div>
                      <div className={styles.checkboxContainer}>
                        <input
                          type="checkbox"
                          onChange={() =>
                            handleCheckbox('gcalNotSchejr', 'true', obj.eventID)
                          }
                          checked={objInState.keep === 'true'}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
          <button
            className={styles.submitButton}
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            Submit
          </button>
        </>
      )}
    </div>
  );
}

export default EventDiscrepancies;
