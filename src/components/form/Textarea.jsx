import styles from './inputs.module.css';
import { cn } from '../../lib/utils';
import { forwardRef } from 'react';

export default forwardRef(({ label, error, errorMessage, ...props }, ref) => {
  return (
    <label className={cn(styles.inputGroup, error && styles.inputGroupError)}>
      {label && <p className={styles.inputGroupLabel}>{label}</p>}
      <textarea
        ref={ref}
        className={cn(styles.inputGroupField, props.placeholder && styles.inputPlaceholder)}
        {...props}
      />
      {error && errorMessage && <p className={styles.inputGroupErrorMsg}>{errorMessage}</p>}
    </label>
  );
});
