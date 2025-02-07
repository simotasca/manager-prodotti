import TableCell from '../TableCell';
import TableRow from '../TableRow';
import TauriTable from '../TauriTable';

const SETTINGS = {
  entityName: 'Prodotto',
  entityAlias: 'p',
  displayName: 'Prodotti',
  join: [
    { name: 'GruppoProdotti', alias: 'g', field1: 'p.idGruppo', field2: 'g.id' },
    { name: 'Azienda', alias: 'a', field1: 'g.idAzienda', field2: 'a.id' },
    { name: 'CategoriaProdotto', alias: 'c', field1: 'g.idCategoria', field2: 'c.id' }
  ],
  selectFields: {
    'p.id': 'id',
    'p.nome': 'nome',
    'c.nome': 'categoria',
    'g.nome': 'gruppo',
    'a.nome': 'azienda',
    'a.indirizzo': 'indirizzoAzienda'
  },
  columns: [
    {
      colNames: ['id'],
      headers: ['#'],
      template: '60px'
    },
    {
      colNames: ['nome', 'categoria'],
      headers: ['Prodotto', 'Categoria'],
      template: 'auto'
    },
    {
      colNames: ['gruppo'],
      headers: ['Gruppo'],
      template: 'auto'
    },
    {
      colNames: ['azienda', 'indirizzoAzienda'],
      headers: ['Azienda', 'Ind.'],
      template: 'auto'
    },
    { empty: true }
  ],
  orderBy: {'p.id': 'DESC'},
  skip: 0,
  take: 50
};

function RowProdotto({ data }) {
  return (
    <TableRow>
      <TableCell>
        <span className='font-medium text-gray-500 text-center'>{data.id}</span>
      </TableCell>
      <TableCell>
        <div className='leading-5'>
          <p className='text-sky-500 font-medium'>{data.nome}</p>
          <p className='text-gray-400'>{data.categoria}</p>
        </div>
      </TableCell>
      <TableCell>
        <p className='text-slate-600 font-medium'>{data.gruppo || '-'}</p>
      </TableCell>
      <TableCell>
        <div className='leading-5'>
          <p className='text-slate-600 font-medium'>{data.azienda}</p>
          <p className='text-gray-400'>{data.indirizzoAzienda}</p>
        </div>
      </TableCell>
      <TableCell>
        <div className='flex gap-2'>
          <a
            href={'/prodotti/edit?id=' + data.id}
            className='bg-gradient-to-tl from-sky-400 to-blue-400 text-white rounded-md text-sm px-2 py-1 font-semibold tracking-wide'>
            APRI
          </a>
        </div>
      </TableCell>
    </TableRow>
  );
}

function TableProdotti() {
  return <TauriTable settings={SETTINGS} RowComponent={RowProdotto} />;
}

export default TableProdotti;
