import { useEffect, useState } from "react";
import { executeQuery, handleIsTauri } from '../lib/tauri'

export default function useInvokeQuery(query, dependencies = []) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (handleIsTauri()) {
      
      setLoading(true);

      executeQuery(query).then(({ data, error }) => {
        setData(data);
        setError(error);
      }).finally(setLoading(false));
    }
  }, [query, ...dependencies]);

  return [data, loading, error];
}