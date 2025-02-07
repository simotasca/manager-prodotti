import { useCallback, useState } from "react";

export default function (containerRef, settings) {
  const [ctx, setCtx] = useState({ take: 50, skip: 0 });
  const setProp = (key, val) => setCtx(prev, { ...prev, [key]: val });
  // useEffect(() => {

  // }, [settings])

  const scrollTop = useCallback(() => {
    containerRef.current.scrollTop = 0;
  }, [containerRef]);

  const setOrderBy = (field, orderType) => {
    setProp('orderBy', { field, orderType });
  }

  return { ctx, setCtx, scrollTop, setOrderBy };
}