// GENERATED

import ct/gui.{type Gui}
import ct/item.{type Item}
import ct/event

pub fn handle_next_window_open(handler: fn(Gui) -> a) {
  event.handle_next(event.WindowOpen(handler))
}

pub fn handle_until_window_open(
  handler_until: fn(Gui) -> Bool,
  handler: fn(Gui) -> a,
) {
  event.handle_until(event.WindowOpen(handler_until), event.WindowOpen(handler))
}

pub fn handle_next_window_close(handler: fn() -> a) {
  event.handle_next(event.WindowClose(handler))
}

pub fn handle_until_window_close(handler_until: fn() -> Bool, handler: fn() -> a) {
  event.handle_until(
    event.WindowClose(handler_until),
    event.WindowClose(handler),
  )
}

pub fn handle_next_render_item_into_gui(handler: fn(Item) -> a) {
  event.handle_next(event.RenderItemIntoGui(handler))
}

pub fn handle_until_render_item_into_gui(
  handler_until: fn(Item) -> Bool,
  handler: fn(Item) -> a,
) {
  event.handle_until(
    event.RenderItemIntoGui(handler_until),
    event.RenderItemIntoGui(handler),
  )
}
