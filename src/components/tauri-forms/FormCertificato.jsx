import { TrashIcon } from '@heroicons/react/20/solid';
import { PencilSquareIcon, PlusIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import useLogger from '../../hooks/useLogger';
import { SelectBuilder, InsertBuilder, UpdateBuilder } from '../../lib/query-builders';
import { executeQuery, safeExecuteQuery } from '../../lib/tauri';
import { dateString } from '../../lib/utils';
import tableStyles from '../../styles/table.module.css';
import { Button, LoadingButton } from '../buttons';
import ProductDialog from '../dialog/ProductDialog';
import ProductGroupDialog from '../dialog/ProductGropuDialog';
import StyledDialog from '../dialog/StyledDialog';
import Input from '../form/Input';
import Select, { useSelectData } from '../form/Select';
import Textarea from '../form/Textarea';
import useFormState from '../form/useFormState';
import useFormValidation from '../form/useFormValidation';

function objectMap(obj, callback) {
  console.log(obj);
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, callback([k, v])]));
}

function CommentDialog({ open, onClose, product, comments, addComment }) {
  const [inputValue, setInputValue] = useState('');
  useEffect(() => setInputValue(product ? comments[product.gruppo.id] || '' : ''), [product]);

  const title = 'Aggiungi commento a: ' + (product?.gruppo?.nome || product?.nome);

  // const handleKeyUp = event => {
  //   if (event.key !== 'Enter') return;
  //   addComment(product.gruppo.id, inputValue);
  //   onClose();
  // };

  return (
    <StyledDialog title={title} isOpen={open} onClose={onClose}>
      <div className='mt-2'>
        <Textarea value={inputValue} onChange={e => setInputValue(e.target.value)} />
        <div className='flex mt-2 gap-1'>
          <Button
            color='green'
            onClick={() => {
              addComment(product.gruppo.id, inputValue);
              onClose();
            }}>
            Applica
          </Button>
          <Button
            color='orange'
            onClick={() => {
              addComment(product.gruppo.id, null);
              onClose();
            }}>
            Elimina
          </Button>
        </div>
      </div>
    </StyledDialog>
  );
}

function CertificateNotesDialog({ open, onClose, noteCertificato, setNoteAndSave }) {
  const [inputValue, setInputValue] = useState('');
  useEffect(() => {
    setInputValue(noteCertificato || '');
  }, [noteCertificato]);

  const saveAndClose = () => {
    setNoteAndSave(inputValue);
    onClose();
  };

  const handleInputKeyUp = event => event.key == 'Enter' && saveAndClose();

  return (
    <StyledDialog title='Salva con nome' isOpen={open} onClose={onClose}>
      <div className='mt-2'>
        <Input value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyUp={handleInputKeyUp} />
        <div className='flex mt-2 gap-1'>
          <Button color='green' onClick={saveAndClose}>
            Salva
          </Button>
          <Button color='orange' onClick={onClose}>
            Annulla
          </Button>
        </div>
      </div>
    </StyledDialog>
  );
}

async function retrieveCompanyProducts(idAzienda) {
  var { data: prodotti, error } = await executeQuery(
    new SelectBuilder('Prodotto', 'p')
      .addField('p.*')
      .addJoin('GruppoProdotti', 'g', 'g.id', 'p.idGruppo')
      .addJoin('azienda', 'a', 'g.idAzienda', 'a.id')
      .addWhereClause('a.id = ' + idAzienda)
      .build()
  );
  if (error) throw error;
  for (let i = 0; i < prodotti.length; i++) {
    const prodotto = prodotti[i];
    var {
      data: [gruppo],
      error
    } = await executeQuery(
      new SelectBuilder('GruppoProdotti', 'g')
        .addJoin('prodotto', 'p', 'p.idGruppo', 'g.id')
        .addField('g.*')
        .addWhereClause('p.id = ' + prodotto.id)
        .build()
    );
    if (error) throw error;
    var {
      data: [categoria],
      error
    } = await executeQuery(
      new SelectBuilder('GruppoProdotti', 'g')
        .addJoin('CategoriaProdotto', 'c', 'c.id', 'g.idCategoria')
        .addField('c.*')
        .addWhereClause('c.id = ' + gruppo.idCategoria)
        .build()
    );
    if (error) throw error;
    prodotti[i].gruppo = { ...gruppo, categoria };
  }
  return prodotti;
}

export default function FormCertificato({ entity, onSaveSuccess }) {
  const router = useRouter();

  //#region STATE //////////
  const [formState, addFormState, handleInputChange] = useFormState();
  const [companyProducts, setCompanyProducts] = useState([]);
  //#endregion

  //#region INIT STATE //////////
  const addEntityToState = entity => {
    if (!entity) return;
    Object.keys(entity).forEach(key => {
      switch (key) {
        case 'passover':
          addFormState(key, entity[key] === '1');
          break;
        default:
          addFormState(key, entity[key]);
          break;
      }
    });

    if (entity.prodottiCertificati) {
      setComments(entity.prodottiCertificati.reduce((prev, pc) => ({ ...prev, [pc.prodotto.gruppo.id]: pc.note }), {}));
    }
  };

  useLogger('formStateLogger', formState);

  useEffect(() => {
    if (!entity) return;
    addEntityToState(entity);
  }, [entity]);

  useEffect(() => {
    addFormState('prodottiCertificati', []);
  }, []);
  //#endregion

  //#region GESTIONE AZIENDA //////////
  const [aziende, ,] = useSelectData('azienda', { orderBy: { nome: 'asc' } }, 'id', 'nome');

  const queryStringAzienda = parseInt(router.query.azienda);
  useEffect(() => {
    if (queryStringAzienda) addFormState('idAzienda', queryStringAzienda);
  }, [queryStringAzienda]);

  const loadCompanyProducts = () => {
    const idAzienda = parseInt(formState.idAzienda);
    if (!idAzienda) return;
    retrieveCompanyProducts(idAzienda).then(setCompanyProducts);
  };

  useEffect(() => {
    loadCompanyProducts();
    if (entity && formState.idAzienda == entity.idAzienda) {
      setCertificateProducts(() => entity.prodottiCertificati);
    } else setCertificateProducts(() => []);
  }, [formState.idAzienda, entity]);
  //#endregion

  //#region GESTIONE PRODOTTI CERTIFICATO //////////
  const tableContainerRef = useRef();
  const [selectedProduct, setSelectedProduct] = useState(null);

  const certificateProducts = formState?.prodottiCertificati || [];
  const setCertificateProducts = callback => {
    addFormState('prodottiCertificati', callback(formState.prodottiCertificati));
  };
  const addCertificateProdocuts = (...products) => {
    setCertificateProducts(current => [...current, ...products]);
    setTimeout(() => {
      if (tableContainerRef?.current) tableContainerRef.current.scrollTop = tableContainerRef.current.scrollHeight;
      window.scrollTo(0, document.body.scrollHeight);
    }, 50);
  };
  const addNewProductsToCertificate = (...products) => {
    addCertificateProdocuts(...products.map(product => ({ idProdotto: product.id, prodotto: product })));
  };

  const selectCompanyProductsData = companyProducts
    .filter(
      selectProduct =>
        !certificateProducts.find(certificateProduct => selectProduct.id == certificateProduct.idProdotto)
    )
    .map(product => ({
      key: product.id,
      value: (product.gruppo?.nome ? product.gruppo.nome + ' - ' : '') + product.nome
    }));

  const handleProductsSelectChange = e =>
    setSelectedProduct(companyProducts.find(prodotto => prodotto.id == e.target.value));

  const handleAddSelectedProduct = () => {
    if (!selectedProduct || certificateProducts.find(certProduct => certProduct.idProdotto == selectedProduct.id))
      return;
    // se il prodotto era già presente nella entity aggiungo l'originale che contiene anche idCertificato
    // in questo modo al salvataggio non si cercherà di sovrascrivere il salvataggio
    let productToAdd = entity && entity.prodottiCertificati.find(p => p.prodotto.id == selectedProduct.id);
    if (!productToAdd) productToAdd = { idProdotto: selectedProduct.id, prodotto: selectedProduct };
    addCertificateProdocuts(productToAdd);
    setSelectedProduct(null);
  };
  //#endregion

  //#region GESTIONE COMMENTI //////////
  const [comments, setComments] = useState({});
  const addComment = (groupId, comment) => {
    if (comments[groupId] !== comment) setComments(previous => ({ ...previous, [groupId]: comment }));
  };
  //#endregion

  //#region STATE DIALOG //////////
  const [isProductDialog, setIsProductDialog] = useState(false);
  const [isGroupDialog, setIsGroupDialog] = useState(false);
  const [commentDialogProduct, setCommentDialogProduct] = useState(null);
  const [isCertificateNotesDialog, setIsCertificateNotesDialog] = useState(false);
  //#endregion

  //#region VALIDAZIONE CERTIFICATO //////////
  const [errors, validateForm] = useFormValidation(addError => {
    !formState.idAzienda && addError('idAzienda', 'Campo obbligatorio');
    !formState.livelloKashrut && addError('livelloKashrut', 'Campo obbligatorio');
    !formState.emissione && addError('emissione', 'Campo obbligatorio');
    if (formState.emissione && formState.scadenza) {
      const dateEmissione = new Date(formState.emissione);
      const dateScadenza = new Date(formState.scadenza);
      if (dateEmissione && dateScadenza) {
        if (dateScadenza.getTime() <= dateEmissione.getTime())
          formState.scadenza && addError('scadenza', "La scadenza deve essere maggiore dell'emissione");
      }
    }
    formState.idAzienda &&
      !formState.prodottiCertificati?.length &&
      addError('prodottiCertificati', 'Inserisci almeno un prodotto');
  });
  //#endregion

  //#region GESTIONE SALVATAGGIO //////////
  const [doSave, setDoSave] = useState(false);

  const mapperProdottiCertificati = prodottoCertificato => {
    // aggiunge le note ai prodotti da salvare
    // ogni prodotto di un gruppo ha la nota di quel gruppo
    const mapped = { idProdotto: prodottoCertificato.idProdotto };
    const note = comments[prodottoCertificato.prodotto.idGruppo];
    if (note) mapped.note = note;
    return mapped;
  };

  const upsertCertificato = async () => {
    let idCertificato = null;

    if (entity?.id) {
      // UPDATE
      idCertificato = entity.id;
      const update = new UpdateBuilder('Certificato').addWhereClause('id = ' + idCertificato);
      Object.keys(formState).forEach(key => {
        switch (key) {
          case 'passover':
            update.addSetParam(key, formState[key] ? '1' : '0');
            break;
          case 'note':
          case 'livelloKashrut':
          case 'behalf':
          case 'emissione':
          case 'scadenza':
          case 'localitaProduzione':
          case 'nazioneProduzione':
          case 'brand':
            formState[key] && update.addStringSetParam(key, formState[key]);
            break;
          case 'prodottiCertificati':
            break;
          default:
            formState[key] && update.addSetParam(key, formState[key]);
            break;
        }
      });
      const { error } = await executeQuery(update.build());
      if (error) throw error;
    } else {
      // CREATE
      const insert = new InsertBuilder('Certificato');
      Object.keys(formState).forEach(key => {
        switch (key) {
          case 'note':
          case 'livelloKashrut':
          case 'behalf':
          case 'emissione':
          case 'scadenza':
          case 'localitaProduzione':
          case 'nazioneProduzione':
            formState[key] && insert.addStringColumnValue(key, formState[key]);
            break;
          case 'prodottiCertificati':
          case 'brand':
            break;
          default:
            formState[key] && insert.addColumnValue(key, formState[key]);
            break;
        }
      });
      const { error } = await executeQuery(insert.build());
      if (error) throw error;
      ({
        data: [{ id: idCertificato }]
      } = await executeQuery(new SelectBuilder('Certificato').addOrderBy('id', 'DESC').setPagination(0, 1).build()));
    }

    for (const certProd of formState.prodottiCertificati) {
      let qb = new InsertBuilder('ProdottoCertificato')
        .addColumnValue('idProdotto', certProd.idProdotto)
        .addColumnValue('idCertificato', idCertificato);
      const note = comments[certProd.prodotto.idGruppo];
      note && qb.addStringColumnValue('note', note);
      const { error } = await executeQuery(qb.build());
      if (error) throw error;
    }

    setLoading(false);
  };

  const cleanProducts = async () => {
    if (!entity?.id) return;

    const { error } = await executeQuery(`DELETE FROM ProdottoCertificato WHERE idCertificato = ${entity.id}`);
    if (error) throw error;
  };

  const [loading, setLoading] = useState();
  const handleSave = async () => {
    if (!validateForm()) return;
    setLoading(true);
    await cleanProducts();
    await upsertCertificato();
    onSaveSuccess && onSaveSuccess();
  };

  useEffect(() => {
    if (doSave) {
      handleSave();
      setDoSave(false);
    }
  }, [doSave]);
  //#endregion

  //#region LOGGING //////////
  // useEffect(() => console.log('onFormStateChange', formState), [formState]);
  // useEffect(() => console.log('onCommentsChange', comments), [comments]);
  // useEffect(() => console.log('onCommentDialogProductChange', commentDialogProduct), [commentDialogProduct]);
  //#endregion

  return (
    <>
      <CertificateNotesDialog
        open={isCertificateNotesDialog}
        onClose={() => setIsCertificateNotesDialog(false)}
        noteCertificato={formState.note}
        setNoteAndSave={note => {
          addFormState('note', note);
          setDoSave(true);
        }}
      />
      <CommentDialog
        open={!!commentDialogProduct}
        onClose={() => setCommentDialogProduct(null)}
        product={commentDialogProduct}
        addComment={addComment}
        comments={comments}
      />
      <ProductDialog
        open={isProductDialog}
        idAzienda={parseInt(formState.idAzienda)}
        onClose={() => setIsProductDialog(false)}
        onSaveSuccess={async savedProduct => {
          console.log("saved", savedProduct)
          setIsProductDialog(false);
          loadCompanyProducts();
          [savedProduct.gruppo] = await safeExecuteQuery(
            new SelectBuilder('GruppoProdotti').addWhereClause('id = ' + savedProduct.idGruppo).build()
          );
          [savedProduct.gruppo.categoria] = await safeExecuteQuery(
            new SelectBuilder('CategoriaProdotto').addWhereClause('id = ' + savedProduct.gruppo.idCategoria).build()
          );
          addNewProductsToCertificate(savedProduct);
        }}
      />
      <ProductGroupDialog
        open={isGroupDialog}
        onClose={() => setIsGroupDialog(false)}
        idAzienda={parseInt(formState.idAzienda)}
        onSaveSuccess={savedGroup => {
          setIsGroupDialog(false);
          loadCompanyProducts();
          addNewProductsToCertificate(...savedGroup.prodotti.map(p => ({ ...p, gruppo: savedGroup })));
        }}
      />

      <div className='grid grid-cols-2 gap-y-2 gap-x-4'>
        <Input
          name='passover'
          label='Passover'
          type='checkbox'
          checked={formState.passover || false}
          onChange={handleInputChange}
        />
        <div></div>
        <Select
          name='idAzienda'
          label='Azienda *'
          data={aziende}
          value={formState.idAzienda}
          disabled={router.query.azienda}
          empty='--- nessuna azienda selezionata ---'
          error={errors.idAzienda}
          errorMessage={errors.idAzienda}
          onChange={handleInputChange}
        />
        <Input
          name='behalf'
          label='Per conto di'
          type='text'
          value={formState.behalf || ''}
          onChange={handleInputChange}
        />
        <Input
          name='emissione'
          label='Data emissione *'
          value={formState.emissione || ''}
          type='date'
          error={errors.emissione}
          errorMessage={errors.emissione}
          onChange={handleInputChange}
        />
        <Input
          name='scadenza'
          label='Data scadenza'
          value={formState.scadenza || ''}
          type='date'
          error={errors.scadenza}
          errorMessage={errors.scadenza}
          onChange={handleInputChange}
        />
        <Input
          name='livelloKashrut'
          label='Livello kashrut *'
          value={formState.livelloKashrut || ''}
          type='text'
          error={errors.livelloKashrut}
          errorMessage={errors.livelloKashrut}
          onChange={handleInputChange}
        />
        <Input name='brand' label='Brand' value={formState.brand || ''} type='text' onChange={handleInputChange} />
        <Input
          name='localitaProduzione'
          label='Località di produzione'
          value={formState.localitaProduzione || ''}
          type='text'
          onChange={handleInputChange}
        />
        <Input
          name='nazioneProduzione'
          label='Nazione di produzione'
          value={formState.nazioneProduzione || ''}
          type='text'
          onChange={handleInputChange}
        />
        <Input
          name='settimanaProduzione'
          label='Settimana di produzione'
          value={formState.settimanaProduzione || ''}
          type='number'
          onChange={handleInputChange}
        />
      </div>

      {formState?.idAzienda ? (
        <>
          <div className='h-4'></div>
          <p className='font-semibold text-lg mb-1'>Prodotti *</p>
          <div className='flex justify-between items-center mb-2'>
            <div className='max-w-xs'>
              <Select
                data={selectCompanyProductsData}
                value={selectedProduct?.id || ''}
                empty='--- seleziona prodotto ---'
                error={errors.prodottiCertificati}
                errorMessage={errors.prodottiCertificati}
                onChange={handleProductsSelectChange}>
                <Button className='ml-2' color='green' onClick={handleAddSelectedProduct}>
                  <PlusIcon className='w-5 text-white' />
                </Button>
              </Select>
            </div>
            <div className='flex gap-2'>
              <Button
                color='blue'
                className='self-start'
                onClick={() => formState.idAzienda && setIsProductDialog(true)}>
                NUOVO PRODOTTO
              </Button>
              <Button color='blue' className='self-start' onClick={() => formState.idAzienda && setIsGroupDialog(true)}>
                NUOVO GRUPPO PRODOTTI
              </Button>
            </div>
          </div>

          <div ref={tableContainerRef} className={tableStyles.container}>
            <table className={tableStyles.customTable}>
              <thead>
                <tr className={tableStyles.headerRow}>
                  <th className={tableStyles.headerCell}>Nome</th>
                  <th className={tableStyles.headerCell}>Gruppo</th>
                  <th className={tableStyles.headerCell}>Categoria</th>
                  <th className={tableStyles.headerCell}>Note</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {certificateProducts?.length ? (
                  certificateProducts
                    .map(certProd => certProd.prodotto)
                    .map(prodotto => (
                      <tr key={prodotto.id} className={tableStyles.row}>
                        <td className={tableStyles.cell}>
                          <span className='font-semibold'>{prodotto.nome}</span>
                        </td>
                        <td className={tableStyles.cell}>{prodotto.gruppo?.nome || '-'}</td>
                        <td className={tableStyles.cell}>{prodotto.gruppo?.categoria?.nome}</td>
                        <td className={tableStyles.cell}>{comments[prodotto.gruppo?.id]}</td>
                        <td className={tableStyles.cell}>
                          <div className='flex gap-1 justify-end'>
                            <Button color='green' onClick={() => setCommentDialogProduct(prodotto)}>
                              <PencilSquareIcon className='text-white w-4' />
                            </Button>
                            <Button
                              color='orange'
                              onClick={() =>
                                setCertificateProducts(current => current.filter(cp => cp.idProdotto != prodotto.id))
                              }>
                              <TrashIcon className='text-white w-4' />
                            </Button>
                          </div>
                        </td>
                        <td className={tableStyles.rowBackground}></td>
                      </tr>
                    ))
                ) : (
                  <tr className={tableStyles.row}>
                    <td colSpan={5} className={tableStyles.empty}>
                      Nessun prodotto selezionato
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className='h-3'></div>
        </>
      ) : null}

      <div className='h-3'></div>
      <div className='flex gap-2'>
        <LoadingButton
          loading={loading}
          color='green'
          onClick={() => validateForm() && setIsCertificateNotesDialog(true)}>
          SALVA COME LAVORI IN CORSO
        </LoadingButton>
        <Button color='blue'>GENERA PDF</Button>
      </div>
    </>
  );
}
