@external(javascript, "../../../../../src/ct/ct_std.js", "triggers__register_on_tick")
pub fn register_on_tick(tick_handler _tick_handler: fn() -> Nil) -> Nil

@external(javascript, "../../../../../src/ct/ct_std.js", "triggers__register_on_post_gui_render")
pub fn register_on_post_gui_render(
  post_gui_render_handler _post_gui_render_handler: fn() -> Nil,
) -> Nil

@external(javascript, "../../../../../src/ct/ct_std.js", "triggers__every_x_seconds")
pub fn every_x_seconds(
  seconds _seconds: Int,
  handler _handler: fn(a) -> a,
  default_value _default_value: a,
) -> Nil
