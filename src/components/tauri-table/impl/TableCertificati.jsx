import TableCell from '../TableCell';
import TableRow from '../TableRow';
import TauriTable from '../TauriTable';
import Link from 'next/link';
import { Button } from '../../buttons';
import { executeQuery } from '../../../lib/tauri';
import { SelectBuilder } from '../../../lib/query-builders';
import PDFCertificato from '../../../lib/pdf';

const SETTINGS = {
  entityName: 'Certificato',
  entityAlias: 'c',
  displayName: 'Bozze Certificati',
  join: [{ name: 'Azienda', alias: 'a', field1: 'c.idAzienda', field2: 'a.id' }],
  selectFields: {
    'c.id': 'id',
    'a.nome': 'azienda',
    'c.note': 'note'
  },
  columns: [
    {
      colNames: ['id'],
      headers: ['#'],
      template: '80px'
    },
    {
      colNames: ['azienda'],
      headers: ['Azienda'],
      template: '20%'
    },
    {
      colNames: ['note'],
      headers: ['Note'],
      template: '100%'
    },
    { empty: true, template: 'auto' }
  ],
  orderBy: { 'c.id': 'DESC' }
};

async function fetchProdottiCertificati(idCertificato) {
  const { data: prodottiCertificati } = await executeQuery(
    new SelectBuilder('ProdottoCertificato').addWhereClause('idCertificato = ' + idCertificato).build()
  );

  let result = [];
  for (const prodottoCertificato of prodottiCertificati) {
    const {
      data: [prodotto]
    } = await executeQuery(
      new SelectBuilder('Prodotto').addWhereClause('id = ' + prodottoCertificato.idProdotto).build()
    );
    const {
      data: [gruppo]
    } = await executeQuery(new SelectBuilder('GruppoProdotti').addWhereClause('id = ' + prodotto.idGruppo).build());
    const {
      data: [categoria]
    } = await executeQuery(new SelectBuilder('CategoriaProdotto').addWhereClause('id = ' + gruppo.idCategoria).build());
    result.push({ ...prodottoCertificato, prodotto: { ...prodotto, gruppo: { ...gruppo, categoria } } });
  }
  return result;
}

async function fetchCertificatoAndGeneraPdf(id) {
  console.log("GENERATIN PDFF")
  var {
    data: [certificato],
    error
  } = await executeQuery(new SelectBuilder('Certificato').addWhereClause('id = ' + id).build());
  if (error) throw error;
  var {
    data: [azienda],
    error
  } = await executeQuery(new SelectBuilder('Azienda').addWhereClause('id = ' + certificato.idAzienda).build());
  if (error) throw error;
  var { data: brandCertificati, error } = await executeQuery(
    new SelectBuilder('BrandCertificato').addWhereClause('idCertificato = ' + certificato.id).build()
  );
  if (error) throw error;
  var CertificatoCompleto = {
    ...certificato,
    azienda,
    brandCertificati,
    prodottiCertificati: await fetchProdottiCertificati(id)
  };
  new PDFCertificato(CertificatoCompleto).save();
}

function RowCertificato({ data }) {
  return (
    <TableRow>
      <TableCell>
        <span className='font-medium text-gray-500 text-center'>{data.id}</span>
      </TableCell>
      <TableCell>
        <p className='text-sky-500 font-medium'>{data.azienda}</p>
      </TableCell>
      <TableCell>
        <p className='text-slate-500'>{data.note}</p>
      </TableCell>
      <TableCell>
        <div className='flex gap-2'>
          <Link href={'/certificati/edit?id=' + data.id}>
            <Button color='blue'>APRI</Button>
          </Link>
          <Button color='blue' onClick={() => fetchCertificatoAndGeneraPdf(data.id)}>
            PDF
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function () {
  return <TauriTable settings={SETTINGS} RowComponent={RowCertificato} />;
}
