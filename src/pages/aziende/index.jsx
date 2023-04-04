import { Page, PageTitle } from '../../components/Layout';
import TableAziende from '../../components/tauri-table/impl/TableAziende';
import { LinkButton } from '../../components/buttons';

export default function () {
  return (
    <Page className='h-screen flex flex-col'>
      <div className='flex gap-8 items-center mb-4'>
        <PageTitle>Aziende</PageTitle>
        <LinkButton href='/aziende/edit?id=nuova' color='green'>
          NUOVA
        </LinkButton>
      </div>
      <TableAziende />
    </Page>
  );
}
