import ct/gui.{is_instance_of}
import ct/item
import ct/reflection.{
  type FieldReflection, PublicCall, call_method, classof,
  get_private_field_value, get_static_method,
}
import ct/render
import ct/std.{is_key_down}
import ct/stdext.{panic_unwrap_o, unwrap}
import ct/update_loop
import gleam/bool
import gleam/function
import gleam/int
import gleam/list
import gleam/option.{None, Some, then}
import gleam/result
import gleam/string

type State {
  NoText
  ItemText(text: List(String))
}

fn enable_repeat_events(bool: Bool) {
  get_static_method("Keyboard", "enableRepeatEvents")(#(bool)) |> unwrap
}

const name_editor_class_name = "fr.atesab.act.gui.modifier.GuiStringModifier"

const lore_editor_class_name = "fr.atesab.act.gui.modifier.GuiStringArrayModifier"

fn in_lore_editor(gui: gui.Gui) -> Bool {
  is_instance_of(gui, lore_editor_class_name)
}

fn in_name_editor(gui: gui.Gui) -> Bool {
  is_instance_of(gui, name_editor_class_name)
}

const is_focused_field_name = "field_146213_o"

type TextField

fn is_shift_down() {
  is_key_down("KEY_LSHIFT") || is_key_down("KEY_RSHIFT")
}

fn is_ctrl_down() {
  is_key_down("KEY_LCONTROL") || is_key_down("KEY_RCONTROL")
}

fn get_text_fields(gui: gui.Gui) -> List(#(FieldReflection(Bool, a), Int)) {
  reflection.get_priv_value("tfs")(gui)
  |> unwrap
  |> std.from_js_array
  |> list.index_map(with: fn(x, i) {
    #(reflection.field(is_focused_field_name)(x) |> unwrap, i)
  })
}

fn focused_text_field(
  text_fields: List(#(FieldReflection(Bool, a), Int)),
) -> option.Option(Int) {
  list.find_map(text_fields, with: fn(text_field_with_i) {
    let #(text_field, i) = text_field_with_i

    let is_focused = text_field.get() |> panic_unwrap_o

    use <- bool.guard(when: !is_focused, return: Error(Nil))

    // SETTING FOUND FIELD TO FALSE
    text_field.set(False)
    Ok(i)
  })
  |> stdext.deresult
}

pub fn start() {
  update_loop.make(
    NoText,
    [
      update_loop.CustomKeybind(
        description: "Add a new line to the lore editors",
        gui_key_handler: fn(state, gui) {
          use <- bool.guard(
            when: !in_lore_editor(gui) || !is_ctrl_down(),
            return: state,
          )

          let text_fields = get_text_fields(gui)
          let focused_text_field_ix =
            focused_text_field(text_fields) |> panic_unwrap_o

          let values_field = unwrap(reflection.field("values")(gui))

          let new_lore_lines = {
            let lore_lines =
              values_field.get() |> std.from_js_array |> std.to_js_array

            call_method("splice", PublicCall)(lore_lines, #(
              focused_text_field_ix + 1,
              0,
              "",
            ))

            let list_as_array_list =
              reflection.new_instance("ArrayList")(#(lore_lines))
              |> unwrap

            list_as_array_list
          }

          values_field.set(new_lore_lines)

          call_method("defineMenu", reflection.PrivateJavaMethodCall)(gui, #())

          let is_focused =
            // re-get text fields after calling defineMenu
            get_text_fields(gui)
            |> list.at(focused_text_field_ix + 1)
            |> unwrap

          { is_focused.0 }.set(True)

          state
        },
        handler: fn(state) { state },
        key: "KEY_RETURN",
      ),
      update_loop.CustomKeybind(
        description: "Go forward or backward on line of lore editor",
        gui_key_handler: fn(state, gui) {
          use <- bool.guard(when: !in_lore_editor(gui), return: state)

          let text_fields = get_text_fields(gui)

          let focused_text_field_ix =
            focused_text_field(text_fields) |> panic_unwrap_o

          let is_shift_down =
            is_key_down("KEY_LSHIFT") || is_key_down("KEY_RSHIFT")

          let focus_this_ix = case is_shift_down {
            False -> focused_text_field_ix + 1
            True -> focused_text_field_ix - 1
          }

          use text_field_to_focus_ix <- stdext.then_or(
            list.length(text_fields) |> int.modulo(focus_this_ix, _),
            or: state,
          )

          use text_field <- stdext.then_or(
            text_fields |> list.at(text_field_to_focus_ix),
            or: state,
          )

          { text_field.0 }.set(True)

          state
        },
        handler: fn(state) { state },
        key: "KEY_TAB",
      ),
      update_loop.GuiOpened(handler: fn(state, gui) {
        let assert None = case in_name_editor(gui), in_lore_editor(gui) {
          True, _ | _, True -> enable_repeat_events(True)
          _, _ -> None
        }
        state
      }),
      update_loop.GuiClosed(handler: fn(state) {
        let assert Some(gui) = gui.current_gui()
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
              Some(gui) -> {
                x(gui)
              }
              None -> state
            }
          }

        let lines_to_render: option.Option(List(String)) = case
          in_name_editor(gui),
          in_lore_editor(gui)
        {
          // lore editor
          _, True -> {
            let gui_class = gui |> classof |> unwrap

            let lore_lines: List(String) =
              get_private_field_value(gui_class, "values")(Some(gui))
              |> option.lazy_unwrap(fn() { panic })
              |> std.from_js_array
              |> list.map(std.add_color)

            use parent <- then(call_method("getParent", PublicCall)(gui, #()))

            let parentclass = parent |> classof |> unwrap

            let item: option.Option(item.RawItem) =
              get_private_field_value(parentclass, "currentItemStack")(Some(
                parent,
              ))

            use raw_item <- then(item)

            let item = item.from_raw_item(raw_item)

            Some([item |> item.name, ..lore_lines])
          }
          // name editor
          True, _ -> {
            let gui_class = gui |> classof |> unwrap

            use text_field <- then(
              get_private_field_value(gui_class, "field")(Some(gui)),
            )

            let text_field_class = text_field |> classof |> unwrap

            use text_field_value <- then(
              get_private_field_value(text_field_class, "field_146216_j")(Some(
                text_field,
              )),
            )

            let text_field_value = std.add_color(text_field_value)

            use parent <- then(call_method("getParent", PublicCall)(gui, #()))

            let parentclass = parent |> classof |> unwrap

            let item: option.Option(item.RawItem) =
              get_private_field_value(parentclass, "currentItemStack")(Some(
                parent,
              ))

            use raw_item <- then(item)

            let item = item.from_raw_item(raw_item)

            Some([text_field_value, ..{ item |> item.lore }])
          }
          _, _ -> {
            None
          }
        }

        case lines_to_render {
          Some(text_to_copy) -> ItemText(text_to_copy)
          None -> NoText
        }
      }),
    ],
    [
      update_loop.PostGuiRender(fn(key, state, _gui) {
        key |> render.scale(1.25, 1.25)

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
            |> unwrap
          }
          NoText -> None
        }

        key |> render.scale(1.0, 1.0)
      }),
    ],
  )
}
