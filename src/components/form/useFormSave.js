import { useState } from 'react';
import { fetchPlus } from '../../lib/utils';

export default function useFormSave(entityName, validateForm, buildUpsertStatement, onSaveSuccess, onError) {
  const [loading, setLoading] = useState();
  const handleSave = e => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    fetchPlus('/api/table/upsert', {
      entity: entityName,
      ...buildUpsertStatement()
    })
      .catch(err => {
        console.error(err);
        onError(err);
      })
      .then(res => res.json())
      .then(gruppoProdotti => {
        if (gruppoProdotti) {
          onSaveSuccess && onSaveSuccess(gruppoProdotti);
        } else onError();
      })
      .finally(() => setLoading(false));
  };
  return [loading, handleSave];
}
