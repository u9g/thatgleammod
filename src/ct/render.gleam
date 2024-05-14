import ct/update_loop.{type PostGuiRenderKey}

@external(javascript, "../../../../../src/ct/ct_std", "render__render_string")
pub fn render_string(
  key: PostGuiRenderKey,
  x: Int,
  y: Int,
  to_write: String,
) -> Nil

@external(javascript, "../../../../../src/ct/ct_std", "render__scale")
pub fn scale(key: PostGuiRenderKey, x: Float, y: Float) -> Nil

@external(javascript, "../../../../../src/ct/ct_std", "render__get_screen_width")
pub fn screen_width() -> Int

@external(javascript, "../../../../../src/ct/ct_std", "render__get_screen_height")
pub fn screen_height() -> Int

pub type FontRenderer

@external(javascript, "../../../../../src/ct/ct_std", "render__get_font_renderer")
pub fn font_renderer() -> FontRenderer
