import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Page, PageTitle } from '../../components/Layout';
import FormAzienda from '../../components/tauri-forms/FormAzienda';
import { SelectBuilder } from '../../lib/query-builders';
import { executeQuery } from '../../lib/tauri';

export default function () {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [entity, setEntity] = useState(null);

  useEffect(() => {
    if (!router?.isReady) return;

    const id = parseInt(router.query.id);
    if (!id) {
      setLoading(false);
      return;
    }

    executeQuery(new SelectBuilder('azienda').addWhereClause('id = ' + id).build())
      .then(({ data: [data], error }) => {
        setEntity(data);
        if (error) {
          console.error(error);
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>ERROR</p>;

  return (
    <Page>
      {<PageTitle>{entity ? 'Modifica' : 'Nuova'} azienda</PageTitle>}
      <div className='h-4'></div>
      <FormAzienda entity={entity} onSaveSuccess={() => router.push('/aziende')} />
    </Page>
  );
}
