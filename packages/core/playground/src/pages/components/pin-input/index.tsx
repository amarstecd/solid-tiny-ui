import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { PinInput } from "~";
import { PlayIt } from "../../../components/play-it";

function PlayPinInput() {
  const [params, setParams] = createStore({
    disabled: false,
    placeholder: "○",
    length: 4,
    size: "medium" as const,
    invalid: false,
    mask: false,
    type: "numeric" as const,
  });

  const [val, setVal] = createSignal("");

  return (
    <PlayIt
      onChange={setParams}
      properties={params}
      typeDeclaration={{
        size: ["small", "medium", "large"],
        type: ["numeric", "alphanumeric"],
      }}
    >
      <div>
        <div>Value: {val()}</div>
        <div>
          <PinInput
            disabled={params.disabled}
            invalid={params.invalid}
            length={params.length}
            mask={params.mask}
            onChange={setVal}
            placeholder={params.placeholder}
            size={params.size}
            type={params.type}
            value={val()}
          />
        </div>
      </div>
    </PlayIt>
  );
}

export default function PinInputPage() {
  return (
    <div>
      <PlayPinInput />
    </div>
  );
}
