import { Page, PageTitle } from '../../components/Layout';
import { useRouter } from 'next/router';
import FormCertificato from '../../components/tauri-forms/FormCertificato';
import { useEffect, useState } from 'react';
import { safeExecuteQuery } from '../../lib/tauri';
import { SelectBuilder } from '../../lib/query-builders';

async function retrieveEntity(idCertificato) {
  const [certificato] = await safeExecuteQuery(
    new SelectBuilder('Certificato').addWhereClause('id = ' + idCertificato).build()
  );
  const prodottiCertificati = await safeExecuteQuery(
    new SelectBuilder('ProdottoCertificato').addWhereClause('idCertificato = ' + idCertificato).build()
  );
  for (let i = 0; i < prodottiCertificati.length; i++) {
    const prodCert = prodottiCertificati[i];
    const [prodotto] = await safeExecuteQuery(
      new SelectBuilder('prodotto').addWhereClause('id = ' + prodCert.idProdotto).build()
    );
    const [gruppo] = await safeExecuteQuery(
      new SelectBuilder('gruppoProdotti').addWhereClause('id = ' + prodotto.idGruppo).build()
    );
    const [categoria] = await safeExecuteQuery(
      new SelectBuilder('categoriaProdotto').addWhereClause('id = ' + gruppo.idCategoria).build()
    );
    prodottiCertificati[i].prodotto = { ...prodotto, gruppo: { ...gruppo, categoria } };
  }
  return { ...certificato, prodottiCertificati };
}

export default function CertificatoPage() {
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

    retrieveEntity(id)
      .then(setEntity)
      .catch(err => {
        console.error(err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>ERROR</p>;

  return (
    <Page>
      {<PageTitle>{router.query.id ? 'Modifica' : 'Nuovo'} certificato</PageTitle>}
      <div className='h-4'></div>
      <FormCertificato entity={entity} onSaveSuccess={() => router.push('/certificati')} />
    </Page>
  );
}
