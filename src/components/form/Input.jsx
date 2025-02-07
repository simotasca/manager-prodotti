import styles from './inputs.module.css';
import { cn } from '../../lib/utils';
import { forwardRef } from 'react';

export default forwardRef(({ children, label, error, errorMessage, ...props }, ref) => {
  return (
    <label className={cn(styles.inputGroup, error && styles.inputGroupError)}>
      {label && <p className={styles.inputGroupLabel}>{label}</p>}
      <div className='flex w-full'>
        <input
          ref={ref}
          className={cn(styles.inputGroupField, props.placeholder && styles.inputPlaceholder)}
          {...props}
        />
        {children}
      </div>
      {error && errorMessage && <p className={styles.inputGroupErrorMsg}>{errorMessage}</p>}
    </label>
  );
});
