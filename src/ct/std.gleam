import ct/reflection.{PublicCall, call_method}
import ct/stdext.{panic_unwrap_o, unwrap}
import gleam/option

@external(javascript, "../../../../../src/ct/ct_std", "std__log")
pub fn log(to_log _to_log: a) -> Nil

@external(javascript, "../../../../../src/ct/ct_std", "std__log2")
pub fn log2(to_log: a) -> Nil

@external(javascript, "../../../../../src/ct/ct_std", "std__chat")
pub fn chat(to_chat _to_chat: String) -> Nil

@external(javascript, "../../../../../src/ct/ct_std", "std__now")
pub fn now() -> Int

@external(javascript, "../../../../../src/ct/ct_std", "std__classof")
pub fn classof(x: a) -> String

@external(javascript, "../../../../../src/ct/ct_std", "std__read_file")
pub fn read_file(path: String) -> String

@external(javascript, "../../../../../src/ct/ct_std", "std__write_to_file")
pub fn write_to_file(path: String, to_write: String) -> String

@external(javascript, "../../../../../src/ct/ct_std", "std__add_color")
pub fn add_color(input: String) -> String

@external(javascript, "../../../../../src/ct/ct_std", "std__remove_color")
pub fn remove_color(input: String) -> String

@external(javascript, "../../../../../src/ct/ct_std", "std__from_js_array")
pub fn from_js_array(array: a) -> List(b)

@external(javascript, "../../../../../src/ct/ct_std", "std__to_js_array")
pub fn to_js_array(array: List(a)) -> b

@external(javascript, "../../../../../src/ct/ct_std", "std__is_key_down")
pub fn is_key_down(key_name: String) -> Bool

pub type ClickType {
  LeftClick
  ShiftLeftClick
  ShiftRightClick
}

@external(javascript, "../../../../../src/ct/ct_std", "std__internal_click")
fn internal_click(slot: Int, mode: Int, button: Int) -> Nil

pub fn click(slot: Int, click_type: ClickType) {
  case click_type {
    LeftClick -> internal_click(slot, 0, 0)
    ShiftLeftClick -> internal_click(slot, 1, 0)
    ShiftRightClick -> internal_click(slot, 1, 1)
  }
}

@external(javascript, "../../../../../src/ct/ct_std", "std__write_into_anvil")
pub fn write_into_anvil(to_write: String) -> Nil
