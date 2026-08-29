interface InstitutionChecklistProps {
  legend: string;
  selectedCount: number;
  items: { code: string; name: string }[];
  selected: string[];
  onChange: (codes: string[]) => void;
}

function toggleInArray(arr: string[], value: string): string[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

export function InstitutionChecklist({
  legend,
  selectedCount,
  items,
  selected,
  onChange,
}: InstitutionChecklistProps) {
  return (
    <fieldset>
      <legend className="flex items-center justify-between w-full text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
        <span>
          {legend} ({selectedCount})
        </span>
        <span className="flex gap-2 normal-case tracking-normal">
          <button
            type="button"
            onClick={() => onChange(items.map((item) => item.code))}
            className="text-[11px] text-secondary hover:underline"
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-[11px] text-muted-foreground hover:underline"
          >
            Limpar
          </button>
        </span>
      </legend>
      <div className="max-h-56 overflow-y-auto rounded-xl bg-input-bg p-2 space-y-1">
        {items.map((item) => {
          const checked = selected.includes(item.code);
          return (
            <label
              key={item.code}
              className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-card/60"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onChange(toggleInArray(selected, item.code))}
                className="h-4 w-4 accent-primary"
              />
              <span className="text-sm">{item.name}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
