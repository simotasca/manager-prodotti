import TableCell from '../TableCell';
import TableRow from '../TableRow';
import TauriTable from '../TauriTable';

const SETTINGS = {
  entityName: 'CategoriaProdotto',
  entityAlias: 'c',
  displayName: 'Categoria',
  selectFields: {
    'c.id': 'id',
    'c.nome': 'nome'
  },
  columns: [
    {
      colNames: ['id'],
      headers: ['#'],
      template: '80px'
    },
    {
      colNames: ['nome'],
      headers: ['Azienda'],
      template: '100%'
    },
    { empty: true, template: 'auto' }
  ],
  orderBy: { nome: 'ASC' },
  skip: 0,
  take: 50
};

function RowCategoria({ data }) {
  return (
    <TableRow>
      <TableCell>
        <span className='font-medium text-gray-500 text-center'>{data.id}</span>
      </TableCell>
      <TableCell>
        <span className='text-sky-500 font-medium'>{data.nome}</span>
      </TableCell>
      <TableCell>
        <div className='flex gap-2'>
          <a
            href={'/categorie/edit?id=' + data.id}
            className='bg-gradient-to-tl from-sky-400 to-blue-400 text-white rounded-md text-sm px-2 py-1 font-semibold tracking-wide'>
            APRI
          </a>
        </div>
      </TableCell>
    </TableRow>
  );
}

function TableCategorie() {
  return <TauriTable settings={SETTINGS} RowComponent={RowCategoria} />;
}

export default TableCategorie;
