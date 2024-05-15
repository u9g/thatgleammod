import ct/event.{RenderItemIntoGui, WindowOpen}
import ct/events
import ct/gui
import ct/item
import ct/std.{LeftClick, ShiftRightClick}
import ct/update_loop

fn wait_for_item(item_name: String, handler: fn() -> a) {
  events.handle_until_render_item_into_gui(
    fn(item) { std.remove_color(item.name(item)) == item_name },
    fn(_item) { handler() },
  )
}

pub fn start() {
  update_loop.make(
    Nil,
    [
      update_loop.CustomCommand(custom_command_name: "ifix", handler: fn(state) {
        std.chat("/edit")
        use _ <- events.handle_next_window_open()
        use <- wait_for_item("Edit Actions")
        std.click(34, LeftClick)
        use <- wait_for_item("Add Action")
        std.click(50, LeftClick)
        use <- wait_for_item("Change Player Stat")
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
        std.write_into_anvil("19")
        use _gui <- events.handle_next_window_open()
        std.click(34, LeftClick)
        std.click(22, ShiftRightClick)
        state
      }),
    ],
    [],
  )

  Nil
}
