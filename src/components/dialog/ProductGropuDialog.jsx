import FormGruppoProdotti from '../tauri-forms/FormGruppoProdotti';
import StyledDialog from './StyledDialog';

export default function ProductGroupDialog({ open, onClose, idAzienda, onSaveSuccess }) {
  return (
    <StyledDialog title='Nuovo gruppo prodotti' isOpen={open} onClose={onClose}>
      <div className='mt-3'>
        <FormGruppoProdotti idAzienda={idAzienda} onSaveSuccess={onSaveSuccess} />
      </div>
    </StyledDialog>
  );
}
