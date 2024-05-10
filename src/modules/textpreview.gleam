import ct/gui.{is_instance_of}
import ct/item
import ct/reflection.{classof, get_static_method}
import ct/render
import ct/std
import ct/stdext
import ct/update_loop
import gleam/function
import gleam/list
import gleam/option.{None, then}
import gleam/string

type State {
  NoText
  ItemText(text: List(String))
}

fn enable_repeat_events(bool: Bool) {
  get_static_method("Keyboard", "enableRepeatEvents")(#(bool))
}

const name_editor_class_name = "fr.atesab.act.gui.modifier.GuiStringModifier"

const lore_editor_class_name = "fr.atesab.act.gui.modifier.GuiStringArrayModifier"

fn in_lore_editor(gui: gui.Gui) -> Bool {
  is_instance_of(gui, lore_editor_class_name)
}

fn in_name_editor(gui: gui.Gui) -> Bool {
  is_instance_of(gui, name_editor_class_name)
}

pub fn start() {
  update_loop.make(
    NoText,
    [
      update_loop.GuiOpened(handler: fn(state, gui) {
        let assert None = case in_name_editor(gui), in_lore_editor(gui) {
          True, _ | _, True -> enable_repeat_events(True)
          _, _ -> None
        }
        state
      }),
      update_loop.GuiClosed(handler: fn(state) {
        let assert option.Some(gui) = gui.current_gui()
        let assert None = case in_name_editor(gui), in_lore_editor(gui) {
          True, _ | _, True -> enable_repeat_events(True)
          _, _ -> None
        }
        state
      }),
      update_loop.Tick(handler: fn(state) {
        let gui = gui.current_gui()
        use gui <-
          fn(x) {
            case gui {
              option.Some(gui) -> {
                x(gui)
              }
              None -> state
            }
          }

        let lines_to_render = case in_name_editor(gui), in_lore_editor(gui) {
          // lore editor
          _, True -> {
            use gui_class <- then(classof(gui))

            let lore_lines: List(String) =
              reflection.get_private_field_value(gui_class, "values")(
                option.Some(gui),
              )
              |> option.lazy_unwrap(fn() { panic })
              |> std.from_js_array
              |> list.map(std.add_color)

            use parent <- then(reflection.call_method("getParent")(gui, #()))

            use parentclass <- then(classof(parent))

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
            use gui_class <- then(classof(gui))

            use text_field <- then(
              reflection.get_private_field_value(gui_class, "field")(
                option.Some(gui),
              ),
            )

            use text_field_class <- then(classof(text_field))

            use text_field_value <- then(
              reflection.get_private_field_value(
                text_field_class,
                "field_146216_j",
              )(option.Some(text_field)),
            )

            let text_field_value = std.add_color(text_field_value)

            use parent <- then(reflection.call_method("getParent")(gui, #()))

            use parentclass <- then(classof(parent))

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
            None
          }
        }

        case lines_to_render {
          option.Some(text_to_copy) -> ItemText(text_to_copy)
          None -> NoText
        }
      }),
    ],
    [
      update_loop.PostGuiRender(fn(key, state, _gui) {
        key |> render.scale(2, 2)

        let _ = case state {
          ItemText(lines_to_render) -> {
            get_static_method(
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
          NoText -> None
        }

        key |> render.scale(1, 1)
      }),
    ],
  )
}
