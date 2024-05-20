import ct/act
import ct/gui
import ct/item
import ct/player
import ct/render
import ct/std
import ct/update_loop
import gleam/bool
import gleam/int
import gleam/list
import gleam/option
import gleam/string

pub type State {
  NotRunning
  WaitingToSendCommand(pages_left: Int)
  WaitingForEditActionItem(pages_left: Int)
  WaitingForAddActionItem1(pages_left: Int)
  WaitingForNextPageItem(pages_left: Int)
  WaitingForStatItem(pages_left: Int)
  WaitingToWriteIntoChat(pages_left: Int)
  WaitingForModeItem(pages_left: Int)
  WaitingForSetItem(pages_left: Int)
  WaitingForAmountItem(pages_left: Int)
  WaitingForInitialAnvilItem(pages_left: Int)
  WaitingForGoBackItem(pages_left: Int)
  WaitingForAddActionItem2(pages_left: Int)
  WaitingForWindowClose(pages_left: Int)
  WaitingToCloseWindow(pages_left: Int)
  WaitingForTransactionPackets(pages_left: Int, transaction_packets_left: Int)
  ShowingItemFixerStoppedMessage(ticks_left: Int)
}

fn get_item_in_selected_hotbar_slot() -> item.Item {
  let maybe_hotbar_item = player.get_item_in_slot(player.get_hold_slot_index())
  let hotbar_item = case maybe_hotbar_item {
    option.Some(item) -> item
    _ -> panic as "should have hotbar item, instead got none"
  }

  hotbar_item
}

pub fn start() {
  let out_file = std.read_file("small_edit_out_file_path.txt")
  std.log2("out file: " <> out_file)

  update_loop.make(
    NotRunning,
    [
      update_loop.TransactionPacket(handler: fn(state) {
        case state {
          WaitingForTransactionPackets(pages_left, transaction_packets_left)
            if transaction_packets_left == 0
          -> {
            std.log2(
              "Final transaction packet received -> WaitingToSendCommand("
              <> int.to_string(pages_left - 1)
              <> ")",
            )
            std.log2("I'm done slot: " <> int.to_string(8 - pages_left))
            WaitingToSendCommand(pages_left - 1)
          }
          WaitingForTransactionPackets(pages_left, transaction_packets_left) -> {
            WaitingForTransactionPackets(
              pages_left,
              transaction_packets_left - 1,
            )
          }
          _ -> state
        }
      }),
      update_loop.Tick(handler: fn(state) {
        case state {
          ShowingItemFixerStoppedMessage(ticks_left) -> {
            case ticks_left == 0 {
              True -> NotRunning
              False -> ShowingItemFixerStoppedMessage(ticks_left - 1)
            }
          }
          WaitingToSendCommand(pages_left) if pages_left == 0 -> {
            NotRunning
          }
          WaitingToSendCommand(pages_left) -> {
            std.log2(
              "I'm starting slot: " <> int.to_string(8 - pages_left) <> "!",
            )
            std.log2("Sending '/edit' -> WaitingForEditActionItem")
            std.chat("/edit")
            WaitingForEditActionItem(pages_left)
          }
          WaitingToCloseWindow(pages_left) -> {
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
            gui.close_current_window()
            std.log2("Close Window -> WaitingForTransactionPackets")
            player.set_hold_slot_index(8 - pages_left + 1)
            WaitingForTransactionPackets(pages_left, 8)
          }
          _ -> state
        }
      }),
      update_loop.GuiClosed(handler: fn(state) {
        case state {
          WaitingToWriteIntoChat(pages_left) -> {
            std.chat("attacker_id")
            WaitingForModeItem(pages_left)
          }
          WaitingForWindowClose(pages_left) -> {
            WaitingToCloseWindow(pages_left)
          }
          _ -> state
        }
      }),
      update_loop.RenderItemIntoGui(handler: fn(state, item) {
        case state, std.remove_color(item.name(item)) {
          WaitingForEditActionItem(pages_left), "Edit Actions" -> {
            std.click(34, std.LeftClick)
            std.log2("clicking slot 34 -> WaitingForAddActionItem1")
            WaitingForAddActionItem1(pages_left)
          }
          WaitingForAddActionItem1(pages_left), "Add Action" -> {
            std.click(50, std.LeftClick)
            std.log2("clicking slot 50 -> WaitingForNextPageItem")
            WaitingForNextPageItem(pages_left)
          }
          WaitingForNextPageItem(pages_left), "Next Page" -> {
            std.click(25, std.LeftClick)
            std.log2("clicking slot 25 -> WaitingForStatItem")
            WaitingForStatItem(pages_left)
          }
          WaitingForStatItem(pages_left), "Stat" -> {
            std.click(10, std.LeftClick)
            WaitingToWriteIntoChat(pages_left)
          }
          WaitingForModeItem(pages_left), "Mode" -> {
            std.click(11, std.LeftClick)
            std.log2("clicking slot 11 -> WaitingForSetItem")
            WaitingForSetItem(pages_left)
          }
          WaitingForSetItem(pages_left), "Set" -> {
            std.click(12, std.LeftClick)
            std.log2("clicking slot 12 -> WaitingForAmountItem")
            WaitingForAmountItem(pages_left)
          }
          WaitingForAmountItem(pages_left), "Amount" -> {
            std.click(12, std.LeftClick)
            std.log2("clicking slot 12 -> WaitingForInitialAnvilItem")
            WaitingForInitialAnvilItem(pages_left)
          }
          WaitingForInitialAnvilItem(pages_left), "1" -> {
            let hotbar_item = get_item_in_selected_hotbar_slot()
            let item_lore = hotbar_item |> item.lore
            let first_line_of_lore = case item_lore |> list.first {
              Ok(lore_line) -> lore_line
              _ -> panic as "item should have a first lore line"
            }
            let pokemon_number = case
              string.split_once(first_line_of_lore, "#")
            {
              Ok(split) -> split.1
              _ ->
                panic as "couldn't split the first lore line on #, the lore line: '"
                <> first_line_of_lore
                <> "'"
            }
            std.write_into_anvil(pokemon_number)
            std.log2(
              "writing '" <> pokemon_number <> "' -> WaitingForInitialAnvilItem",
            )
            WaitingForGoBackItem(pages_left)
          }
          WaitingForGoBackItem(pages_left), "Go Back" -> {
            std.click(31, std.LeftClick)
            std.log2("clicking slot 31 -> WaitingForAddActionItem2")
            WaitingForAddActionItem2(pages_left)
          }
          WaitingForAddActionItem2(pages_left), "Add Action" -> {
            std.click(22, std.ShiftLeftClick)
            WaitingForWindowClose(pages_left)
          }
          _, _ -> state
        }
      }),
      update_loop.CustomKeybind(
        key: "KEY_X",
        description: "stop item fixer",
        gui_key_handler: fn(_, _) { ShowingItemFixerStoppedMessage(20 * 5) },
        handler: fn(_) { ShowingItemFixerStoppedMessage(20 * 5) },
      ),
      update_loop.CustomKeybind(
        key: "KEY_C",
        description: "fix item using pokemon id",
        gui_key_handler: fn(state, _) { state },
        handler: fn(state) {
          case state {
            ShowingItemFixerStoppedMessage(_) | NotRunning -> {
              case player.get_hold_slot_index() {
                0 -> {
                  WaitingToSendCommand(8)
                }
                _ -> {
                  std.log("You aren't on hotbar slot 0.")
                  NotRunning
                }
              }
            }
            _ -> {
              std.log2("I'm already running!")
              state
            }
            
          }
        },
      ),
    ],
    [
      update_loop.HotbarRender(handler: fn(key, state) {
        case state, gui.current_gui() {
          _, option.Some(_) | NotRunning, _ -> Nil
          _, option.None -> {
            render.render_string(key, 100, 100, case state {
              ShowingItemFixerStoppedMessage(_) -> {
                "&cStopped successfully, it's safe to close out of any windows that were open!"
              }
              _ -> "&fCurrently running item fixer, press 'X' to stop running."
            })
          }
        }
      }),
      update_loop.PostGuiRender(handler: fn(key, state, _gui) {
        case state {
          NotRunning -> Nil
          _ -> {
            render.render_string(key, 100, 100, case state {
              ShowingItemFixerStoppedMessage(_) -> {
                "&cStopped successfully, it's safe to close out of any windows that were open!"
              }
              _ -> "&fCurrently running item fixer, press 'X' to stop running."
            })
          }
        }
      }),
    ],
  )
}
