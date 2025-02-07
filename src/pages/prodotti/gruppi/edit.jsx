import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Page, PageTitle } from '../../../components/Layout';
import FormGruppoProdotti from '../../../components/tauri-forms/FormGruppoProdotti';
import useLogger from '../../../hooks/useLogger';
import { executeQuery, safeExecuteQuery } from '../../../lib/tauri';
import { SelectBuilder } from '../../../lib/query-builders';

async function selectGruppoWithProdotti(idGruppo) {
  const [gruppo] = await safeExecuteQuery(
    new SelectBuilder('gruppoProdotti', 'g').addWhereClause('g.id = ' + idGruppo).build()
  );

  const prodotti = await safeExecuteQuery(
    new SelectBuilder('prodotto', 'p').addWhereClause('p.idGruppo = ' + idGruppo).build()
  );

  return { ...gruppo, prodotti };
}

function GruppoProdottiPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [entity, setEntity] = useState(null);

  useEffect(() => {
    (async () => {
      if (!router?.isReady) return;

      const idGruppo = parseInt(router.query.id);
      if (!idGruppo) {
        setLoading(false);
        return;
      }

      try {
        const entity = await selectGruppoWithProdotti(idGruppo);
        setEntity(entity);
      } catch (error) {
        console.error("CHELL?é", error)
        setError(true);
      }

      setLoading(false);
    })();
  }, [router]);

  useLogger('GRUPPO CON PRODOTTI', entity);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>ERROR</p>;

  return (
    <Page>
      {<PageTitle>{entity ? 'Modifica' : 'Nuovo'} gruppo prodotti</PageTitle>}
      <div className='h-4'></div>
      <FormGruppoProdotti entity={entity} onSaveSuccess={() => router.push('/prodotti')} />
    </Page>
  );
}

export default GruppoProdottiPage;
