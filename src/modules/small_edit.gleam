import ct/act
import ct/event.{RenderItemIntoGui, WindowOpen}
import ct/events
import ct/gui
import ct/item
import ct/player
import ct/std.{LeftClick, ShiftLeftClick, ShiftRightClick}
import ct/update_loop
import gleam/bool
import gleam/int
import gleam/iterator
import gleam/list
import gleam/option
import gleam/string

fn wait_for_item(item_name: String, handler: fn() -> a) {
  events.handle_until_render_item_into_gui(
    fn(item) { std.remove_color(item.name(item)) == item_name },
    fn(_item) { handler() },
  )
}

fn get_item_in_selected_hotbar_slot() -> item.Item {
  let maybe_hotbar_item = player.get_item_in_slot(player.get_hold_slot_index())
  let hotbar_item = case maybe_hotbar_item {
    option.Some(item) -> item
    _ -> panic as "should have hotbar item, instead got none"
  }

  hotbar_item
}

fn run_on_current_hotbar_slot(out_file: String, done: fn() -> a) {
  std.chat("/edit")
  use _ <- events.handle_next_window_open()
  use <- wait_for_item("Edit Actions")
  std.click(34, LeftClick)
  use <- wait_for_item("Add Action")
  std.click(50, LeftClick)
  use <- wait_for_item("Change Player Stat")
  use <- wait_for_item("Next Page")
  std.click(25, LeftClick)
  use <- wait_for_item("Stat")
  std.click(10, LeftClick)
  use <- events.handle_next_window_close()
  std.chat("attacker_id")
  use _ <- events.handle_next_window_open()
  use <- wait_for_item("Mode")
  std.click(11, LeftClick)
  use <- wait_for_item("Set")
  std.click(12, LeftClick)
  use <- wait_for_item("Amount")
  std.click(12, LeftClick)
  use <- wait_for_item("1")
  let hotbar_item = get_item_in_selected_hotbar_slot()
  let item_lore = hotbar_item |> item.lore
  let first_line_of_lore = case item_lore |> list.first {
    Ok(lore_line) -> lore_line
    _ -> panic as "item should have a first lore line"
  }
  let pokemon_number = case string.split_once(first_line_of_lore, "#") {
    Ok(split) -> split.1
    _ ->
      panic as "couldn't split the first lore line on #, the lore line: '"
      <> first_line_of_lore
      <> "'"
  }
  std.write_into_anvil(pokemon_number)
  use _ <- events.handle_next_window_open()
  use <- wait_for_item("Go Back")
  std.click(31, LeftClick)
  use <- wait_for_item("Add Action")
  std.click(22, ShiftLeftClick)
  use <- wait_for_item("Add Action")
  use <- events.handle_next_window_close()
  gui.close_current_window()
  use <- events.handle_next_window_close()
  gui.close_current_window()
  let hotbar_item = get_item_in_selected_hotbar_slot()
  let hotbar_item_give_code = case
    hotbar_item
    |> act.get_item_give_code
  {
    option.Some(give_code) -> give_code
    _ -> panic as "failed to get give code of item"
  }
  std.log2("writing to file")
  std.write_to_file(
    out_file,
    std.read_file(out_file) <> "\n" <> hotbar_item_give_code,
  )
  done()
}

// const out_file = "C:\\Users\\Jason\\Documents\\code\\4-20-24\\examplemod\\out.txt"

pub fn start() {
  let out_file = std.read_file("small_edit_out_file_path.txt")
  std.log2("out file: " <> out_file)
  update_loop.make(
    Nil,
    [
      update_loop.CustomKeybind(
        key: "KEY_C",
        description: "fix item using pokemon id",
        gui_key_handler: fn(state, _) { state },
        handler: fn(state) {
          use <- bool.lazy_guard(
            when: player.get_hold_slot_index() != 0,
            return: fn() {
              std.log("You aren't on hotbar slot 0")
              state
            },
          )
          std.log2("I'm starting!")
          use <- run_on_current_hotbar_slot(out_file)
          std.log2("I'm done slot: " <> int.to_string(0))
          player.set_hold_slot_index(player.get_hold_slot_index() + 1)
          use <- run_on_current_hotbar_slot(out_file)
          std.log2("I'm done slot: " <> int.to_string(1))
          player.set_hold_slot_index(player.get_hold_slot_index() + 1)
          use <- run_on_current_hotbar_slot(out_file)
          std.log2("I'm done slot: " <> int.to_string(2))
          player.set_hold_slot_index(player.get_hold_slot_index() + 1)
          use <- run_on_current_hotbar_slot(out_file)
          std.log2("I'm done slot: " <> int.to_string(3))
          player.set_hold_slot_index(player.get_hold_slot_index() + 1)
          use <- run_on_current_hotbar_slot(out_file)
          std.log2("I'm done slot: " <> int.to_string(4))
          player.set_hold_slot_index(player.get_hold_slot_index() + 1)
          use <- run_on_current_hotbar_slot(out_file)
          std.log2("I'm done slot: " <> int.to_string(5))
          player.set_hold_slot_index(player.get_hold_slot_index() + 1)
          use <- run_on_current_hotbar_slot(out_file)
          std.log2("I'm done slot: " <> int.to_string(6))
          player.set_hold_slot_index(player.get_hold_slot_index() + 1)
          use <- run_on_current_hotbar_slot(out_file)
          std.log2("I'm done slot: " <> int.to_string(7))
          player.set_hold_slot_index(player.get_hold_slot_index() + 1)
          use <- run_on_current_hotbar_slot(out_file)
          std.log2("I'm done slot: " <> int.to_string(8))
          player.set_hold_slot_index(player.get_hold_slot_index() + 1)
          state
        },
      ),
    ],
    [],
  )

  Nil
}
