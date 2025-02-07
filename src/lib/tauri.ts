import { invoke } from '@tauri-apps/api/tauri';

export const handleIsTauri = () => {
  return Boolean(typeof window !== 'undefined' && window !== undefined && (window as any).__TAURI_IPC__ !== undefined);
};

export async function executeQuery(query: string) {
  let data: any[] = [];
  let error: any = false;

  await invoke('execute_query', { laQuery: query })
    .then(res => JSON.parse(res as string))
    .then(json => {
      console.log('executing:', query);
      if (json.error) {
        console.error('TAURI ERROR: ', json.error);
        error = json.error;
      } else {
        data = json.result as any[];
      }
    })
    .catch(e => {
      console.error(e);
      error = true;
    });

  return { data, error };
}

export async function safeExecuteQuery(query: string) {
  const result = await executeQuery(query).catch(err => ({ data: null, error: err }));
  if (result.error) {
    console.error(result.error);
    throw result.error;
  }
  return result.data;
}
