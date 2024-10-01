import React from 'react';
import styles from './Spinner.module.css';

const Spinner = ({ size = 'small' }) => {
  return <span className={styles.loader}></span>;
};

export default Spinner;
