import ct/item.{type Item, type RawItem, from_raw_item}
import ct/reflection
import gleam/option.{type Option, Some}
import gleam/result
import gleam/string

fn unwrap(result: Result(a, b)) -> a {
  case result {
    Ok(a_value) -> a_value
    Error(err) -> panic as string.inspect(err)
  }
}

fn internal_get_from_give_code(input: String) -> Option(RawItem) {
  reflection.get_static_method(
    "fr.atesab.act.utils.ItemUtils",
    "getFromGiveCode",
  )(#(input))
  |> unwrap
}

pub fn get_item_from_give_code(give_code: String) -> Option(Item) {
  internal_get_from_give_code(give_code)
  |> option.map(from_raw_item)
}
