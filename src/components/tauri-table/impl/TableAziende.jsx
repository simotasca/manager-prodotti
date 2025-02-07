import TableCell from '../TableCell';
import TableRow from '../TableRow';
import TauriTable from '../TauriTable';

const SETTINGS = {
  entityName: 'azienda',
  entityAlias: 'a',
  displayName: 'Azienda',
  selectFields: {
    // { [field]: "alias" }
    'a.id': 'id',
    'a.nome': 'nome',
    'a.indirizzo': 'indirizzo',
    'a.localita': 'localita'
  },
  columns: [
    {
      colNames: ['id'],
      headers: ['#'],
      template: '60px'
    },
    {
      colNames: ['nome', 'indirizzo'],
      headers: ['Azienda', 'Indirizzo'],
      template: '100%'
    },
    { empty: true, template: 'auto' }
  ],
  orderBy: { nome: 'ASC' },
  skip: 0,
  take: 50
};

function RowAziende({ data }) {
  return (
    <TableRow>
      <TableCell>
        <span className='font-medium text-gray-500 text-center'>{data.id}</span>
      </TableCell>
      <TableCell>
        <div className='leading-5'>
          <p className='text-sky-500 font-medium'>{data.nome}</p>
          <p className='text-gray-400'>
            {data.localita}, {data.indirizzo}
          </p>
        </div>
      </TableCell>
      <TableCell>
        <div className='flex gap-2'>
          <a
            href={'/aziende/edit?id=' + data.id}
            className='bg-gradient-to-tl from-sky-400 to-blue-400 text-white rounded-md text-sm px-2 py-1 font-semibold tracking-wide'>
            APRI
          </a>
          <a
            href={'/certificati/edit?id=nuovo&azienda=' + data.id}
            className='bg-gradient-to-tl from-orange-400 to-red-400 text-white rounded-md text-sm px-2 py-1 font-semibold tracking-wide'>
            CERTIFICA
          </a>
        </div>
      </TableCell>
    </TableRow>
  );
}

function TableAziende() {
  return <TauriTable settings={SETTINGS} RowComponent={RowAziende} />;
}

export default TableAziende;
