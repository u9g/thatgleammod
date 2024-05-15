import ct/gui.{type Gui}
import ct/item.{type Item}

pub type Event(a) {
  WindowOpen(handler: fn(Gui) -> a)
  WindowClose(handler: fn() -> a)
  RenderItemIntoGui(handler: fn(Item) -> a)
}

@external(javascript, "../../../../../src/ct/ct_std", "events__handle_next")
pub fn handle_next(event: Event(a)) -> Nil

@external(javascript, "../../../../../src/ct/ct_std", "events__handle_until")
pub fn handle_until(event_filterer: Event(Bool), handle_event: Event(a)) -> Nil
