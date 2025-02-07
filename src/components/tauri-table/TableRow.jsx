import styles from '../../styles/table.module.css';

function TableRow({ children }) {
  return (
    <tr className={styles.row}>
      {children}
      <td className={styles.rowBackground}></td>
    </tr>
  );
}

export default TableRow;
