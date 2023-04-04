import { LinkButton } from '../../components/buttons';
import { Page, PageTitle } from '../../components/Layout';
import TableProdotti from '../../components/tauri-table/impl/TableProdotti';

export default function ProdottiPage() {
  return (
    <Page className='h-screen flex flex-col'>
      <div className='flex gap-8 items-center mb-4'>
        <PageTitle>Prodotti</PageTitle>
        <div className='flex gap-2'>
          <LinkButton href='/prodotti/edit?id=nuovo'>NUOVO PRODOTTO</LinkButton>
          <LinkButton href='/prodotti/gruppi/edit?id=nuovo'>NUOVO GRUPPO PRODOTTI</LinkButton>
        </div>
      </div>
      <TableProdotti />
    </Page>
  );
}
