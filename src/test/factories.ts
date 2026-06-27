import {
  defaultBuyData,
  defaultRenovateData,
  defaultRentData,
  defaultRefinanceData,
  defaultSellData,
} from "../defaultData";
import type {
  Block,
  BlockType,
  BuyBlockData,
  ProjectSettings,
  RefinanceBlockData,
  RenovateBlockData,
  RentBlockData,
  SellBlockData,
} from "../types";

let idCounter = 0;

function nextId(type: BlockType): string {
  idCounter += 1;
  return `${type}-test-${idCounter}`;
}

export function createProjectSettings(
  overrides: Partial<ProjectSettings> = {},
): ProjectSettings {
  return {
    years: 30,
    cashStrategy: "profit",
    idealCashHoldingBalance: 0,
    estimatedHomeAppreciationRate: 5,
    purchaseDate: "2020-01-01",
    ...overrides,
  };
}

export function createBuyBlock(
  overrides: Partial<BuyBlockData> & { id?: string } = {},
): Block {
  const { id, ...dataOverrides } = overrides;
  const data: BuyBlockData = { ...defaultBuyData(), ...dataOverrides };
  return { id: id ?? nextId("buy"), type: "buy", data };
}

export function createRentBlock(
  overrides: Partial<RentBlockData> & { id?: string } = {},
): Block {
  const { id, ...dataOverrides } = overrides;
  const data: RentBlockData = { ...defaultRentData(), ...dataOverrides };
  return { id: id ?? nextId("rent"), type: "rent", data };
}

export function createRenovateBlock(
  overrides: Partial<RenovateBlockData> & { id?: string } = {},
): Block {
  const { id, ...dataOverrides } = overrides;
  const data: RenovateBlockData = { ...defaultRenovateData(), ...dataOverrides };
  return { id: id ?? nextId("renovate"), type: "renovate", data };
}

export function createRefinanceBlock(
  overrides: Partial<RefinanceBlockData> & { id?: string } = {},
): Block {
  const { id, ...dataOverrides } = overrides;
  const data: RefinanceBlockData = { ...defaultRefinanceData(), ...dataOverrides };
  return { id: id ?? nextId("refinance"), type: "refinance", data };
}

export function createSellBlock(
  overrides: Partial<SellBlockData> & { id?: string } = {},
): Block {
  const { id, ...dataOverrides } = overrides;
  const data: SellBlockData = { ...defaultSellData(), ...dataOverrides };
  return { id: id ?? nextId("sell"), type: "sell", data };
}
