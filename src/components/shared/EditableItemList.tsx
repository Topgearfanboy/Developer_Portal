"use client";

type StringFieldKey<T> = {
  [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];

interface EditableItemListProps<TItem> {
  items: TItem[];
  onChange: (items: TItem[]) => void;
  nameField: StringFieldKey<TItem>;
  costField: StringFieldKey<TItem>;
  placeholder?: string;
  addLabel?: string;
  emptyMessage?: string;
}

export function EditableItemList<TItem>({
  items,
  onChange,
  nameField,
  costField,
  placeholder = "Item name",
  addLabel = "+ Add Item",
  emptyMessage = "No items added yet",
}: EditableItemListProps<TItem>) {
  const updateItem = (index: number, field: keyof TItem, value: string) => {
    const newItems = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    );
    onChange(newItems as TItem[]);
  };

  const addItem = () => {
    const newItem = { [nameField]: "", [costField]: "" } as TItem;
    onChange([...items, newItem]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-text-muted">
          Items
        </label>
        <button
          onClick={addItem}
          className="text-sm text-primary hover:text-primary-dark font-medium"
        >
          {addLabel}
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={(item[nameField] as unknown as string) ?? ""}
              onChange={(e) => updateItem(index, nameField, e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              inputMode="numeric"
              value={(item[costField] as unknown as string) ?? ""}
              onChange={(e) =>
                updateItem(
                  index,
                  costField,
                  e.target.value.replace(/[^0-9.]/g, ""),
                )
              }
              placeholder="$0"
              className="w-20 px-2 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
            <button
              onClick={() => removeItem(index)}
              className="px-3 py-2 text-danger hover:bg-red-50 rounded-lg"
            >
              ×
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-text-muted italic">{emptyMessage}</p>
        )}
      </div>
    </div>
  );
}
