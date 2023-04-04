import styles from './inputs.module.css';
import { cn } from '../../lib/utils';
import { useState } from 'react';
import { useEffect, useRef } from 'react';
import {Button} from '../buttons';
import { PlusIcon } from '@heroicons/react/20/solid';

export default function MultipleInput({ options, addFormState, name, label, error, errorMessage, disabled }) {
  const inpRef = useRef();
  const [inputValue, setInputValue] = useState('');
  const [values, setValues] = useState(options || []);

  useEffect(() => {
    setValues(options || []);
  }, [options]);

  // STATE MANAGEMENT
  const align = values => {
    setInputValue('');
    setValues(values);
    addFormState && addFormState(name, values);
  };

  const removeValue = val => align(values.filter(v => v != val) || []);

  const addValue = val => {
    if (!!val && !values.includes(val)) align([...values, val]);
  };

  // HANDLERS
  const onKeyUp = e => {
    if (e.key === 'Enter') {
      addValue(inputValue);
    }
  };
  const onKeyDown = e => {
    if (e.keyCode === 8 && inputValue === '') {
      removeValue(values[values.length - 1]);
    }
  };

  return (
    <label className={cn(styles.inputGroup, error && styles.inputGroupError)}>
      {label && <p className={styles.inputGroupLabel}>{label}</p>}
      <div className='flex gap-2 items-center'>
        <div
          className={cn(styles.inputGroupField, 'flex flex-wrap gap-2 cursor-[text]')}
          onClick={() => inpRef?.current?.focus()}>
          {values &&
            values.map((value, idx) => (
              <div
                key={idx}
                onClick={() => removeValue(value)}
                className='grid place-content-center bg-blue-500 text-white text-sm pb-[1px] rounded px-2 cursor-pointer whitespace-nowrap'>
                {value}
              </div>
            ))}
          <input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyUp={onKeyUp}
            onKeyDown={onKeyDown}
            type='text'
            placeholder='...'
            className='flex-1 p-0 border-none bg-transparent focus:border-none focus:outline-none placeholder:tracking-widest'
            disabled={disabled}
          />
        </div>
        <Button className='self-start' color='blue' onClick={() => addValue(inputValue)} disabled={disabled}>
          <PlusIcon className='text-white w-4 my-1' />
        </Button>
      </div>
      {error && errorMessage && <p className={styles.inputGroupErrorMsg}>{errorMessage}</p>}
    </label>
  );
}
