use wasm_bindgen::prelude::*;
use serde_json::{Map, Value};
use crate::helpers;
use cf::convert_cf;
use helpers::cloudfront::{self as cf};

#[wasm_bindgen]
pub struct ExceptionHandler {
    cf_response: Map<String, Value>,
    callback: js_sys::Function,
}

// good for now...find a more idiomatic way to do this
#[wasm_bindgen]
impl ExceptionHandler {
    #[wasm_bindgen(constructor)]
    pub fn new(callback: js_sys::Function) -> ExceptionHandler {
        let mut cf_response = Map::new();
        let mut cf_headers = Map::new();
        let mut content_type = Map::new();
        content_type.insert("key".to_string(), Value::String("Content-Type".to_string()));
        content_type.insert("value".to_string(), Value::String("application/json".to_string()));
        cf_headers.insert("content-type".to_string(), Value::Array(vec![Value::Object(content_type)]));
        cf_response.insert("bodyEncoding".to_string(), Value::String("text".to_string()));
        cf_response.extend(cf_headers);
        ExceptionHandler {
            cf_response,
            callback,
        }
    }

    pub fn on_unauthorised_request(&self) {
        let mut unauthorised = Map::new();
        unauthorised.insert("status".to_string(), Value::String("401".to_string()));
        unauthorised.insert("statusDescription".to_string(), Value::String("Unauthorized".to_string()));
        let unauthorised_response = self.cf_response.clone();
        unauthorised.extend(unauthorised_response);
        let response = convert_cf(&unauthorised).unwrap();
        self.callback.call2(&JsValue::NULL, &JsValue::NULL, &response).unwrap();
    }

    pub fn on_forbidden_request(&self) {
        let mut forbidden = Map::new();
        forbidden.insert("status".to_string(), Value::String("403".to_string()));
        forbidden.insert("statusDescription".to_string(), Value::String("Forbidden".to_string()));
        let forbidden_response = self.cf_response.clone();
        forbidden.extend(forbidden_response);
        let response = convert_cf(&forbidden).unwrap();
        self.callback.call2(&JsValue::NULL, &JsValue::NULL, &response).unwrap();
    }
}