/** biome-ignore-all lint/complexity/noBannedTypes: I need Function */
import css from "sass:./combobox.scss";
import { createMemo, createSignal, For, type JSX, Show } from "solid-js";
import {
  combineClass,
  combineStyle,
  createWatch,
  dataIf,
  mountStyle,
} from "solid-tiny-utils";
import { ArrowDownSLine } from "../../../icons";
import { Listbox } from "../../../primitives/listbox";
import { createClassStyles } from "../../../utils";
import type { ClassNames, Styles } from "../../../utils/types";
import { Popover } from "../../popover";
import { SpinRing } from "../../spin";
import { VisuallyHidden } from "../../visually-hidden";

export interface ComboboxOption {
  label: JSX.Element;
  value: unknown;
  disabled?: boolean;
}

export interface ComboboxProps<T extends ComboboxOption> {
  value?: T["value"];
  onChange?: (value: T["value"]) => void;
  loading?: boolean;
  options: T[];
  classNames?: ClassNames<
    "trigger" | "popoverContent" | "options" | "option" | "suffix",
    {}
  >;
  styles?: Styles<
    "trigger" | "popoverContent" | "options" | "option" | "suffix",
    {}
  >;
  placeholder?: string;
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  id?: string;
  name?: string;
}

export function Combobox<T extends ComboboxOption>(props: ComboboxProps<T>) {
  mountStyle(css, "tiny-combobox");

  const [value, setValue] = createSignal<T["value"] | undefined>(props.value);

  const label = createMemo(() => {
    const found = props.options.find((option) => option.value === value());
    return found ? found.label : "";
  });

  createWatch(
    () => props.value,
    (v) => {
      setValue(() => v);
    },
    { defer: true }
  );

  const [classes, styles] = createClassStyles(
    () => props.classNames,
    () => props.styles,
    () => ({})
  );

  return (
    <Popover
      disabled={props.disabled || props.loading}
      placement="bottom"
      trigger="click"
    >
      {(state, acts) => (
        <>
          <Popover.Trigger>
            <div
              class={combineClass("tiny-combobox__trigger", classes().trigger)}
              data-disabled={dataIf(props.disabled ?? false)}
              data-loading={dataIf(props.loading ?? false)}
              data-open={dataIf(state.open)}
              data-size={props.size ?? "medium"}
              style={combineStyle({}, styles().trigger)}
            >
              <VisuallyHidden>
                <input
                  name={props.name}
                  type="hidden"
                  value={String(value() ?? "")}
                />
              </VisuallyHidden>
              <div class="tiny-combobox__label">
                {label() || props.placeholder}
              </div>
              <div
                class="tiny-combobox__suffix"
                style={combineStyle({}, styles().suffix)}
              >
                <Show fallback={<ArrowDownSLine />} when={props.loading}>
                  <SpinRing color="inherit" size={16} />
                </Show>
              </div>
            </div>
          </Popover.Trigger>
          <Popover.Content
            class={combineClass("", classes().popoverContent)}
            style={combineStyle(
              {
                padding: 0,
                overflow: "hidden",
              },
              styles().popoverContent
            )}
          >
            <Listbox
              autofocus
              class={combineClass(
                "tiny-combobox__options tiny-combobox-vars",
                classes().options
              )}
              style={combineStyle(
                {
                  "--tiny-combobox-trigger-width": `${state.refTrigger?.offsetWidth}px`,
                },
                styles().options
              )}
            >
              <For each={props.options}>
                {(option) => (
                  <Listbox.Item
                    class={combineClass(
                      "tiny-combobox__option",
                      classes().option
                    )}
                    data-selected={dataIf(option.value === value())}
                    disabled={option.disabled}
                    focus={option.value === value()}
                    onClick={() => {
                      props.onChange?.(option.value);
                      setValue(option.value);
                      acts.setOpen(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        props.onChange?.(option.value);
                        setValue(option.value);
                        acts.setOpen(false);
                      }
                    }}
                    style={combineStyle({}, styles().option)}
                  >
                    {option.label}
                  </Listbox.Item>
                )}
              </For>
            </Listbox>
          </Popover.Content>
        </>
      )}
    </Popover>
  );
}
