import { useEffect, useState } from 'react';
import { executeQuery, safeExecuteQuery } from '../../lib/tauri';
import useFormState from '../form/useFormState';
import { UpdateBuilder, SelectBuilder, InsertBuilder } from '../../lib/query-builders';
import useFormValidation from '../form/useFormValidation';
import Select, { useSelectData } from '../form/Select';
import Input from '../form/Input';
import { Button, LoadingButton } from '../buttons';
import Link from 'next/link';

function FormProdotto({ entity, onSaveSuccess, onSaveError, idAzienda }) {
  // const [data, loading, error] = useInvokeQuery(query);
  // useLogger('PROVA INSERT', data, loading, error);

  const [formState, addFormState, handleInputChange, handleIntInputChange] = useFormState();

  // VALIDATION
  const [errors, validateForm] = useFormValidation(addError => {
    !formState.nome && addError('nome', 'Campo obbligatorio');
    !formState.idAzienda && addError('idAzienda', 'Campo obbligatorio');
    !formState.idCategoria && addError('idCategoria', 'Campo obbligatorio');
  });

  // INIT STATE
  useEffect(() => {
    if (!entity) return;
    addFormState('nome', entity.nome);
    if (!entity.idGruppo) return;
    addFormState('idAzienda', parseInt(entity.idAzienda));
    addFormState('idCategoria', parseInt(entity.idCategoria));
  }, [entity]);

  useEffect(() => {
    if (entity || !idAzienda) return;
    addFormState('idAzienda', idAzienda);
  }, [idAzienda]);

  // SELECT DATA
  const [aziende, ,] = useSelectData('azienda', { orderBy: { nome: 'asc' } }, 'id', 'nome');
  const [categorie, ,] = useSelectData('categoriaProdotto', { orderBy: { nome: 'asc' } }, 'id', 'nome');

  // SALVATAGGIO
  const onSaveOk = prodotto => (onSaveSuccess ? onSaveSuccess(prodotto) : alert('Salvataggio avvenuto con successo!'));
  const onSaveErr = () =>
    onSaveError ? onSaveError() : alert('Errore durante il salvataggio! Controlla i dati e riprova');

  const updateProdotto = async () => {
    let query = new UpdateBuilder('prodotto')
      .addStringSetParam('nome', formState.nome)
      .addWhereClause(`id = ${entity.id}`)
      .build();
    let { data, error } = await executeQuery(query);
    if (error) throw new Error("Errore nell'escuzione della query");
    query = new SelectBuilder('prodotto').addWhereClause(`id = ${entity.id}`).build();
    ({ data, error } = await executeQuery(query));
    if (error) throw new Error("Errore nell'escuzione della query");
    return data[0];
  };

  const updateGruppo = async () => {
    let query = new UpdateBuilder('gruppoProdotti')
      .addSetParam('idCategoria', formState.idCategoria)
      .addSetParam('idAzienda', formState.idAzienda)
      .addWhereClause(`id = ${entity.idGruppo}`)
      .build();
    let { data, error } = await executeQuery(query);
    if (error) throw new Error("Errore nell'escuzione della query");
    query = new SelectBuilder('gruppoProdotti').addWhereClause(`id = ${entity.idGruppo}`).build();
    ({ data, error } = await executeQuery(query));
    if (error) throw new Error("Errore nell'escuzione della query");
    return data[0];
  };

  const saveNuovoProdotto = async () => {
    let query = new InsertBuilder('gruppoProdotti')
      .addColumnValue('idCategoria', String(formState.idCategoria))
      .addColumnValue('idAzienda', String(formState.idAzienda))
      .build();

    let { data, error } = await executeQuery(query);
    if (error) throw new Error("Errore nell'escuzione della query");

    query = new SelectBuilder('gruppoProdotti').addOrderBy('id', 'DESC').setPagination(0, 1).build();
    ({ data, error } = await executeQuery(query));
    if (error) throw new Error("Errore nell'escuzione della query");

    const idGruppoProdotti = data[0].id;

    query = new InsertBuilder('prodotto')
      .addStringColumnValue('nome', formState.nome)
      .addColumnValue('idGruppo', idGruppoProdotti)
      .build();

    ({ data, error } = await executeQuery(query));
    if (error) throw new Error("Errore nell'escuzione della query");

    const [savedProduct] = await safeExecuteQuery(
      new SelectBuilder('Prodotto').addOrderBy('id', 'DESC').setPagination(0, 1).build()
    );
    return savedProduct;
  };

  const [loading, setLoading] = useState();
  const handleFormSave = async e => {
    e.preventDefault();

    if (!validateForm()) return;
    setLoading(true);

    try {
      let prodotto;
      if (entity?.id) {
        prodotto = await updateProdotto();
        if (!entity.nomeGruppo) await updateGruppo();
      } else {
        const newProduct = await saveNuovoProdotto();
        prodotto = newProduct;
      }
      onSaveOk(prodotto);
    } catch (e) {
      console.error(e);
      onSaveErr();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col gap-y-2'>
      {entity?.nomeGruppo && (
        <div>
          <p className='text-sm font-semibold'>Gruppo</p>
          <div className='flex gap-2 items-center'>
            <Input value={entity.nomeGruppo} disabled />
            <Link href={'/prodotti/gruppi/edit?id=' + entity.idGruppo}>
              <Button color='green'>MODIFICA GRUPPO</Button>
            </Link>
          </div>
        </div>
      )}
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
      <Select
        name='idAzienda'
        label='Azienda'
        data={aziende}
        value={formState.idAzienda || ''}
        onChange={handleIntInputChange}
        empty='--- nessuna azienda selezionata ---'
        error={errors.idAzienda}
        errorMessage={errors.idAzienda}
        disabled={entity?.nomeGruppo || (!entity && idAzienda)}
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
        disabled={entity?.nomeGruppo}
      />
      <div></div>
      <LoadingButton color='green' onClick={handleFormSave} className='w-fit' loading={loading}>
        SALVA
      </LoadingButton>
    </div>
  );
}

export default FormProdotto;
