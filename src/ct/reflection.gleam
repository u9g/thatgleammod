import gleam/option.{type Option}

pub type ReflectionError {
  FailedToGetBaseClass
  FailedToFindJavaType(java_type: String)
  FailedToGetDeclaredField(name: String)
  FailedToGetMethod(name: String)
  ThrownError(error: String)
}

pub type CallType {
  PublicCall
  PrivateJavaMethodCall
}

@external(javascript, "../../../../../src/ct/ct_std.js", "reflection__get_static_method")
pub fn get_static_method(
  base_class: String,
  method_name: String,
  // a = tuple of arguments
) -> fn(a) -> Result(Option(b), ReflectionError)

@external(javascript, "../../../../../src/ct/ct_std.js", "reflection__get_field_value")
pub fn get_field_value(
  base_class: String,
  field_name: String,
  // a = the based object to call this on, giving a None will result in getting the static field's value
) -> fn(Option(a)) -> Option(b)

pub type Class

@external(javascript, "../../../../../src/ct/ct_std.js", "reflection__classof")
pub fn classof(base_obj: a) -> Result(Class, ReflectionError)

@external(javascript, "../../../../../src/ct/ct_std.js", "reflection__get_private_field_value")
pub fn get_private_field_value(
  base_obj: Class,
  field_name: String,
  // a = the based object to call this on, giving a None will result in getting the static field's value
) -> fn(Option(a)) -> Option(b)

pub type FieldReflection(a, b) {
  FieldReflection(get: fn() -> Option(a), set: fn(a) -> Nil)
}

@external(javascript, "../../../../../src/ct/ct_std.js", "reflection__field")
pub fn field(
  field_name: String,
) -> fn(a) -> Result(FieldReflection(b, c), ReflectionError)

@external(javascript, "../../../../../src/ct/ct_std.js", "reflection__get_priv_value")
pub fn get_priv_value(
  field_name: String,
  // a = the based object to call this on, giving a None will result in getting the static field's value
) -> fn(a) -> Result(b, ReflectionError)

@external(javascript, "../../../../../src/ct/ct_std.js", "reflection__set_priv_value")
pub fn set_priv_value(
  field_name: String,
  // a = the based object to call this on, giving a None will result in getting the static field's value
) -> fn(a, value) -> Result(Nil, ReflectionError)

// c is a tuple with all arguments to call on the base object a
@external(javascript, "../../../../../src/ct/ct_std.js", "reflection__call_method")
pub fn call_method(
  method_name: String,
  call_type: CallType,
) -> fn(a, c) -> Option(b)

// a is a tuple with all arguments
@external(javascript, "../../../../../src/ct/ct_std.js", "reflection__new_instance")
pub fn new_instance(class_name: String) -> fn(a) -> Result(b, ReflectionError)
