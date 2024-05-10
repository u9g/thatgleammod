import gleam/option.{type Option}

@external(javascript, "../../../../../src/ct/ct_std.js", "reflection__get_static_method")
pub fn get_static_method(
  base_class: String,
  method_name: String,
  // a = tuple of arguments
) -> fn(a) -> Option(b)

@external(javascript, "../../../../../src/ct/ct_std.js", "reflection__get_field_value")
pub fn get_field_value(
  base_class: String,
  field_name: String,
  // a = the based object to call this on, giving a None will result in getting the static field's value
) -> fn(Option(a)) -> Option(b)

pub type Class

@external(javascript, "../../../../../src/ct/ct_std.js", "reflection__classof")
pub fn classof(base_obj: a) -> Option(Class)

@external(javascript, "../../../../../src/ct/ct_std.js", "reflection__get_private_field_value")
pub fn get_private_field_value(
  base_obj: Class,
  field_name: String,
  // a = the based object to call this on, giving a None will result in getting the static field's value
) -> fn(Option(a)) -> Option(b)

// c is a tuple with all arguments to call on the base object a
@external(javascript, "../../../../../src/ct/ct_std.js", "reflection__call_method")
pub fn call_method(method_name: String) -> fn(a, c) -> Option(b)

// c is a tuple with all arguments
@external(javascript, "../../../../../src/ct/ct_std.js", "reflection__new_instance")
pub fn new_instance(class_name: String) -> fn(c) -> Option(b)
