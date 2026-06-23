export type ValueType = "$" | "%";

export interface TypeConversionOptions {
  /** Number of decimal places when converting to percentage. */
  percentageDecimals?: number;
}

/**
 * Convert a numeric value between dollar and percentage representations.
 *
 * @param value - The raw numeric value as a string.
 * @param currentType - The current value type.
 * @param newType - The desired value type.
 * @param baseAmount - The amount to use as the 100% basis (e.g., purchase price, monthly rent).
 * @param options - Conversion options.
 * @returns The converted value as a string.
 */
export function convertValueType(
  value: string,
  currentType: ValueType,
  newType: ValueType,
  baseAmount: number,
  options: TypeConversionOptions = {},
): string {
  const { percentageDecimals = 2 } = options;
  const num = parseFloat(value) || 0;

  if (currentType === newType) {
    return value;
  }

  if (baseAmount <= 0) {
    return value;
  }

  if (currentType === "%" && newType === "$") {
    return Math.round((num / 100) * baseAmount).toString();
  }

  if (currentType === "$" && newType === "%") {
    return ((num / baseAmount) * 100).toFixed(percentageDecimals);
  }

  return value;
}

/**
 * Factory for creating a type-change handler that updates both the
 * stored value and its type.
 */
export function createTypeChangeHandler<TData>(
  data: TData,
  onChange: (data: TData) => void,
  options: {
    typeField: keyof TData;
    valueField: keyof TData;
    getBaseAmount: (data: TData) => number;
    percentageDecimals?: number;
  },
) {
  return (newType: ValueType) => {
    const currentType = data[options.typeField] as ValueType;
    const currentValue = data[options.valueField] as string;
    const baseAmount = options.getBaseAmount(data);

    const convertedValue = convertValueType(
      currentValue,
      currentType,
      newType,
      baseAmount,
      { percentageDecimals: options.percentageDecimals },
    );

    onChange({
      ...data,
      [options.typeField]: newType,
      [options.valueField]: convertedValue,
    } as TData);
  };
}
