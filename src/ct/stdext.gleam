import gleam/list
import gleam/option

fn internal_enumerate(
  list: List(a),
  index: Int,
  acc: List(#(a, Int)),
) -> List(#(a, Int)) {
  case list {
    [] -> list.reverse(acc)
    [x, ..xs] -> {
      let acc = [#(x, index), ..acc]
      internal_enumerate(xs, index + 1, acc)
    }
  }
}

pub fn enumerate(list: List(a)) -> List(#(a, Int)) {
  internal_enumerate(list, 0, [])
}

fn internal_filter_map(list: List(Result(a, b)), acc: List(a)) -> List(a) {
  case list {
    [] -> list.reverse(acc)
    [x, ..xs] -> {
      let acc = case x {
        Ok(y) -> [y, ..acc]
        Error(_) -> acc
      }
      internal_filter_map(xs, acc)
    }
  }
}

pub fn filter_map(list: List(Result(a, b))) -> List(a) {
  internal_filter_map(list, [])
}

fn internal_chunked(
  chunk_size: Int,
  list: List(a),
  acc_a: List(List(a)),
  acc_b: List(a),
) -> List(List(a)) {
  case list {
    [] ->
      case acc_b {
        [] -> acc_a
        _ -> [acc_b, ..acc_a]
      }
    [x, ..xs] -> {
      case list.length(acc_b) == chunk_size {
        True ->
          internal_chunked(
            chunk_size,
            xs,
            [list.reverse([x, ..acc_b]), ..acc_a],
            [],
          )
        False -> internal_chunked(chunk_size, xs, acc_a, [x, ..acc_b])
      }
    }
  }
}

pub fn chunked(list: List(a), chunk_size: Int) -> List(List(a)) {
  list.reverse(internal_chunked(chunk_size, list, [], []))
}

pub fn then_(item: Result(a, b), callback: fn(a) -> c) -> Nil {
  case item {
    Ok(x) -> {
      callback(x)
      Nil
    }
    Error(_) -> Nil
  }
}

pub fn then(item: option.Option(a), callback: fn(a) -> c) -> Nil {
  case item {
    option.Some(x) -> {
      callback(x)
      Nil
    }
    option.None -> Nil
  }
}
