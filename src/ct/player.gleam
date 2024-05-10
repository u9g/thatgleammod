import ct/item.{type Item}
import gleam/option.{type Option}

pub type Player

pub type RawPlayer

@external(javascript, "../../../../../src/ct/ct_std.js", "player__me")
pub fn me() -> Player

@external(javascript, "../../../../../src/ct/ct_std.js", "player__get_name")
pub fn get_name(player: Player) -> String

@external(javascript, "../../../../../src/ct/ct_std.js", "player__get_uuid")
pub fn get_uuid(player: Player) -> String

@external(javascript, "../../../../../src/ct/ct_std.js", "player__distance_to")
pub fn distance_to(player: Player, other_player: Player) -> Float

@external(javascript, "../../../../../src/ct/ct_std.js", "player__get_item_in_slot")
pub fn get_item_in_slot(slot: Int) -> Option(Item)

@external(javascript, "../../../../../src/ct/ct_std.js", "player__set_hotbar_slot_to_item")
pub fn set_hotbar_slot_to_item(item_to_set: Item, hotbar_slot_num: Int) -> Nil

@external(javascript, "../../../../../src/ct/ct_std.js", "player__clear_slot")
pub fn clear_slot(hotbar_slot_num: Int) -> Nil
