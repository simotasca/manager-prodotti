import { createContext } from 'react';

const TableContex = createContext({
  ctx: {},
  setCtx: () => { },
  scrollTop: () => { },
  setOrderBy: (field, orderType) => { }
});

export default TableContex;