import gleam/io
import gleam/result
import gleam/string
import shellout

pub fn main() {
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
