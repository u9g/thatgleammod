import ct/gui.{type Gui}

pub type EventLoop

pub type PostGuiRenderKey

pub type EventHandler(a) {
  ScrollUp(handler: fn(a) -> a)
  ScrollDown(handler: fn(a) -> a)
  Tick(handler: fn(a) -> a)
  CustomCommand(custom_command_name: String, handler: fn(a) -> a)
  // key is Keyboard.{} from chattriggers, ie: KEY_R or KEY_K
  CustomKeybind(
    key: String,
    description: String,
    handler: fn(a) -> a,
    gui_key_handler: fn(a, Gui) -> a,
  )
  GuiOpened(handler: fn(a, Gui) -> a)
  GuiClosed(handler: fn(a) -> a)
}

pub type Displayer(a, b) {
  PostGuiRender(handler: fn(PostGuiRenderKey, a, Gui) -> Nil)
  HotbarRender(handler: fn(PostGuiRenderKey, a) -> Nil)
}

@external(javascript, "../../../../../src/ct/ct_std", "update_loop__make")
pub fn make(
  init: a,
  event_handlers: List(EventHandler(a)),
  displayers: List(Displayer(a, b)),
) -> EventLoop
