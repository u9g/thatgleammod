import ct/events.{RenderItemIntoGui, WindowOpen}
import ct/gui
import ct/item
import ct/std.{LeftClick}
import ct/update_loop

pub fn start() {
  update_loop.make(
    Nil,
    [
      update_loop.CustomCommand(custom_command_name: "ifix", handler: fn(state) {
        std.chat("/edit")
        use _gui <-
          fn(handler: fn(gui.Gui) -> Nil) {
            events.handle_next(WindowOpen(handler))
          }
        use _gui <-
          fn(handler: fn(item.Item) -> Nil) {
            events.handle_until(
              RenderItemIntoGui(fn(item) {
                case item |> item.name {
                  "§aEdit Actions" -> True
                  _ -> False
                }
              }),
              RenderItemIntoGui(handler),
            )
          }
        std.click(34, LeftClick)
        std.log("clicked")
        state
      }),
    ],
    [],
  )
}
