use serde::{Deserialize, Serialize};
use jsonwebtoken::{decode, DecodingKey, Validation, Algorithm};
use wasm_bindgen::prelude::*;
mod types;
use types::cloudfront as cf;

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

const JWT_SECRET: &'static str = env!("JWT_SECRET");

#[wasm_bindgen]
pub async fn auth_handler(event: JsValue) -> bool {
    let request = cf::Event::request_from_event(event);
    let token: String = match request {
        Ok(req) => {
            let auth_header = req.headers.get("authorization").unwrap();
            auth_header[0].value.replace("Bearer ", "")
        },
        Err(e) => {
            console_log!("{:?}",e);
            return false;
        }
    };

    let decoded_token = decode::<Claims>(&token, &DecodingKey::from_secret(JWT_SECRET.as_ref()), &Validation::new(Algorithm::HS256));
    let valid_permissions = vec!["view:data"];
    match decoded_token {
        Ok(token_data) => {
            if token_data.claims.permissions.iter().all(|permission| valid_permissions.contains(&permission.as_str())) {
                return true;
            } else {
                return false;
            }
        },
        Err(e) => {
            console_log!("{}",e);
            return false;
        }
    }
}