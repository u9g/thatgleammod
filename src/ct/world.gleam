import ct/player

@external(javascript, "../../../../../src/ct/ct_std.js", "world__get_players")
pub fn get_players() -> List(player.Player)
