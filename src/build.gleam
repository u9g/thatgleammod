import glance.{FunctionType, NamedType, VariableType}
import glance_printer
import gleam/io
import gleam/list
import gleam/option
import gleam/result
import gleam/string
import shellout
import simplifile

fn type_to_str(typ: glance.Type) {
  case typ {
    NamedType(name, module, parameters) -> {
      let assert True = list.is_empty(parameters)
      case module {
        option.Some(module_name) -> module_name <> name
        option.None -> name
      }
    }
    FunctionType(argument_types, return_type) -> {
      "fn("
      <> argument_types |> list.map(type_to_str) |> string.join(", ")
      <> ") -> "
      <> type_to_str(return_type)
    }
    VariableType(name) -> name
    _ -> panic as string.inspect(typ)
  }
}

fn events() {
  let path = "src\\ct\\"

  let code = case simplifile.read(from: path <> "event.gleam") {
    Ok(str) -> str
    Error(err) -> panic as string.inspect(err)
  }

  let assert Ok(parsed) = glance.module(code)

  let assert Ok(event_definition) =
    parsed.custom_types |> list.find(fn(x) { x.definition.name == "Event" })

  let to_write =
    glance_printer.print_imports(parsed)
    <> "\n"
    <> "import ct/event\n"
    <> event_definition.definition.variants
    |> list.map(fn(variant) { #(variant.name, variant.fields) })
    |> list.map(fn(tup) {
      let #(str, fields) = tup
      let fn_name =
        str
        |> string.to_graphemes
        |> list.fold("", fn(acc, char) {
          case acc == "", string.uppercase(char) == char {
            True, _ -> acc <> string.lowercase(char)
            _, True -> acc <> "_" <> string.lowercase(char)
            _, False -> acc <> char
          }
        })

      let field_type_strs =
        fields |> list.map(fn(x) { x.item }) |> list.map(type_to_str)

      let field_names =
        fields
        |> list.map(fn(x) {
          case x.label {
            option.Some(name) -> name
            _ -> todo
          }
        })
      #(fn_name, field_type_strs, str, field_names)
    })
    |> list.map(fn(tup) {
      let #(fn_name, field_types, original_type_name, field_names) = tup
      "pub fn handle_next_"
      <> fn_name
      <> "("
      <> {
        let assert #([handler_name], [handler_type]) = #(
          field_names,
          field_types,
        )

        handler_name <> ": " <> handler_type
      }
      <> ")"
      <> "{\n event.handle_next(event."
      <> original_type_name
      <> "("
      <> field_names |> string.join(", ")
      <> ")) \n}"
      <> "\n"
      <> "pub fn handle_until_"
      <> fn_name
      <> "("
      <> {
        let assert #([handler_name], [handler_type]) = #(
          field_names,
          field_types,
        )

        handler_name
        <> "_until"
        <> ": "
        <> string.drop_right(handler_type, 1)
        <> "Bool"
      }
      <> ", "
      <> {
        let assert #([handler_name], [handler_type]) = #(
          field_names,
          field_types,
        )

        handler_name <> ": " <> handler_type
      }
      <> ")"
      <> "{\n event.handle_until("
      <> {
        let assert [handler_name] = field_names

        let until =
          "event."
          <> original_type_name
          <> "("
          <> handler_name
          <> "_until"
          <> ")"
        let handler =
          "event." <> original_type_name <> "(" <> handler_name <> ")"

        until <> ", " <> handler
      }
      <> ") \n}"
    })
    |> string.join("\n")

  let assert Ok(parsed) = glance.module(to_write)

  let assert Ok(_) =
    simplifile.write(
      contents: "// GENERATED\n\n" <> glance_printer.print(parsed),
      to: path <> "events.gleam",
    )
}

pub fn main() {
  events()
  case shellout.command(in: ".", opt: [], run: "gleam", with: ["build"]) {
    Ok(_output) -> Nil
    Error(err) -> {
      io.println(err.1)
      panic
    }
  }

  case
    shellout.command(in: ".", opt: [], run: "bun", with: [
      "build", "src/ct/ct_std.ts", "--outfile", "build/ffi.js",
    ])
  {
    Ok(output) -> {
      io.println(output)
      io.println("Compiled ct_std.ts with bun")
      Nil
    }
    Error(err) -> {
      io.println(err.1)
      panic
    }
  }

  case
    shellout.command(in: ".", opt: [], run: "powershell", with: [
      "-Command", "rollup", "-c",
    ])
  {
    Ok(output) -> {
      io.println(output)
      io.println(">> Rollup ran")
      Nil
    }
    Error(err) -> {
      io.println(err.1)
      panic
    }
  }
}
