import { useEffect, useState } from 'react';
import { InsertBuilder, UpdateBuilder } from '../../lib/query-builders';
import { safeExecuteQuery } from '../../lib/tauri';
import { LoadingButton } from '../buttons';
import Input from '../form/Input';
import useFormState from '../form/useFormState';
import useFormValidation from '../form/useFormValidation';

function FormCategoriaProdotto({ entity, onSaveSuccess, onSaveError }) {
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
  const updateCategoria = async () => {
    const builder = new UpdateBuilder('CategoriaProdotto').addWhereClause('id = ' + entity.id);
    Object.keys(formState).forEach(key => {
      switch (key) {
        case 'id':
          return;
        default:
          formState[key] && builder.addStringSetParam(key, String(formState[key]));
          return;
      }
    });
    await safeExecuteQuery(builder.build());
  };

  const insertCategoria = async () => {
    const builder = new InsertBuilder('CategoriaProdotto');
    Object.keys(formState).forEach(key => {
      switch (key) {
        case 'id':
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
        await updateCategoria();
      } else {
        await insertCategoria();
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
      <div></div>
      <LoadingButton color='green' onClick={handleFormSave} className='w-fit' loading={loading}>
        SALVA
      </LoadingButton>
    </div>
  );
}

export default FormCategoriaProdotto;
