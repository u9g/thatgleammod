/// <reference types="../vendor/ct" />

import {
  toList,
  Ok,
  Error,
  List,
} from "../../build/dev/javascript/prelude.mjs";
import {
  Some,
  None,
} from "../../build/dev/javascript/gleam_stdlib/gleam/option.mjs";

type Nil = undefined;
declare const global: any;

export function triggers__register_on_tick(fnx: () => Nil) {
  return register("tick", fnx);
}

export function triggers__register_on_post_gui_render(fnx: () => Nil) {
  return register("postGuiRender", fnx);
}

export function triggers__every_x_seconds<a>(
  sec: number,
  fnx: (arg0: a) => a,
  defaultValue: a
) {
  let value = defaultValue;
  return register("step", () => {
    value = fnx(value);
  }).setDelay(sec);
}

export function world__get_players() {
  return toList(World.getAllPlayers());
}

export function player__get_name(player: Player) {
  return player.getName();
}

export function player__get_uuid(player: Player) {
  return player.getUUID();
}

export function std__log(toLog: any) {
  return ChatLib.chat(toLog);
}

export function std__log2(toLog: any) {
  return console.log(toLog);
}

export function std__classof(to_get_class_of: any) {
  return to_get_class_of?.getClass?.()?.toString?.() ?? "??";
}

export function std__now() {
  return Client.getSystemTime();
}

export function std__chat(msg: string) {
  return ChatLib.say(msg);
}

export function player__me(): Player {
  return (Player as any).INSTANCE;
}

export function player__distance_to(thePlayer: Player, otherPlayer: Player) {
  return (thePlayer as unknown as Entity).distanceTo(otherPlayer.getPlayer());
}

export function reflection__classof(obj: any): Some | None {
  try {
    const value = obj.getClass();
    if (!value) {
      return new FailedToGetBaseClass();
    }
    return new Ok(value);
  } catch (e: any) {
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

export function reflection__get_private_field_value(
  baseClass: any,
  fieldName: string
) {
  let field = baseClass.getDeclaredField(fieldName);
  return (baseObj: Some | None) => {
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

export function reflection__field<T>(fieldName: string) {
  return (baseObj: any) => {
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
          (): Some | None => {
            let value = field.get(baseObj);
            if (value) {
              return new Some(value);
            } else {
              return new None();
            }
          },
          (newValue: T) => field.set(baseObj, newValue)
        )
      );
    } catch (e: any) {
      return new Error(new ThrownError(e.toString()));
    }
  };
}

export function reflection__get_priv_value(fieldName: string) {
  return (baseObj: any) => {
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
    } catch (e: any) {
      return new Error(new ThrownError(e.toString()));
    }
  };
}

export function reflection__set_priv_value(fieldName: string) {
  return (baseObj: any, value: any) => {
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
    } catch (e: any) {
      return new Error(new ThrownError(e.toString()));
    }
  };
}

export function reflection__get_static_method(
  baseClass: string,
  methodName: string
) {
  return (args: any[]) => {
    try {
      const ty = !baseClass.includes(".")
        ? global[baseClass]
        : Java.type(baseClass);
      if (!ty) {
        return new Error(new FailedToFindJavaType(baseClass));
      }

      let method = ty[methodName];
      if (!method) {
        return new Error(new FailedToGetMethod(methodName));
      }

      const value = ty[methodName](...args);
      if (!value) {
        return new Ok(new None());
      }

      return new Ok(new Some(value));
    } catch (e: any) {
      return new Error(new ThrownError(e.toString()));
    }
  };
}

export function reflection__new_instance(className: string) {
  const ty = !className.includes(".")
    ? global[className]
    : Java.type(className);
  if (!ty) {
    return new Error(new FailedToFindJavaType(className));
  }

  return (args: any[]) => {
    try {
      const value = new ty(...args);
      if (!value) {
        return new Ok(new None());
      }

      return new Ok(new Some(value));
    } catch (e: any) {
      return new Error(new ThrownError(e.toString()));
    }
  };
}

export function reflection__call_method(
  methodName: string,
  callType: PublicCall | PrivateJavaMethodCall | { toString: () => string }
) {
  return (baseObject: any, args: any[]) => {
    try {
      let value;
      if (callType instanceof PublicCall) {
        value = baseObject[methodName](...args);
      } else if (callType instanceof PrivateJavaMethodCall) {
        const methodHandle = baseObject
          .getClass()
          .getDeclaredMethod(methodName);
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

export function reflection__get_field_value(
  baseClass: string,
  methodName: string
) {
  return (onObject: Some | None) => {
    try {
      const type = Java.type(baseClass);
      if (!type) {
        return new None();
      }
      let field = type.class.getDeclaredField(methodName);
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

const loadItemstack = (slot: number, itemStack: MCTItemStack) => {
  Client.sendPacket(
    new C10PacketCreativeInventoryAction(
      slot, // slot, 36=hotbar slot 1
      itemStack // item to get as a minecraft item stack object
    )
  );
};

export function player__set_hotbar_slot_to_item(
  itemToSet: Item,
  hotbarSlotToFill: number
) {
  loadItemstack(36 + hotbarSlotToFill, itemToSet.getItemStack());
}

export function player__clear_slot(hotbarSlotToFill: number) {
  loadItemstack(36 + hotbarSlotToFill, null as unknown as MCTItemStack);
}

export function std__read_file(fromPath: string) {
  return FileLib.read(fromPath);
}

const scrollUp: ((...args: any[]) => any)[] = [];
const scrollDown: ((...args: any[]) => any)[] = [];
const tick: ((...args: any[]) => any)[] = [];
const postGuiRender: ((...args: any[]) => any)[] = [];
const hotbarRender: ((...args: any[]) => any)[] = [];
const guiKey: ((...args: any[]) => any)[] = [];
const guiOpened: ((...args: any[]) => any)[] = [];
const guiClosed: ((...args: any[]) => any)[] = [];

const handleNext = {
  windowOpen: [] as ((...args: any[]) => any)[],
} as const satisfies Record<string, ((...args: any[]) => any)[]>;

const handleUntil = {
  renderItemIntoWindow: new Set(),
} as const satisfies Record<string, Set<(...args: any[]) => any>>;

const thenCall = new Map();

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
  for (const handler of handleNext.windowOpen.splice(0)) {
    console.log("gui called");
    handler(e.gui);
  }
});

register("guiClosed", () => {
  guiClosed.forEach((fn) => fn());
});

register("renderItemIntoGui", (item) => {
  let toRemove = [];
  for (const handler of handleUntil.renderItemIntoWindow) {
    if (handler(item)) {
      toRemove.push(handler);
    }
  }
  for (const el of toRemove) {
    handleUntil.renderItemIntoWindow.delete(el);
    thenCall.get(el)(item);
    thenCall.delete(el);
  }
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

export function update_loop__make<T>(
  init: T,
  eventHandlers: {
    toArray: () => (
      | ScrollUp
      | ScrollDown
      | Tick
      | CustomCommand
      | CustomKeybind
      | GuiOpened
      | GuiClosed
    )[];
  },
  displayers: { toArray: () => (PostGuiRender | HotbarRender)[] }
) {
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
        Keyboard[eventHandler.key as keyof Keyboard],
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

export function render__render_string(
  _: Nil,
  x: number,
  y: number,
  toWrite: string
) {
  Renderer.drawStringWithShadow(toWrite, x, y);
}

export function render__scale(_: Nil, x: number, y: number) {
  Renderer.scale(x, y);
}

export function player__get_item_in_slot(slot: number) {
  const inventory = Player.getInventory();
  if (inventory) {
    const item = inventory.getStackInSlot(slot);
    if (item) {
      return new Some(item);
    }
  }

  return new None();
}

export function gui__is_instance_of(gui: any, className: string) {
  return gui.class.getName() === className;
}

export function gui__slot_under_mouse(gui: any) {
  const slot = gui?.getSlotUnderMouse?.();
  if (slot) {
    return new Some(new Slot(slot));
  }
  return new None();
}

export function gui__item_in_slot(slot: Slot) {
  const item = slot.getItem();
  if (item) {
    return new Some(item);
  }
  return new None();
}

export function item__name(item: Item) {
  return item.getName();
}

export function item__lore(item: Item) {
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

export function std__add_color(string: string) {
  return ChatLib.addColor(string);
}

export function gui__current_gui() {
  const gui = (Client as any)?.currentGui?.get();
  if (gui) {
    return new Some(gui);
  }
  return new None();
}

export function std__from_js_array(arr: List) {
  return toList([...arr]);
}

export function std__is_key_down(keyName: keyof Keyboard) {
  return Keyboard.isKeyDown(Keyboard[keyName]);
}

export function std__to_js_array(arr: any) {
  return arr.toArray();
}

const C0EPacketClickWindow = Java.type(
  "net.minecraft.network.play.client.C0EPacketClickWindow"
);

export function std__internal_click(
  slotId: number,
  mode: number,
  button: number
) {
  Client.sendPacket(
    new C0EPacketClickWindow(
      Player.getContainer()!!.getWindowId(),
      slotId,
      button,
      mode,
      null,
      0
    )
  );
}

import {
  RenderItemIntoGui,
  WindowOpen,
} from "../../build/dev/javascript/examplemod/ct/events.mjs";

type Event = WindowOpen | RenderItemIntoGui;

export function events__handle_next(event: Event) {
  if (event instanceof WindowOpen) {
    handleNext.windowOpen.push(event.handler);
  } else {
    throw "Event given to events::handle_next of type that isn't understood";
  }
}

export function events__handle_until<T extends Event>(
  eventFilterer: T,
  event: T
) {
  if (event instanceof RenderItemIntoGui) {
    if (
      event instanceof RenderItemIntoGui &&
      !(eventFilterer instanceof RenderItemIntoGui)
    )
      throw "Expected event and eventFilterer in events::handle_until to be of the same enumeration type, instead they were different.";
    handleUntil.renderItemIntoWindow.add(eventFilterer.handler);
    thenCall.set(eventFilterer.handler, event.handler);
  } else {
    throw "Event given to events::handle_until of type that isn't understood";
  }
}