import ct/gui
import ct/item
import ct/reflection
import ct/render
import ct/std
import ct/stdext
import ct/update_loop
import gleam/function
import gleam/list
import gleam/option.{then}
import gleam/string

type State {
  NoText
  ItemText(text: List(String))
}

fn enable_repeat_events(bool: Bool) {
  reflection.get_static_method("Keyboard", "enableRepeatEvents")(#(bool))
}

const name_editor_class_name = "fr.atesab.act.gui.modifier.GuiStringModifier"

const lore_editor_class_name = "fr.atesab.act.gui.modifier.GuiStringArrayModifier"

fn in_lore_editor(gui: gui.Gui) -> Bool {
  gui.is_instance_of(gui, lore_editor_class_name)
}

fn in_name_editor(gui: gui.Gui) -> Bool {
  gui.is_instance_of(gui, name_editor_class_name)
}

pub fn start() {
  update_loop.make(
    NoText,
    [
      update_loop.GuiOpened(handler: fn(state, gui) {
        let assert option.None = case in_name_editor(gui), in_lore_editor(gui) {
          True, _ | _, True -> enable_repeat_events(True)
          _, _ -> option.None
        }
        state
      }),
      update_loop.GuiClosed(handler: fn(state) {
        let assert option.Some(gui) = gui.current_gui()
        let assert option.None = case in_name_editor(gui), in_lore_editor(gui) {
          True, _ | _, True -> enable_repeat_events(True)
          _, _ -> option.None
        }
        state
      }),
    ],
    [
      update_loop.PostGuiRender(fn(key, _state, gui) {
        key |> render.scale(2, 2)

        let lines_to_render = case in_name_editor(gui), in_lore_editor(gui) {
          // lore editor
          _, True -> {
            use gui_class <- then(reflection.classof(gui))

            let lore_lines: List(String) =
              reflection.get_private_field_value(gui_class, "values")(
                option.Some(gui),
              )
              |> option.lazy_unwrap(fn() { panic })
              |> std.from_js_array
              |> list.map(std.add_color)

            use parent <- then(reflection.call_method("getParent")(gui, #()))

            use parentclass <- then(reflection.classof(parent))

            let item: option.Option(item.RawItem) =
              reflection.get_private_field_value(
                parentclass,
                "currentItemStack",
              )(option.Some(parent))

            use raw_item <- then(item)

            let item = item.from_raw_item(raw_item)

            option.Some([item |> item.name, ..lore_lines])
          }
          // name editor
          True, _ -> {
            use gui_class <- then(reflection.classof(gui))

            use text_field <- then(
              reflection.get_private_field_value(gui_class, "field")(
                option.Some(gui),
              ),
            )

            use text_field_class <- then(reflection.classof(text_field))

            use text_field_value <- then(
              reflection.get_private_field_value(
                text_field_class,
                "field_146216_j",
              )(option.Some(text_field)),
            )

            let text_field_value = std.add_color(text_field_value)

            use parent <- then(reflection.call_method("getParent")(gui, #()))

            use parentclass <- then(reflection.classof(parent))

            let item: option.Option(item.RawItem) =
              reflection.get_private_field_value(
                parentclass,
                "currentItemStack",
              )(option.Some(parent))

            use raw_item <- then(item)

            let item = item.from_raw_item(raw_item)

            option.Some([text_field_value, ..{ item |> item.lore }])
          }
          _, _ -> {
            option.None
          }
        }

        case lines_to_render {
          option.Some(lines_to_render) -> {
            reflection.get_static_method(
              "net.minecraftforge.fml.client.config.GuiUtils",
              "drawHoveringText",
            )(#(
              std.to_js_array(lines_to_render),
              0,
              25,
              render.screen_width(),
              render.screen_height(),
              -1,
              render.font_renderer(),
            ))
          }
          option.None -> option.None
        }

        key |> render.scale(1, 1)

        Nil
      }),
    ],
  )
}