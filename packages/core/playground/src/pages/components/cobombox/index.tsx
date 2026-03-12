import { createStore } from "solid-js/store";
import { list } from "solid-tiny-utils";
import { Combobox } from "~";
import { PlayIt } from "~play/components/play-it";

export default function ComboBoxPage() {
  const [params, setParams] = createStore({
    size: "medium" as const,
    disabled: false,
    loading: false,
    custom: false,
  });

  return (
    <PlayIt
      onChange={setParams}
      properties={params}
      typeDeclaration={{
        size: ["small", "medium", "large"],
      }}
    >
      <Combobox
        disabled={params.disabled}
        loading={params.loading}
        options={list(20).map((v) => ({
          label: params.custom ? (
            <div class="inline">
              {`Option ${v + 1}`}
              <div class="i-ri:check-line c-success-base ml-1 inline-block" />
            </div>
          ) : (
            `Option ${v + 1}`
          ),
          value: v + 1,
          disabled: (v + 1) % 4 === 0,
        }))}
        placeholder="select some ..."
        size={params.size}
        styles={{
          trigger: {
            width: "125px",
          },
        }}
      />
    </PlayIt>
  );
}
