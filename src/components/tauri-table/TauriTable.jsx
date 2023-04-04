// import { invoke } from '@tauri-apps/api';
import { useRef } from 'react';
import { SelectBuilder } from '../../lib/query-builders';
import useTableCtx from './useTableCtx';
import styles from '../../styles/table.module.css';
import useInvokeQuery from '../../hooks/useInvokeQuery';

const DEMO_SETTINGS = {
  entityName: 'azienda',
  entityAlias: 'a',
  displayName: 'Azienda',
  columns: [
    {
      colNames: ['a.id'],
      alias: ['id'],
      headers: ['#'],
      template: '80px'
    },
    {
      colNames: ['a.nome'],
      alias: ['nome'],
      headers: ['Azienda'],
      template: 'auto'
    },
    { empty: true }
  ],
  orderBy: { 'a.nome': 'ASC' },
  skip: 0,
  take: 50
};

function buildQueryFromSettings(settings) {
  const builder = new SelectBuilder(settings.entityName, settings.entityAlias);

  settings.join && settings.join.forEach(j => builder.addJoin(j.name, j.alias || null, j.field1, j.field2));

  Object.entries(settings.selectFields).forEach(([key, value]) => builder.addField(key, value));

  settings.orderBy && Object.entries(settings.orderBy).forEach(([key, val]) => builder.addOrderBy(key, val));

  // settings.columns
  //   .reduce((prev, col) => (col.empty ? [...prev] : [...prev, ...col.colNames]), [])
  //   .forEach(col => builder.addField(col));

  return builder.build();
}

function TauriTable({ settings = DEMO_SETTINGS, RowComponent }) {
  const tableContainerRef = useRef();
  const sqlQuery = buildQueryFromSettings(settings);
  const [data, loading, error] = useInvokeQuery(sqlQuery);
  const tableCtx = useTableCtx(tableContainerRef);

  if (error) return <>ERROR</>;
  if (loading) return <>LOADING</>;
  if (!data?.length) return <>NESSUN RISULTATO</>;

  return (
    <div ref={tableContainerRef} className={styles.container}>
      <table className={styles.customTable}>
        <colgroup>
          {settings.columns
            .map(col => col.template || '')
            .map((temp, idx) => (
              <col key={idx} width={temp}></col>
            ))}
        </colgroup>
        {/* <TableContext.Provider value={tableCtx}> */}
        {/* <TableHeader settings={settings} /> */}
        <tbody>{data && data.map((row, idx) => <RowComponent key={idx} data={row} />)}</tbody>
        {/* </TableContext.Provider> */}
      </table>
    </div>
  );
}

export default TauriTable;
