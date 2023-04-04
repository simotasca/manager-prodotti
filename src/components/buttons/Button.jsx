import styles from './button.module.css';

export function Button({ children, className = '', color, ...props }) {
  var cName =
    className +
    ' ' +
    (color == 'green' ? styles.buttonGreen : '') +
    (color == 'blue' ? styles.buttonBlue : '') +
    (color == 'red' ? styles.buttonRed : '') +
    (color == 'orange' ? styles.buttonOrange : '');

  return (
    <button className={styles.button + ' ' + cName} {...props}>
      {children}
    </button>
  );
}