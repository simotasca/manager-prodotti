import { Page, PageTitle } from '../../components/Layout';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import FormProdotto from '../../components/tauri-forms/FormProdotto';
import { executeQuery } from '../../lib/tauri';
import { SelectBuilder } from '../../lib/query-builders';

export default function ProdottoPage() {
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

    executeQuery(
      new SelectBuilder('prodotto', 'p')
        .addField('p.id', 'id')
        .addField('p.nome', 'nome')
        .addField('p.idGruppo', 'idGruppo')
        .addField('g.nome', 'nomeGruppo')
        .addField('g.idAzienda', 'idAzienda')
        .addField('g.idCategoria', 'idCategoria')
        .addJoin('gruppoProdotti', 'g', 'p.idGruppo', 'g.id')
        .addWhereClause('p.id = ' + id)
        .build()
    )
      .then(({ data, error }) => {
        setEntity(data[0]);
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
      {<PageTitle>{entity ? 'Modifica' : 'Nuovo'} prodotto</PageTitle>}
      <div className='h-4'></div>
      <FormProdotto entity={entity} onSaveSuccess={() => router.push('/prodotti')} />
    </Page>
  );
}
