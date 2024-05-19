use serde::{Deserialize, Serialize};
use jsonwebtoken::{decode, DecodingKey, Validation, Algorithm};
use wasm_bindgen::prelude::*;
use std::fmt;

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

#[derive(Debug)]
pub enum Status {
    Ok,
    Unauthorized,
    Forbidden,
}

impl fmt::Display for Status {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match *self {
            Status::Ok => write!(f, "200"),
            Status::Unauthorized => write!(f, "401"),
            Status::Forbidden => write!(f, "403"),
        }
    }
}

const JWT_SECRET: &'static str = env!("JWT_SECRET");

#[wasm_bindgen]
pub fn verify(token: &str) -> String {
    
    let decoded_token = decode::<Claims>(&token, &DecodingKey::from_secret(JWT_SECRET.as_ref()), &Validation::new(Algorithm::HS256));
    let valid_permissions = vec!["view:data"];
    match decoded_token {
        Ok(token_data) => {
            console_log!("{:?}", token_data.claims);
            if token_data.claims.permissions.iter().all(|permission| valid_permissions.contains(&permission.as_str())) {
                return Status::Ok.to_string();
            } else {
                return Status::Forbidden.to_string();
            }
        },
        Err(e) => {
            console_log!("{}",e);
            return Status::Unauthorized.to_string();
        }
    }
}