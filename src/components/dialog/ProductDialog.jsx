import FormProdotto from '../tauri-forms/FormProdotto';
import StyledDialog from './StyledDialog';

export default function ProductDialog({ open, onClose, idAzienda, onSaveSuccess }) {
  return (
    <StyledDialog title='Nuovo prodotto' isOpen={open} onClose={onClose}>
      <div className='mt-3'>
        <FormProdotto idAzienda={idAzienda} onSaveSuccess={onSaveSuccess} />
      </div>
    </StyledDialog>
  );
}
