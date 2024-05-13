import ct/item.{type Item}
import ct/reflection.{PublicCall}
import gleam/option.{type Option}

pub type Gui

pub type Slot

@external(javascript, "../../../../../src/ct/ct_std.js", "gui__is_instance_of")
pub fn is_instance_of(gui: Gui, class_name: String) -> Bool

@external(javascript, "../../../../../src/ct/ct_std.js", "gui__slot_under_mouse")
pub fn slot_under_mouse(gui: Gui) -> Option(Slot)

@external(javascript, "../../../../../src/ct/ct_std.js", "gui__current_gui")
pub fn current_gui() -> Option(Gui)

pub fn item_in_slot(slot: Slot) -> Option(Item) {
  reflection.call_method("getItem", PublicCall)(slot, #())
}

pub fn number_of_slot(slot: Slot) -> Option(Int) {
  reflection.call_method("getIndex", PublicCall)(slot, #())
}
