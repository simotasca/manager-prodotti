import { useEffect } from 'react';
import styles from '../../../styles/table.module.css';

function Arrow({ colName, ordering }) {
  // const { ctx, setCtx, scrollTop } = useContext(TableContext);
  // const splitColN = () => colName?.split('.') || [];
  // const isOrder = () => checkNestedObject(ctx?.orderBy, splitColN(), ordering);
  // const onClick = () => {
  //   if (ctx.orderBy && isOrder()) {
  //     const newCtx = { ...ctx, skip: 0 };
  //     delete newCtx.orderBy;
  //     setCtx(newCtx);
  //   } else {
  //     const orderBy = {};
  //     createNestedObject(orderBy, splitColN(), ordering);
  //     const newCtx = { ...ctx, orderBy: orderBy, skip: 0 };
  //     setCtx(newCtx);
  //   }
  //   scrollTop();
  // };

  const isOrder = () => false;

  return (
    <div
      className={
        'relative cursor-pointer w-0 h-0 border-[6px] border-x-transparent shadow-md' +
        (ordering == 'asc' ? ' border-t-0' : ' border-b-0') +
        (isOrder() ? ' border-sky-500' : ' border-slate-400')
      }
      // onClick={onClick}
    ></div>
  );
}

function ArrowUp({ colName }) {
  return <Arrow colName={colName} ordering='asc' />;
}

function ArrowDown({ colName }) {
  return <Arrow colName={colName} ordering='desc' />;
}

function HeaderCellCol({ col, idx }) {
  const isOrder = () => false;
  const filter = false;
  return (
    <>
      <div className='flex items-center gap-x-1'>
        {idx > 0 ? <span className='font-semibold text-slate-500'>/</span> : null}
        <p
          // onClick={() => setOpenFilter(!openFilter)}
          className={
            'font-semibold' + (isOrder() ? ' text-sky-500' : ' text-slate-700') + (filter ? ' cursor-pointer' : '')
          }>
          {col.headers && col.headers[idx]}
        </p>
        <div className='flex flex-col gap-1 translate-y-[0.5px]'>
          <ArrowUp colName={col.colNames[idx]}></ArrowUp>
          <ArrowDown colName={col.colNames[idx]}></ArrowDown>
        </div>
      </div>
    </>
  );
}

function HeaderCell({ col }) {
  return (
    <th className={styles.headerCell}>
      {!col.empty && (
        <div className='flex flex-wrap items-center gap-x-1 ml-[1px]'>
          {col.colNames.map((_, idx) => (
            <HeaderCellCol key={idx} col={col} idx={idx}>
              {/* filter={filters && filters[idx]} */}
            </HeaderCellCol>
          ))}
        </div>
      )}
    </th>
  );
}

function TableHeader({ settings }) {
  return (
    <thead>
      <tr className={styles.headerRow}>
        {settings.columns.map((col, idx) => (
          <HeaderCell key={idx} col={col} />
        ))}
      </tr>
    </thead>
  );
}

export default TableHeader;
