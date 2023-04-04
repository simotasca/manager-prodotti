#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use serde_json;
use serde_json::Map;
use serde_json::Value;
use sqlite::open;
use sqlite::State;
use tauri::Manager;

#[tauri::command]
fn greet(name: &str) -> String {
    return format!("Ciao, {}!", name);
}

#[tauri::command]
fn execute_query(la_query: &str) -> String {
    // ESEGUO QUALUNQUE QUERY MI SIA RICHIESTA DAL CLIENT SENZA FARMI DOMANDE E RITORNO UN JSON CON I RISULTATI
    let connection = open("/home/simo/gestione-prodotti-euk.db").unwrap();

    let mut results: Vec<Value> = Vec::new();

    let query = la_query;
    let mut statement = match connection.prepare(query) {
        Ok(prep_statement) => prep_statement,
        Err(error) => return String::from("{ \"error\": \"".to_owned() + &error.to_string().replace("\"", "''").to_owned() + "\" }"),
    };

    while let Ok(State::Row) = statement.next() {
        let mut row: Map<String, Value> = Map::new();
        for col_idx in 0..statement.column_count() {
            let col_name = &statement.column_names()[col_idx];
            let col_value = match statement.read::<String, _>(col_name.as_str()) {
                Ok(value) => value,
                Err(_) => String::from(""),
            };
            row.insert(String::from(col_name), Value::String(col_value));
        }
        results.insert(results.len(), Value::Object(row));
    }

    return format!("{{ \"result\": {} }}", Value::Array(results).to_string());
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, execute_query])
        .setup(|app| {
            #[cfg(debug_assertions)] // only include this code on debug builds
            {
                let window = app.get_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
