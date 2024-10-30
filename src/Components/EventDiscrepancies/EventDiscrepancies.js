import React, { useState, useEffect } from 'react';
import styles from './EventDiscrepancies.module.css';
import EventCard from './EventCard';
import Spinner from '../Spinner/Spinner';

function EventDiscrepancies({
  evDiscs,
  handleSubmitFixes,
  fixingDiscrepancies,
  handleSetSyncWithGCal,
}) {
  console.log(evDiscs);
  const [bothButDiff, setBothButDiff] = useState(
    evDiscs.bothButDiff.map((e, i) => ({ ...e, origOrder: i }))
  );
  const [schejrNotGCal, setSchejrNotGCal] = useState(
    evDiscs.schejrNotGCal.map((e, i) => ({ ...e, origOrder: i }))
  );
  const [gcalNotSchejr, setGcalNotSchejr] = useState(
    evDiscs.gcalNotSchejr.map((e, i) => ({ ...e, origOrder: i }))
  );
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

  const handleAllSectionCheckboxes = (event, arr, choice) => {
    const checked = event.target.checked;
    /*
    schejrNotGCal ? choice = 'true' / 'false'
    gcalNotSchejr ? choice = 'true' / 'false'
    bothButDiff ? choice = 'schejr' / 'gcal'
    */
    if (arr === 'bothButDiff') {
      const updatedArr = [...bothButDiff].map((e) =>
        checked ? { ...e, keep: choice } : { ...e, keep: null }
      );
      const updatedAndSorted = updatedArr.sort(
        (a, b) => a.origOrder - b.origOrder
      );
      setBothButDiff(updatedAndSorted);
    }
    if (arr === 'schejrNotGCal') {
      const updatedArr = [...schejrNotGCal].map((e) =>
        checked ? { ...e, keep: choice } : { ...e, keep: null }
      );
      const updatedAndSorted = updatedArr.sort(
        (a, b) => a.origOrder - b.origOrder
      );
      setSchejrNotGCal(updatedAndSorted);
    }
    if (arr === 'gcalNotSchejr') {
      const updatedArr = [...gcalNotSchejr].map((e) =>
        checked ? { ...e, keep: choice } : { ...e, keep: null }
      );
      const updatedAndSorted = updatedArr.sort(
        (a, b) => a.origOrder - b.origOrder
      );
      setGcalNotSchejr(updatedAndSorted);
    }
  };

  const handleCheckbox = (arr, choice, eventID) => {
    if (arr === 'bothButDiff') {
      console.log(bothButDiff);
      const updatedObj = bothButDiff.find((e) => e.eventID === eventID);
      updatedObj.keep = choice;
      const arrMinusUpdated = bothButDiff.filter((e) => e.eventID !== eventID);
      const updatedArr = [...arrMinusUpdated, updatedObj];
      const updatedAndSorted = updatedArr.sort(
        (a, b) => a.origOrder - b.origOrder
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
        (a, b) => a.origOrder - b.origOrder
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
        (a, b) => a.origOrder - b.origOrder
      );
      setGcalNotSchejr(updatedAndSorted);
    }
  };

  const handleSubmit = () => {
    const bothButDiffStripOrderKey = bothButDiff.map(
      ({ origOrder, ...rest }) => rest
    );
    const schejrNotGCalStripOrderKey = schejrNotGCal.map(
      ({ origOrder, ...rest }) => rest
    );
    const gcalNotSchejrStripOrderKey = gcalNotSchejr.map(
      ({ origOrder, ...rest }) => rest
    );

    const updatedEvDiscs = {
      bothButDiff: bothButDiffStripOrderKey,
      schejrNotGCal: schejrNotGCalStripOrderKey,
      gcalNotSchejr: gcalNotSchejrStripOrderKey,
    };
    console.log(updatedEvDiscs);
    handleSubmitFixes(updatedEvDiscs);
  };

  const handleUnsync = () => {
    handleSetSyncWithGCal();
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
              <div className={styles.checkAllContainer}>
                <div className={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    onChange={(event) =>
                      handleAllSectionCheckboxes(event, 'bothButDiff', 'schejr')
                    }
                    checked={bothButDiff.every((obj) => obj.keep === 'schejr')}
                  />
                </div>
                <div className={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    onChange={(event) =>
                      handleAllSectionCheckboxes(event, 'bothButDiff', 'gcal')
                    }
                    checked={bothButDiff.every((obj) => obj.keep === 'gcal')}
                  />
                </div>
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
              <div className={styles.checkAllContainer}>
                <div className={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    onChange={(event) =>
                      handleAllSectionCheckboxes(event, 'schejrNotGCal', 'true')
                    }
                    checked={schejrNotGCal.every((obj) => obj.keep === 'true')}
                  />
                </div>
                <div className={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    onChange={(event) =>
                      handleAllSectionCheckboxes(
                        event,
                        'schejrNotGCal',
                        'false'
                      )
                    }
                    checked={schejrNotGCal.every((obj) => obj.keep === 'false')}
                  />
                </div>
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
              <div className={styles.checkAllContainer}>
                <div className={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    onChange={(event) =>
                      handleAllSectionCheckboxes(event, 'gcalNotSchejr', 'true')
                    }
                    checked={gcalNotSchejr.every((obj) => obj.keep === 'true')}
                  />
                </div>
                <div className={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    onChange={(event) =>
                      handleAllSectionCheckboxes(
                        event,
                        'gcalNotSchejr',
                        'false'
                      )
                    }
                    checked={gcalNotSchejr.every((obj) => obj.keep === 'false')}
                  />
                </div>
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
            className={styles.actionButton}
            id={styles.submit}
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            Submit
          </button>
          <button
            className={styles.actionButton}
            id={styles.unsync}
            type="button"
            onClick={handleUnsync}
          >
            Unsync & Continue
          </button>
        </>
      )}
    </div>
  );
}

export default EventDiscrepancies;
