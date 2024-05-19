use serde::{Deserialize, Serialize};
use jsonwebtoken::{decode, DecodingKey, Validation, Algorithm};
use wasm_bindgen::prelude::*;

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    name: String,
    exp: usize,
    permissions: Vec<String>
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

#[wasm_bindgen]
pub fn verify(token: &str) -> bool {
    let secret = env!("JWT_SECRET");
    let decoded_token = decode::<Claims>(&token, &DecodingKey::from_secret(secret.as_ref()), &Validation::new(Algorithm::HS256));
    let valid_permissions = vec!["view:data"];
    match decoded_token {
        Ok(token_data) => {
            console_log!("{:?}", token_data.claims);
            return token_data.claims.permissions.iter().all(|permission| valid_permissions.contains(&permission.as_str()));
        },
        Err(e) => {
            console_log!("{}",e);
            return false;
        }
    }
}