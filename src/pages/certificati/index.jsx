import { LinkButton } from '../../components/buttons';
import { Page, PageTitle } from '../../components/Layout';
import TableCertificati from '../../components/tauri-table/impl/TableCertificati';


function PageCertificati() {
  return (
    <Page>
      <div className='flex gap-8 items-center mb-4'>
        <PageTitle>Bozze certificati</PageTitle>
        <LinkButton href='/certificati/edit?id=nuovo' >NUOVA BOZZA</LinkButton>
      </div>
      <TableCertificati />
    </Page>
  );
}

export default PageCertificati;
