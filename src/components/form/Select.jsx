import styles from './inputs.module.css';
import { cn } from '../../lib/utils';
import useInvokeQuery from '../../hooks/useInvokeQuery';
import {SelectBuilder} from '../../lib/query-builders';

function SelectContent({ data, empty }) {
  return (
    <>
      {empty && <option value={''}>{empty}</option>}
      {data?.map((d, idx) => (
        <option key={idx} value={d.key}>
          {d.value}
        </option>
      ))}
    </>
  );
}

export function useSelectData(entity, query, key, value) {
  const qb = new SelectBuilder(entity).addField(key).addField(value);
  if (query.orderBy) {
    let orderField = Object.keys(query.orderBy)[0];
    qb.addOrderBy(orderField, query.orderBy[orderField]);
  }
  const [data, loading, error] = useInvokeQuery(qb.build());
  return [data?.map(d => ({ key: d[key], value: d[value] })), loading, error];
}

export default function Select({ children, label, data, empty, error, errorMessage, ...props }) {
  return (
    <label className={cn(styles.inputGroup, error && styles.inputGroupError)}>
      {label && <p className={styles.inputGroupLabel}>{label}</p>}
      <div className='flex w-full'>
        <select className={styles.inputGroupField} {...props}>
          <SelectContent data={data} empty={empty} />
        </select>
        {children}
      </div>
      {error && errorMessage && <p className={styles.inputGroupErrorMsg}>{errorMessage}</p>}
    </label>
  );
}
