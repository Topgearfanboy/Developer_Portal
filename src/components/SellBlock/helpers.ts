import type { SellBlockData } from "../../types";
import { createTypeChangeHandler } from "../../utils/valueTypeConverter";

const getSellPriceBase = (data: SellBlockData) =>
  parseFloat(data.sellPrice.replace(/[^0-9.]/g, "")) || 0;

export const handleClosingCostsTypeChange = (
  data: SellBlockData,
  onChange: (data: SellBlockData) => void,
  newType: "$" | "%",
) =>
  createTypeChangeHandler(data, onChange, {
    typeField: "closingCostsType",
    valueField: "closingCosts",
    getBaseAmount: getSellPriceBase,
  })(newType);
