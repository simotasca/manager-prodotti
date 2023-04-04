import { useEffect, useState } from 'react';
import { InsertBuilder, UpdateBuilder } from '../../lib/query-builders';
import { safeExecuteQuery } from '../../lib/tauri';
import { LoadingButton } from '../buttons';
import Input from '../form/Input';
import useFormState from '../form/useFormState';
import useFormValidation from '../form/useFormValidation';

function FormAzienda({ entity, onSaveSuccess, onSaveError }) {
  // STATE
  const [formState, addFormState, handleInputChange, handleIntInputChange] = useFormState();

  useEffect(() => {
    if (!entity) return;
    Object.keys(entity).forEach(key => addFormState(key, entity[key]));
  }, [entity]);

  // VALIDATION
  const [errors, validateForm] = useFormValidation(addError => {
    !formState.nome && addError('nome', 'Campo obbligatorio');
  });

  // SALVATAGGIO
  const updateAzienda = async () => {
    const builder = new UpdateBuilder('Azienda').addWhereClause('id = ' + entity.id);
    Object.keys(formState).forEach(key => {
      switch (key) {
        case 'id':
          return;
        case 'cap':
          formState[key] && builder.addSetParam(key, String(formState[key]));
          return;
        default:
          formState[key] && builder.addStringSetParam(key, String(formState[key]));
          return;
      }
    });
    await safeExecuteQuery(builder.build());
  };

  const insertAzienda = async () => {
    const builder = new InsertBuilder('Azienda');
    Object.keys(formState).forEach(key => {
      switch (key) {
        case 'id':
          return;
        case 'cap':
          formState[key] && builder.addColumnValue(key, String(formState[key]));
          return;
        default:
          formState[key] && builder.addStringColumnValue(key, String(formState[key]));
          return;
      }
    });
    await safeExecuteQuery(builder.build());
  };

  const [loading, setLoading] = useState();
  const handleFormSave = async e => {
    e.preventDefault();

    if (!validateForm()) return;
    setLoading(true);

    try {
      if (entity?.id) {
        await updateAzienda();
      } else {
        await insertAzienda();
      }
      onSaveSuccess && onSaveSuccess();
    } catch (e) {
      console.error(e);
      onSaveError && onSaveError(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col gap-y-2'>
      <Input
        name='nome'
        label='Nome'
        placeholder='nome'
        type='text'
        value={formState.nome || ''}
        onChange={handleInputChange}
        error={errors.nome}
        errorMessage={errors.nome}
      />
      <Input
        name='indirizzo'
        label='Indirizzo'
        placeholder='indirizzo'
        type='text'
        value={formState.indirizzo || ''}
        onChange={handleInputChange}
      />
      <Input
        name='localita'
        label='Localita'
        placeholder='localita'
        type='text'
        value={formState.localita || ''}
        onChange={handleInputChange}
      />
      <Input
        name='cap'
        label='Cap'
        placeholder='cap'
        type='number'
        value={formState.cap || ''}
        onChange={handleInputChange}
      />
      <Input
        name='provincia'
        label='Provincia'
        placeholder='provincia'
        type='text'
        value={formState.provincia || ''}
        onChange={handleInputChange}
      />
      <Input
        name='nazione'
        label='Nazione'
        placeholder='nazione'
        type='text'
        value={formState.nazione || ''}
        onChange={handleInputChange}
      />
      <Input
        name='telefoni'
        label='Telefoni'
        placeholder='telefoni'
        type='text'
        value={formState.telefoni || ''}
        onChange={handleInputChange}
      />
      <Input
        name='mail'
        label='Mail'
        placeholder='mail'
        type='text'
        value={formState.mail || ''}
        onChange={handleInputChange}
      />
      <Input
        name='contatti'
        label='Contatti'
        placeholder='contatti'
        type='text'
        value={formState.contatti || ''}
        onChange={handleInputChange}
      />
      <div></div>
      <LoadingButton color='green' onClick={handleFormSave} className='w-fit' loading={loading}>
        SALVA
      </LoadingButton>
    </div>
  );
}

export default FormAzienda;
