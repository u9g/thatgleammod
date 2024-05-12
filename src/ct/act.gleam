import ct/item.{type Item, type RawItem, from_raw_item}
import ct/reflection
import gleam/option.{type Option}

fn internal_get_from_give_code(input: String) -> Option(RawItem) {
  case
    reflection.get_static_method(
      "fr.atesab.act.utils.ItemUtils",
      "getFromGiveCode",
    )(#(input))
  {
    Ok(x) -> x
    Error(_) -> option.None
  }
}

pub fn get_item_from_give_code(give_code: String) -> Option(Item) {
  internal_get_from_give_code(give_code)
  |> option.map(from_raw_item)
}
