import styles from '../../styles/table.module.css';

function TableCell({ children }) {
  return <td className={styles.cell}>{children}</td>;
}

export default TableCell;
