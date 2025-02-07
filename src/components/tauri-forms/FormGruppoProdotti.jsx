import { useEffect, useRef, useState } from 'react';
import useLogger from '../../hooks/useLogger';
import { Button, LinkButton, LoadingButton } from '../buttons';
import Input from '../form/Input';
import Select, { useSelectData } from '../form/Select';
import useFormState from '../form/useFormState';
import useFormValidation from '../form/useFormValidation';
import tableStyles from '../../styles/table.module.css';
import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/20/solid';
import { safeExecuteQuery } from '../../lib/tauri';
import { InsertBuilder, SelectBuilder, UpdateBuilder } from '../../lib/query-builders';

function FormGruppoProdotti({ entity, onSaveSuccess, onSaveError, idAzienda }) {
  // STATE
  const [formState, addFormState, handleInputChange, handleIntInputChange] = useFormState();

  // VALIDATION
  const [errors, validateForm] = useFormValidation(addError => {
    !formState.nome && addError('nome', 'Campo obbligatorio');
    !formState.idAzienda && addError('idAzienda', 'Campo obbligatorio');
    !formState.idCategoria && addError('idCategoria', 'Campo obbligatorio');
    !formState.prodotti?.length && addError('prodotti', 'Inserire almeno un prodotto');
  });

  // INIT STATE
  useEffect(() => {
    addFormState('prodotti', []);
  }, []);
  useEffect(() => {
    if (!entity) return;
    Object.keys(entity).forEach(key => addFormState(key, entity[key]));
  }, [entity]);
  useLogger('form-change', formState);

  useEffect(() => {
    if (entity || !idAzienda) return;
    addFormState('idAzienda', idAzienda);
  }, [idAzienda]);

  // SELECT DATA
  const [aziende, ,] = useSelectData('azienda', { orderBy: { nome: 'asc' } }, 'id', 'nome');
  const [categorie, ,] = useSelectData('categoriaProdotto', { orderBy: { nome: 'asc' } }, 'id', 'nome');

  // GESTIONE PRODOTTI
  const newProductInputRef = useRef();

  const handleAddProduct = () => {
    if (newProductInputRef.current.value) {
      if (!formState.prodotti.map(p => p.nome).includes(newProductInputRef.current.value)) {
        addFormState('prodotti', [...formState.prodotti, { nome: newProductInputRef.current.value }]);
        newProductInputRef.current.value = '';
        newProductInputRef.current.focus();
      }
    }
  };

  const handleRemoveProduct = nome => {
    addFormState(
      'prodotti',
      formState.prodotti.filter(p => p.nome != nome)
    );
  };

  // HANDLE SAVE
  const onSaveOk = gruppo => (onSaveSuccess ? onSaveSuccess(gruppo) : alert('Salvataggio avvenuto con successo!'));
  const onSaveErr = () =>
    onSaveError ? onSaveError() : alert('Errore durante il salvataggio! Controlla i dati e riprova');

  const createProduct = async (idGruppo, prodotto) => {
    await safeExecuteQuery(
      new InsertBuilder('Prodotto')
        .addStringColumnValue('nome', prodotto.nome)
        .addColumnValue('idGruppo', idGruppo)
        .build()
    );
  };

  const createGruppoWithProdotti = async () => {
    // Create Gruppo
    const insert = new InsertBuilder('GruppoProdotti')
      .addColumnValue('idAzienda', formState.idAzienda)
      .addColumnValue('idCategoria', formState.idCategoria);
    if (formState.nome) insert.addStringColumnValue('nome', formState.nome);
    await safeExecuteQuery(insert.build());
    // Recupero id Gruppo
    const select = new SelectBuilder('GruppoProdotti').addField('id').setPagination(0, 1).addOrderBy('id', 'DESC');
    const [{ id: idGruppo }] = await safeExecuteQuery(select.build());
    // Create prodotti
    for (const prodotto of formState.prodotti) {
      await createProduct(idGruppo, prodotto);
    }
  };

  const updateGruppoWithProdotti = async () => {
    // Update gruppo
    await safeExecuteQuery(
      new UpdateBuilder('GruppoProdotti')
        .addStringSetParam('nome', formState.nome)
        .addSetParam('idCategoria', formState.idCategoria)
        .addSetParam('idAzienda', formState.idAzienda)
        .addWhereClause('id = ' + entity.id)
        .build()
    );
    // Creazione nuovi prodotti
    for (const prodotto of formState.prodotti) {
      if (!entity.prodotti.includes(prodotto)) await createProduct(entity.id, prodotto);
    }
    // RImozione prodotti mancanti
    for (const prodotto of entity.prodotti) {
      if (!formState.prodotti.includes(prodotto))
        await safeExecuteQuery('DELETE FROM Prodotto WHERE id = ' + prodotto.id);
    }
  };

  const selectSavedGruppoWithProdotti = async () => {
    const [gruppo] = await safeExecuteQuery(
      new SelectBuilder('GruppoProdotti').setPagination(0, 1).addOrderBy('id', 'DESC').build()
    );
    const prodotti = await safeExecuteQuery(
      new SelectBuilder('Prodotto').addWhereClause('idGruppo = ' + gruppo.id).build()
    );
    const [categoria] = await safeExecuteQuery(
      new SelectBuilder('CategoriaProdotto').addWhereClause('id = ' + gruppo.idCategoria).build()
    );
    return { ...gruppo, categoria, prodotti };
  };

  const [loading, setLoading] = useState(false);
  const handleFormSave = async e => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      if (!entity?.id) {
        await createGruppoWithProdotti();
      } else {
        await updateGruppoWithProdotti();
      }
      onSaveOk(await selectSavedGruppoWithProdotti());
    } catch (error) {
      console.error(error);
      onSaveErr();
    }

    setLoading(false);
  };

  return (
    <div className='flex flex-col gap-y-2'>
      <Input
        name='nome'
        label='Nome'
        type='text'
        value={formState.nome}
        onChange={handleInputChange}
        error={errors.nome}
        errorMessage={errors.nome}
      />
      <Select
        name='idAzienda'
        label='Azienda'
        data={aziende}
        value={formState.idAzienda || ''}
        onChange={handleIntInputChange}
        empty='--- nessuna azienda selezionata ---'
        error={errors.idAzienda}
        errorMessage={errors.idAzienda}
        disabled={!entity && idAzienda}
      />
      <Select
        name='idCategoria'
        label='Categoria'
        data={categorie}
        value={formState.idCategoria || ''}
        onChange={handleIntInputChange}
        empty='--- nessuna categoria selezionata ---'
        error={errors.idCategoria}
        errorMessage={errors.idCategoria}
      />
      <p className='font-semibold text-lg'>Prodotti *</p>
      <div className='max-w-xs flex'>
        <Input
          ref={newProductInputRef}
          onKeyUp={e => e.key == 'Enter' && handleAddProduct()}
          error={errors.prodotti}
          errorMessage={errors.prodotti}>
          <Button className='ml-2' color='green' onClick={handleAddProduct}>
            <PlusIcon className='w-5 text-white' />
          </Button>
        </Input>
      </div>
      <div className={tableStyles.container}>
        <table className={tableStyles.customTable}>
          <thead>
            <tr className={tableStyles.headerRow}>
              <th className={tableStyles.headerCell}>Nome</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {formState.prodotti &&
              formState.prodotti.map(prodotto => (
                <tr className={tableStyles.row}>
                  <td className={tableStyles.cell}>
                    <span className='font-semibold'>{prodotto.nome}</span>
                  </td>
                  <td className={tableStyles.cell}>
                    <div className='float-right flex gap-2'>
                      {prodotto.id && (
                        <LinkButton color='blue' href={'/prodotti/edit?id=' + prodotto.id}>
                          <PencilIcon className='h-4' />
                        </LinkButton>
                      )}
                      <Button color='red' onClick={() => handleRemoveProduct(prodotto.nome)}>
                        <TrashIcon className='h-4' />
                      </Button>
                    </div>
                  </td>
                  <td className={tableStyles.rowBackground}></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <LoadingButton className='w-fit' color='green' onClick={handleFormSave} loading={loading}>
        SALVA
      </LoadingButton>
    </div>
  );
}

export default FormGruppoProdotti;
