import ct/gui
import ct/item
import ct/player
import ct/reflection
import ct/std
import ct/update_loop
import gleam/bool
import gleam/option.{None, Some}

type State {
  Initial
  Copied(name: String, lore: List(String))
}

const creative_gui = "net.minecraft.client.gui.inventory.GuiContainerCreative"

const creative_tab_field = "field_147058_w"

const inventory_creative_tab_ix = 11

pub fn start() {
  let creative_tab_field_getter =
    reflection.get_field_value(creative_gui, creative_tab_field)

  update_loop.make(
    Initial,
    [
      update_loop.CustomKeybind(
        key: "KEY_R",
        description: "Copy Item Name & Lore",
        handler: fn(state) { state },
        gui_key_handler: fn(state, gui) {
          let item =
            gui
            |> gui.slot_under_mouse
            |> option.then(gui.item_in_slot)

          case item {
            Some(item) -> {
              // todo: highlight slot for a second?
              std.log("Copied item hovered.")
              Copied(name: item |> item.name, lore: item |> item.lore)
            }
            None -> state
          }
        },
      ),
      update_loop.CustomKeybind(
        key: "KEY_K",
        description: "Paste Item Name & Lore",
        handler: fn(state) { state },
        gui_key_handler: fn(state, gui) {
          case state {
            Initial -> Nil
            Copied(name, lore) -> {
              let err = fn(log: String) { fn() { std.log(log) } }

              //
              use <- bool.lazy_guard(
                when: !gui.is_instance_of(gui, creative_gui),
                return: err(
                  "You must be in the inventory tab of the creative menu to paste.",
                ),
              )

              //
              let is_on_inventory_tab =
                creative_tab_field_getter(Some(gui))
                |> option.map(fn(creative_tab) {
                  creative_tab == inventory_creative_tab_ix
                })
                |> option.unwrap(False)

              //
              use <- bool.lazy_guard(
                when: !is_on_inventory_tab,
                return: err(
                  "You must be in the inventory tab of the creative menu to paste.",
                ),
              )

              //
              let item =
                gui
                |> gui.slot_under_mouse
                |> option.then(gui.item_in_slot)
                |> option.then(item.with_name(_, name))
                |> option.then(item.with_lore(_, lore))

              let slot =
                gui
                |> gui.slot_under_mouse
                |> option.then(gui.number_of_slot)

              case item, slot {
                Some(item), Some(slot) -> {
                  player.set_hotbar_slot_to_item(item, slot - 36)
                  std.log("Pasted onto hovered item")
                }
                _, _ -> {
                  std.log("Failed to paste onto hovered item")
                }
              }
            }
          }
          state
        },
      ),
    ],
    [],
  )
}
