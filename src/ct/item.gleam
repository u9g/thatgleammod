import ct/reflection
import ct/std
import gleam/option.{type Option, then}

pub type Item

pub type RawItemStack

pub type RawItem

@external(javascript, "../../../../../src/ct/ct_std.js", "item__from_raw_item")
pub fn from_raw_item(raw_item: RawItem) -> Item

@external(javascript, "../../../../../src/ct/ct_std.js", "item__name")
pub fn name(item: Item) -> String

@external(javascript, "../../../../../src/ct/ct_std.js", "item__lore")
pub fn lore(item: Item) -> List(String)

fn to_item_stack(item: Item) -> Option(RawItemStack) {
  reflection.call_method("getItemStack")(item, #())
}

fn copy_item_stack(raw_item_stack: RawItemStack) -> Option(RawItemStack) {
  reflection.call_method("func_77946_l")(raw_item_stack, #())
}

fn from_raw_item_stack(raw_item_stack: RawItemStack) -> Option(Item) {
  reflection.new_instance("Item")(#(raw_item_stack))
}

fn clone_item(item: Item) -> Option(Item) {
  use raw_item <- then(to_item_stack(item))
  use copy_of_item <- then(copy_item_stack(raw_item))
  use item <- then(from_raw_item_stack(copy_of_item))
  option.Some(item)
}

pub fn with_name(item: Item, new_name: String) -> Option(Item) {
  use cloned_item <- then(clone_item(item))
  use _ <- then(reflection.call_method("setName")(cloned_item, #(new_name)))
  option.Some(cloned_item)
}

pub fn with_lore(item: Item, new_lore: List(String)) -> Option(Item) {
  use cloned_item <- then(clone_item(item))
  let lore_as_array: List(String) = std.to_js_array(new_lore)
  // by passing lore_as_array directly, it's spread
  use _ <- then(reflection.call_method("setLore")(cloned_item, lore_as_array))
  option.Some(cloned_item)
}
