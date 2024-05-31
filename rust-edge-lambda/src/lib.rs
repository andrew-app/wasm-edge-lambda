use serde::{Deserialize, Serialize};
use jsonwebtoken::{decode, DecodingKey, Validation, Algorithm};
use wasm_bindgen::prelude::*;
mod helpers;
use helpers::cloudfront::{self as cf};
use cf::convert_request;

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

    #[wasm_bindgen(js_namespace = console)]
    fn error(s: &str);
}

macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

macro_rules! console_error {
    ($($t:tt)*) => (error(&format_args!($($t)*).to_string()))
}

const JWT_SECRET: &'static str = env!("JWT_SECRET");

#[wasm_bindgen]
pub fn auth_handler(event: JsValue, callback: &js_sys::Function) {
    let request = cf::Event::request_from_event(event);
    let js_request = convert_request(&request.clone().unwrap()).unwrap();
    let token = match request {
        Ok(req) => {
            let auth_header = req.headers.get("authorization").unwrap();
            auth_header[0].value.replace("Bearer ", "")
        },
        Err(e) => {
            console_error!("{:?}",e);
            let _ = callback.call2(&JsValue::NULL, &JsValue::NULL, &JsValue::NULL);
            String::new()
        }
    };

    let valid_permissions = vec!["view:data"];

    let decoded_token = decode::<Claims>(&token, &DecodingKey::from_secret(JWT_SECRET.as_ref()), &Validation::new(Algorithm::HS256));

    match decoded_token {
        Ok(token_data) => {
            if token_data.claims.permissions.iter().all(|permission| valid_permissions.contains(&permission.as_str())) {
                console_log!("Authorized");
                let _ = callback.call2(&JsValue::NULL, &JsValue::NULL, &js_request);
            } else {
                let _ = callback.call2(&JsValue::NULL, &JsValue::NULL, &JsValue::NULL);
            }
        },
        Err(e) => {
            console_error!("{:?}",e);
            let _ = callback.call2(&JsValue::NULL, &JsValue::NULL, &JsValue::NULL);
        }
    }
}