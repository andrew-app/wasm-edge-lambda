use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;
mod helpers;
use cf::convert_request;
use helpers::cloudfront::{self as cf};

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    name: String,
    exp: usize,
    permissions: Vec<String>,
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

const JWT_SECRET: &str = env!("JWT_SECRET");

#[wasm_bindgen]
pub fn auth_handler(event: JsValue, callback: &js_sys::Function) {
    let request = cf::Event::request_from_event(event);

    let token = match &request {
        Ok(req) => req
            .headers
            .get("authorization")
            .map_or_else(String::new, |auth_header| {
                auth_header[0].value.replace("Bearer ", "")
            }),
        Err(e) => {
            console_error!("{:?}", e);
            let _ = callback.call2(&JsValue::NULL, &JsValue::NULL, &JsValue::NULL);
            String::new()
        }
    };

    let js_cf_request = convert_request(&request.clone().unwrap()).unwrap();

    let valid_permissions = ["view:data"];

    let decoded_token = decode::<Claims>(
        &token,
        &DecodingKey::from_secret(JWT_SECRET.as_ref()),
        &Validation::new(Algorithm::HS256),
    );

    match decoded_token {
        Ok(token_data) => {
            if token_data
                .claims
                .permissions
                .iter()
                .all(|permission| valid_permissions.contains(&permission.as_str()))
            {
                console_log!("Authorized");
                let _ = callback.call2(&JsValue::NULL, &JsValue::NULL, &js_cf_request);
            } else {
                let _ = callback.call2(&JsValue::NULL, &JsValue::NULL, &JsValue::NULL);
            }
        }
        Err(e) => {
            console_error!("{:?}", e);
            let _ = callback.call2(&JsValue::NULL, &JsValue::NULL, &JsValue::NULL);
        }
    }
}
