import { Page, PageTitle } from '../../components/Layout';
import { LinkButton } from '../../components/buttons';
import TableCategorie from '../../components/tauri-table/impl/TableCategorie';

export default function () {
  return (
    <Page className='h-screen flex flex-col'>
      <div className='flex gap-8 items-center mb-4'>
        <PageTitle>Categorie</PageTitle>
        <LinkButton href='/categorie/edit?id=nuova' color='green'>
          NUOVA
        </LinkButton>
      </div>
      <TableCategorie />
    </Page>
  );
}
