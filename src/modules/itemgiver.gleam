import ct/act
import ct/item
import ct/player
import ct/render.{render_string}
import ct/std
import ct/update_loop.{CustomCommand, HotbarRender, ScrollDown, ScrollUp, Tick}
import gleam/dict
import gleam/int.{to_string as i2s}
import gleam/iterator
import gleam/list
import gleam/option
import gleam/string

type State {
  ShouldUpdate(i: Int)
  IsUpdated(i: Int)
  NotActive
}

pub fn start() {
  let in_file = std.read_file("item_giver_in_file_path.txt")
  std.log2("out file: " <> in_file)
  let file_contents = std.read_file(in_file)

  let items: dict.Dict(Int, List(#(item.Item, Int))) =
    file_contents
    |> string.split(on: "\n")
    |> list.map(act.get_item_from_give_code)
    |> list.filter_map(fn(a) { option.to_result(a, Nil) })
    |> list.sized_chunk(into: 8)
    |> list.index_map(fn(a, i) { #(i, list.index_map(a, fn(b, j) { #(b, j) })) })
    |> dict.from_list

  update_loop.make(
    NotActive,
    [
      CustomCommand("toggleitemgiver", fn(state) {
        let has_items_in_hotbar =
          iterator.range(0, 0 + 7)
          |> iterator.map(player.get_item_in_slot)
          |> iterator.filter_map(fn(a) { option.to_result(a, Nil) })
          |> iterator.length
          > 0
        case state, has_items_in_hotbar {
          NotActive, False -> {
            std.log("Item giver &anow active&f! Starting at page 1.")
            ShouldUpdate(0)
          }
          NotActive, True -> {
            std.log("Try again with an &cempty&f hotbar.")
            NotActive
          }
          _, _ -> {
            std.log("Item giver &cno longer active&f!")
            // clear hotbar
            iterator.range(0, 0 + 7) |> iterator.each(player.clear_slot)
            NotActive
          }
        }
      }),
      ScrollUp(fn(state) {
        case state {
          NotActive -> NotActive
          IsUpdated(i) | ShouldUpdate(i) -> {
            let slot = int.max(i - 1, 0)
            ShouldUpdate(slot)
          }
        }
      }),
      ScrollDown(fn(state) {
        case state {
          IsUpdated(i) | ShouldUpdate(i) -> {
            let slot = int.min(i + 1, dict.size(items) - 1)
            ShouldUpdate(slot)
          }
          NotActive -> NotActive
        }
      }),
      Tick(fn(state) {
        case state {
          IsUpdated(_) | NotActive -> state
          ShouldUpdate(i) -> {
            case dict.get(items, i) {
              Ok(items) -> {
                list.each(items, fn(item) {
                  player.set_hotbar_slot_to_item(item.0, item.1 % 8)
                })
                IsUpdated(i)
              }
              Error(_) -> panic
            }
          }
        }
      }),
    ],
    [
      HotbarRender(fn(key, state) {
        case state {
          NotActive -> Nil
          ShouldUpdate(i) | IsUpdated(i) -> {
            key
            |> render_string(
              100,
              100,
              "page: &b" <> i2s(i + 1) <> " &f/ &c" <> i2s(dict.size(items)),
            )
          }
        }
      }),
    ],
  )
}
