import ct/reflection
import gleam/option

@external(javascript, "../../../../../src/ct/ct_std.js", "std__log")
pub fn log(to_log _to_log: a) -> Nil

@external(javascript, "../../../../../src/ct/ct_std.js", "std__log2")
pub fn log2(to_log: a) -> Nil

@external(javascript, "../../../../../src/ct/ct_std.js", "std__chat")
pub fn chat(to_chat _to_chat: String) -> Nil

@external(javascript, "../../../../../src/ct/ct_std.js", "std__now")
pub fn now() -> Int

@external(javascript, "../../../../../src/ct/ct_std.js", "std__classof")
pub fn classof(x: a) -> String

@external(javascript, "../../../../../src/ct/ct_std.js", "std__read_file")
pub fn read_file(path: String) -> String

@external(javascript, "../../../../../src/ct/ct_std.js", "std__add_color")
pub fn add_color(input: String) -> String

@external(javascript, "../../../../../src/ct/ct_std.js", "std__from_js_array")
pub fn from_js_array(array: a) -> List(b)

@external(javascript, "../../../../../src/ct/ct_std.js", "std__to_js_array")
pub fn to_js_array(array: List(a)) -> b
