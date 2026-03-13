import css from "sass:./pin-input.scss";
import { createMemo, createSignal, For, type JSX } from "solid-js";
import {
  combineClass,
  combineStyle,
  createWatch,
  dataIf,
  mountStyle,
} from "solid-tiny-utils";
import { createClassStyles, extraAriasAndDatasets } from "../../../utils";
import type { ClassNames, Styles } from "../../../utils/types";

export interface PinInputProps {
  /** Number of input fields */
  length?: number;
  /** Current value string */
  value?: string;
  /** Callback when value changes */
  onChange?: (value: string) => void;
  /** Callback when all fields are filled */
  onComplete?: (value: string) => void;
  /** Placeholder character for each field */
  placeholder?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Whether to mask input (like password) */
  mask?: boolean;
  /** Restrict input to digits only */
  type?: "alphanumeric" | "numeric";
  /** Component size */
  size?: "small" | "medium" | "large";
  /** Whether the input is invalid */
  invalid?: boolean;
  /** HTML id */
  id?: string;
  /** HTML name */
  name?: string;
  /** Gap between inputs */
  gap?: JSX.CSSProperties["gap"];
  /** Width of each input cell */
  cellWidth?: JSX.CSSProperties["width"];
  /** Custom class names */
  classNames?: ClassNames<
    "wrapper" | "cell",
    { disabled: boolean; invalid: boolean; size: "small" | "medium" | "large" }
  >;
  /** Custom styles */
  styles?: Styles<
    "wrapper" | "cell",
    { disabled: boolean; invalid: boolean; size: "small" | "medium" | "large" }
  >;
}

const NUMERIC_RE = /^\d$/;
const ALPHANUMERIC_RE = /^[a-zA-Z0-9]$/;

export function PinInput(props: PinInputProps) {
  mountStyle(css, "tiny-pin-input");

  const length = createMemo(() => props.length ?? 4);
  const type = createMemo(() => props.type ?? "numeric");

  const [values, setValues] = createSignal<string[]>([]);
  const inputRefs: HTMLInputElement[] = [];

  // Sync external value → internal values
  createWatch(
    () => props.value,
    (val) => {
      const chars = (val ?? "").split("").slice(0, length());
      const padded = Array.from({ length: length() }, (_, i) => chars[i] ?? "");
      setValues(padded);
    }
  );

  // Sync internal values → external onChange
  createWatch(
    () => values().join(""),
    (joined) => {
      if (joined !== (props.value ?? "")) {
        props.onChange?.(joined);
      }
      if (joined.length === length() && joined.trim().length === length()) {
        props.onComplete?.(joined);
      }
    },
    { defer: true }
  );

  const [classes, styles] = createClassStyles(
    () => props.classNames,
    () => props.styles,
    () => ({
      disabled: props.disabled ?? false,
      invalid: props.invalid ?? false,
      size: (props.size || "medium") as "small" | "medium" | "large",
    })
  );

  const isValidChar = (char: string) => {
    if (type() === "numeric") {
      return NUMERIC_RE.test(char);
    }
    return ALPHANUMERIC_RE.test(char);
  };

  const focusCell = (index: number) => {
    const ref = inputRefs[index];
    if (ref) {
      ref.focus();
      ref.select();
    }
  };

  const updateValue = (index: number, char: string) => {
    setValues((prev) => {
      const next = [...prev];
      while (next.length < length()) {
        next.push("");
      }
      next[index] = char;
      return next;
    });
  };

  const handleInput = (index: number, e: Event) => {
    const target = e.currentTarget as HTMLInputElement;
    const inputValue = target.value;

    // Handle paste-like multi-char input
    if (inputValue.length > 1) {
      const chars = inputValue.split("").filter(isValidChar);
      setValues((prev) => {
        const next = [...prev];
        while (next.length < length()) {
          next.push("");
        }
        for (let i = 0; i < chars.length && index + i < length(); i++) {
          next[index + i] = chars[i];
        }
        return next;
      });
      const nextIndex = Math.min(index + chars.length, length() - 1);
      focusCell(nextIndex);
      return;
    }

    if (inputValue && isValidChar(inputValue)) {
      updateValue(index, inputValue);
      if (index < length() - 1) {
        focusCell(index + 1);
      }
    } else {
      target.value = values()[index] ?? "";
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const current = values()[index];
      if (current) {
        updateValue(index, "");
      } else if (index > 0) {
        updateValue(index - 1, "");
        focusCell(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusCell(index - 1);
    } else if (e.key === "ArrowRight" && index < length() - 1) {
      e.preventDefault();
      focusCell(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData?.getData("text") ?? "";
    const chars = pasted.split("").filter(isValidChar).slice(0, length());
    if (chars.length === 0) {
      return;
    }

    setValues(() => {
      const next = Array.from({ length: length() }, (_, i) => chars[i] ?? "");
      return next;
    });
    focusCell(Math.min(chars.length, length() - 1));
  };

  const handleFocus = (e: FocusEvent) => {
    (e.currentTarget as HTMLInputElement).select();
  };

  const indices = createMemo(() =>
    Array.from({ length: length() }, (_, i) => i)
  );

  return (
    <div
      {...extraAriasAndDatasets(props as Record<string, unknown>)}
      class={combineClass("tiny-pin-input-wrapper", classes().wrapper)}
      data-disabled={dataIf(props.disabled ?? false)}
      data-invalid={dataIf(props.invalid ?? false)}
      data-size={props.size || "medium"}
      id={props.id}
      style={combineStyle({ gap: props.gap }, styles().wrapper)}
    >
      <For each={indices()}>
        {(index) => (
          <input
            autocomplete="one-time-code"
            class={combineClass("tiny-pin-input-cell", classes().cell)}
            disabled={props.disabled}
            inputmode={type() === "numeric" ? "numeric" : "text"}
            maxLength={1}
            name={props.name ? `${props.name}-${index}` : undefined}
            onFocus={handleFocus}
            onInput={(e) => handleInput(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            placeholder={props.placeholder}
            ref={(el) => {
              inputRefs[index] = el;
            }}
            style={combineStyle({ width: props.cellWidth }, styles().cell)}
            type={props.mask ? "password" : "text"}
            value={values()[index] ?? ""}
          />
        )}
      </For>
    </div>
  );
}
