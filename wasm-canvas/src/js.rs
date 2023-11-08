use anyhow::{Result as AnyResult, anyhow};

use js_sys::{Function as JsFunction, Object as JsObject};
use wasm_bindgen::prelude::*;
use serde_wasm_bindgen::Error as SerdeWasmBindgenError;

use crate::nft_object::{Object3D, ObjectNode};

#[wasm_bindgen]
extern "C" {
    // Use `js_namespace` here to bind `console.log(..)` instead of just
    // `log(..)`
    #[wasm_bindgen(js_namespace = console)]
    pub fn log(s: &str);
}

pub fn map_js_error(js_result: Result<JsValue, JsValue>) -> AnyResult<JsValue> {
    js_result.map_err(|e| anyhow!(e.as_string().unwrap_or("None".to_string())))
}

pub fn map_serde_js_error<T>(serde_js_result: Result<T, SerdeWasmBindgenError>) -> AnyResult<T> {
    serde_js_result.map_err(|e| anyhow!(e.to_string()))
}

pub fn map_any_error<T>(any_result: AnyResult<T>) -> Result<T, String> {
    any_result.map_err(|e| e.to_string())
}

pub struct GetRootObjectFunction {
    js_function: JsFunction,
    ctx: JsObject,
}

impl From<JsFunction> for GetRootObjectFunction {
    fn from(js_function: JsFunction) -> Self {
        let ctx = JsObject::new();
        GetRootObjectFunction { js_function, ctx }
    }
}

impl GetRootObjectFunction {
    pub fn call(&self) -> AnyResult<Object3D> {
        let js_result = self.js_function.call0(&self.ctx);
        let js_value = map_js_error(js_result)?;
        map_serde_js_error(serde_wasm_bindgen::from_value(js_value))
    }
}

pub struct GetObjectTreeFunction {
    js_function: JsFunction,
    ctx: JsObject,
}

impl From<JsFunction> for GetObjectTreeFunction {
    fn from(js_function: JsFunction) -> Self {
        let ctx = JsObject::new();
        GetObjectTreeFunction { js_function, ctx }
    }
}

impl GetObjectTreeFunction {
    pub fn call(&self) -> AnyResult<ObjectNode> {
        let js_result = self.js_function.call0(&self.ctx);
        let js_value = map_js_error(js_result)?;
        map_serde_js_error(serde_wasm_bindgen::from_value(js_value))
    }
}
