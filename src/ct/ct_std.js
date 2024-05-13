import { toList, Ok, Error } from "../../build/dev/javascript/prelude.mjs";
import {
  Some,
  None,
} from "../../build/dev/javascript/gleam_stdlib/gleam/option.mjs";

export function triggers__register_on_tick(fnx) {
  return register("tick", fnx);
}

export function triggers__register_on_post_gui_render(fnx) {
  return register("postGuiRender", fnx);
}

export function triggers__every_x_seconds(sec, fnx, defaultValue) {
  let value = defaultValue;
  return register("step", () => {
    value = fnx(value);
  }).setDelay(sec);
}

export function world__get_players() {
  return toList(World.getAllPlayers());
}

export function player__get_name(player) {
  return player.getName();
}

export function player__get_uuid(player) {
  return player.getUUID();
}

export function std__log(toLog) {
  return ChatLib.chat(toLog);
}

export function std__log2(toLog) {
  return console.log(toLog);
}

export function std__classof(to_get_class_of) {
  return to_get_class_of.getClass().toString() ?? "??";
}

export function std__now() {
  return Client.getSystemTime();
}

export function std__chat(msg) {
  return ChatLib.say(msg);
}

export function player__me() {
  return Player.INSTANCE;
}

export function player__distance_to(thePlayer, otherPlayer) {
  return thePlayer.distanceTo(otherPlayer.getPlayer());
}

export function reflection__classof(obj) {
  try {
    const value = obj.getClass();
    if (!value) {
      return new FailedToGetBaseClass();
    }
    return new Ok(value);
  } catch (e) {
    return new Error(new ThrownError(e.toString()));
  }
}

import {
  FailedToGetBaseClass,
  FailedToGetDeclaredField,
  ThrownError,
  FieldReflection,
  FailedToFindJavaType,
  FailedToGetMethod,
  PublicCall,
  PrivateJavaMethodCall,
} from "../../build/dev/javascript/examplemod/ct/reflection.mjs";

export function reflection__get_private_field_value(baseClass, fieldName) {
  let field = baseClass.getDeclaredField(fieldName);
  return (baseObj) => {
    try {
      if (!field) {
        console.log("return early");
        return new None();
      }
      field.setAccessible(true);
      return new Some(
        baseObj instanceof Some ? field.get(baseObj[0]) : field.get(null)
      );
    } catch (e) {
      console.trace(e);
      return new None();
    }
  };
}

export function reflection__field(fieldName) {
  return (baseObj) => {
    let classof = reflection__classof(baseObj);
    if (classof instanceof None) {
      return new Error(new FailedToGetBaseClass());
    }
    let field = classof[0].getDeclaredField(fieldName);
    try {
      if (!field) {
        return new Error(new FailedToGetDeclaredField(fieldName));
      }
      field.setAccessible(true);
      return new Ok(
        new FieldReflection(
          () => {
            let value = field.get(baseObj);
            if (value) {
              return new Some(value);
            } else {
              return new None();
            }
          },
          (newValue) => field.set(baseObj, newValue)
        )
      );
    } catch (e) {
      return new Error(new ThrownError(e.toString()));
    }
  };
}

export function reflection__get_priv_value(fieldName) {
  return (baseObj) => {
    let classof = reflection__classof(baseObj);
    if (classof instanceof None) {
      return new Error(new FailedToGetBaseClass());
    }
    let field = classof[0].getDeclaredField(fieldName);
    try {
      if (!field) {
        return new Error(new FailedToGetDeclaredField(fieldName));
      }
      field.setAccessible(true);
      return new Ok(field.get(baseObj));
    } catch (e) {
      return new Error(new ThrownError(e.toString()));
    }
  };
}

export function reflection__set_priv_value(fieldName) {
  return (baseObj, value) => {
    let classof = reflection__classof(baseObj);
    if (classof instanceof None) {
      return new Error(new FailedToGetBaseClass());
    }
    let field = classof[0].getDeclaredField(fieldName);
    try {
      if (!field) {
        return new Error(new FailedToGetDeclaredField(fieldName));
      }
      field.setAccessible(true);
      return new Ok(field.set(baseObj, value));
    } catch (e) {
      return new Error(new ThrownError(e.toString()));
    }
  };
}

export function reflection__get_static_method(baseClassStr, methodNameStr) {
  return (args) => {
    try {
      const ty = !baseClassStr.includes(".")
        ? global[baseClassStr]
        : Java.type(baseClassStr);
      if (!ty) {
        return new Error(FailedToFindJavaType(baseClassStr));
      }

      let method = ty[methodNameStr];
      if (!method) {
        return new Error(new FailedToGetMethod(methodNameStr));
      }

      const value = ty[methodNameStr](...args);
      if (!value) {
        return new Ok(new None());
      }

      return new Ok(new Some(value));
    } catch (e) {
      return new Error(new ThrownError(e.toString()));
    }
  };
}

export function reflection__new_instance(classNameStr) {
  const ty = !classNameStr.includes(".")
    ? global[classNameStr]
    : Java.type(classNameStr);
  if (!ty) {
    return new Error(FailedToFindJavaType(classNameStr));
  }

  return (args) => {
    try {
      const value = new ty(...args);
      if (!value) {
        return new Ok(new None());
      }

      return new Ok(new Some(value));
    } catch (e) {
      return new Error(new ThrownError(e.toString()));
    }
  };
}

export function reflection__call_method(methodNameStr, callType) {
  return (baseObject, args) => {
    try {
      let value;
      if (callType instanceof PublicCall) {
        value = baseObject[methodNameStr](...args);
      } else if (callType instanceof PrivateJavaMethodCall) {
        const methodHandle = baseObject
          .getClass()
          .getDeclaredMethod(methodNameStr);
        methodHandle.setAccessible(true);
        value = methodHandle.invoke(baseObject, ...args);
      } else {
        throw (
          "Unexpected call type which doesn't match expected call types: " +
          callType.toString()
        );
      }
      if (!value) {
        return new None();
      }
      return new Some(value);
    } catch (e) {
      return new None();
    }
  };
}

export function reflection__get_field_value(baseClassStr, methodNameStr) {
  return (onObject) => {
    try {
      const type = Java.type(baseClassStr);
      if (!type) {
        return new None();
      }
      let field = type.class.getDeclaredField(methodNameStr);
      field.setAccessible(true);
      let fieldValue = field.get(onObject instanceof Some ? onObject[0] : null);

      if (fieldValue) {
        return new Some(fieldValue);
      } else {
        return new None();
      }
    } catch (e) {
      return new None();
    }
  };
}

const C10PacketCreativeInventoryAction = Java.type(
  "net.minecraft.network.play.client.C10PacketCreativeInventoryAction"
);

const loadItemstack = (slot, itemStack) => {
  Client.sendPacket(
    new C10PacketCreativeInventoryAction(
      slot, // slot, 36=hotbar slot 1
      itemStack // item to get as a minecraft item stack object
    )
  );
};

export function player__set_hotbar_slot_to_item(itemToSet, hotbarSlotToFill) {
  loadItemstack(36 + hotbarSlotToFill, itemToSet.getItemStack());
}

export function player__clear_slot(hotbarSlotToFill) {
  loadItemstack(36 + hotbarSlotToFill, null);
}

export function std__read_file(fromPath) {
  return FileLib.read(fromPath);
}

const scrollUp = [];
const scrollDown = [];
const tick = [];
const postGuiRender = [];
const hotbarRender = [];
const guiKey = [];
const guiOpened = [];
const guiClosed = [];

register("scrolled", (x, y, direction) => {
  if (direction === 1) {
    scrollUp.forEach((fn) => fn());
  } else if (direction === -1) {
    scrollDown.forEach((fn) => fn());
  }
});

register("tick", () => {
  tick.forEach((fn) => fn());
});

register("postGuiRender", (x, y, gui) => {
  postGuiRender.forEach((fn) => fn(gui));
});

register("renderHotbar", () => {
  hotbarRender.forEach((fn) => fn());
});

register("guiKey", (char, keycode, gui, event) => {
  guiKey.forEach((fn) => fn(char, keycode, gui, event));
});

register("guiOpened", (e) => {
  guiOpened.forEach((fn) => fn(e.gui));
});

register("guiClosed", () => {
  guiClosed.forEach((fn) => fn());
});

import {
  CustomCommand,
  HotbarRender,
  PostGuiRender,
  ScrollDown,
  ScrollUp,
  Tick,
  CustomKeybind,
  GuiOpened,
  GuiClosed,
} from "../../build/dev/javascript/examplemod/ct/update_loop.mjs";

export function update_loop__make(init, eventHandlers, displayers) {
  let value = init;
  for (const eventHandler of eventHandlers.toArray()) {
    if (eventHandler instanceof ScrollUp) {
      scrollUp.push(() => {
        value = eventHandler.handler(value);
      });
    } else if (eventHandler instanceof ScrollDown) {
      scrollDown.push(() => {
        value = eventHandler.handler(value);
      });
    } else if (eventHandler instanceof Tick) {
      tick.push(() => {
        value = eventHandler.handler(value);
      });
    } else if (eventHandler instanceof CustomCommand) {
      register("command", (user) => {
        value = eventHandler.handler(value);
      }).setName(eventHandler.custom_command_name);
    } else if (eventHandler instanceof CustomKeybind) {
      const keybind = Client.getKeyBindFromKey(
        Keyboard[eventHandler.key],
        eventHandler.description
      );
      keybind.registerKeyPress(() => {
        value = eventHandler.handler(value);
      });
      guiKey.push((char, keycode, gui, event) => {
        if (keybind.getKeyCode() === keycode) {
          value = eventHandler.gui_key_handler(value, gui);
        }
      });
    } else if (eventHandler instanceof GuiOpened) {
      guiOpened.push((gui) => {
        value = eventHandler.handler(value, gui);
      });
    } else if (eventHandler instanceof GuiClosed) {
      guiClosed.push(() => {
        value = eventHandler.handler(value);
      });
    } else {
      ChatLib.chat("unexpected event handler!!!");
    }
  }

  for (const displayer of displayers.toArray()) {
    if (displayer instanceof PostGuiRender) {
      postGuiRender.push((gui) => {
        displayer.handler(/*key*/ undefined, value, gui);
      });
    } else if (displayer instanceof HotbarRender) {
      hotbarRender.push(() => {
        displayer.handler(/*key*/ undefined, value);
      });
    } else {
      ChatLib.chat("unexpected displayer!!!");
    }
  }
  // console.log(
  //   JSON.stringify(
  //     eventHandlers.toArray(),
  //     function functionReplacer(key, value) {
  //       if (typeof value === "function") {
  //         return "function";
  //       }
  //       return value;
  //     }
  //   )
  // );
}

export function render__render_string(_, x, y, toWrite) {
  Renderer.drawStringWithShadow(toWrite, x, y);
}

export function render__scale(_, x, y) {
  Renderer.scale(x, y);
}

export function player__get_item_in_slot(slot) {
  const inventory = Player.getInventory();
  if (inventory) {
    const item = inventory.getStackInSlot(slot);
    if (item) {
      return new Some(item);
    }
  }

  return new None();
}

export function gui__is_instance_of(gui, className) {
  return gui.class.getName() === className;
}

export function gui__slot_under_mouse(gui) {
  const slot = gui?.getSlotUnderMouse?.();
  if (slot) {
    return new Some(new Slot(slot));
  }
  return new None();
}

export function gui__item_in_slot(slot) {
  const item = slot.getItem();
  if (item) {
    return new Some(item);
  }
  return new None();
}

export function item__name(item) {
  return item.getName();
}

export function item__lore(item) {
  const itemLore = item.getLore().slice(1);
  itemLore.pop();
  return toList(itemLore);
}

export function render__get_screen_width() {
  return Renderer.screen.getWidth();
}

export function render__get_screen_height() {
  return Renderer.screen.getHeight();
}

export function render__get_font_renderer() {
  return Renderer.getFontRenderer();
}

export function std__add_color(string) {
  return ChatLib.addColor(string);
}

export function gui__current_gui() {
  const gui = Client?.currentGui?.get();
  if (gui) {
    return new Some(gui);
  }
  return new None();
}

export function std__from_js_array(arr) {
  return toList([...arr]);
}

export function std__is_key_down(keyName) {
  return Keyboard.isKeyDown(Keyboard[keyName]);
}

export function std__to_js_array(arr) {
  return arr.toArray();
}
