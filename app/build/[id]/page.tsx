"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import type {
  Block,
  BuyBlockData,
  ProjectSettings,
  RefinanceBlockData,
  RenovateBlockData,
  RentBlockData,
  SellBlockData,
  Property,
} from "@/types";
import { BuyBlock } from "@/components/BuyBlock";
import { RenovateBlock } from "@/components/RenovateBlock";
import { RefinanceBlock } from "@/components/RefinanceBlock";
import { RentBlock } from "@/components/RentBlock";
import { SellBlock } from "@/components/SellBlock";
import {
  blockTypeLabels,
  blockTypeColors,
  getBlockDotColor,
} from "@/utils/blockHelpers";
import { LineGraph } from "@/components/uiComponents/LineGraph";
import { MetricCard } from "@/components/shared/MetricCard";
import { ProjectSettingsPanel } from "@/components/BuildPage/ProjectSettingsPanel";
import { useProjectSettings } from "@/hooks/useProjectSettings";
import { useBlockManager } from "@/hooks/useBlockManager";
import { calculateKeyMetrics } from "@/utils/metrics";
import { getPropertyById, saveProperty } from "@/utils/propertyStorage";
import { ChatPanel } from "@/components/shared/ChatPanel";
import { EmptyState } from "@/components/shared/EmptyState";
import { Alert } from "@/components/shared/Alert";
import { Button } from "@/components/uiComponents/Button";
import { DropdownMenu } from "@/components/uiComponents/DropdownMenu";
import { IconButton } from "@/components/uiComponents/IconButton";

interface GraphDataPoint {
  date: string;
  investedCapital: number;
  cashOnHand: number;
  equity: number;
  remainingLoanBalance: number;
  monthlyNet: number;
}

export default function BuildProperty() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: "start" | "end") => {
    requestAnimationFrame(() => {
      if (!carouselRef.current) return;
      carouselRef.current.scrollTo({
        left: direction === "end" ? carouselRef.current.scrollWidth : 0,
        behavior: "smooth",
      });
    });
  };

  const [graphData, setGraphData] = useState<GraphDataPoint[]>([]);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [loanOverlapMonthsMap, setLoanOverlapMonthsMap] = useState<
    Record<number, number>
  >({});
  const {
    selectedYears,
    setSelectedYears,
    cashStrategy,
    setCashStrategy,
    idealCashHoldingBalance,
    setIdealCashHoldingBalance,
    estimatedHomeAppreciationRate,
    setEstimatedHomeAppreciationRate,
    purchaseDate,
    setPurchaseDate,
    getProjectSettings,
  } = useProjectSettings();

  // Create project settings object to pass to useBlockManager
  const currentProjectSettings = {
    years: selectedYears,
    cashStrategy,
    idealCashHoldingBalance: parseFloat(idealCashHoldingBalance) || 0,
    estimatedHomeAppreciationRate:
      parseFloat(estimatedHomeAppreciationRate) || 0,
    purchaseDate,
  };

  const {
    blocks,
    setBlocks,
    addBlock,
    removeBlock,
    moveBlock,
    updateBlockData,
    hasBuyBlock,
    hasSellBlock,
  } = useBlockManager(
    undefined,
    currentProjectSettings,
    property?.propertyTaxRate,
  );
  const [metrics, setMetrics] = useState<{
    roi: number;
    cashOnCashReturn: number;
    timeToPayOffLoan: number | null;
    totalProfit: number;
    netPresentValue: number;
    annualizedRoi: number;
    capRate: number;
    netOperatingIncome: number;
    totalRoi: number;
  }>({
    roi: 0,
    cashOnCashReturn: 0,
    timeToPayOffLoan: null,
    totalProfit: 0,
    netPresentValue: 0,
    annualizedRoi: 0,
    capRate: 0,
    netOperatingIncome: 0,
    totalRoi: 0,
  });

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const loadProperty = async () => {
      try {
        const loaded = await getPropertyById(propertyId);
        if (!loaded) {
          router.push("/");
          return;
        }

        setProperty(loaded);
        setBlocks(loaded.blocks);
        setSelectedYears(loaded.projectSettings.years);
        setCashStrategy(loaded.projectSettings.cashStrategy);
        setIdealCashHoldingBalance(
          loaded.projectSettings.idealCashHoldingBalance.toString(),
        );
        setEstimatedHomeAppreciationRate(
          loaded.projectSettings.estimatedHomeAppreciationRate.toString(),
        );
        setPurchaseDate(loaded.projectSettings.purchaseDate);
        setSaveError(null);
      } catch (error) {
        if (error instanceof Error && error.message === "Unauthorized") {
          router.push("/login");
        } else {
          console.error("Failed to load property:", error);
          setSaveError("Failed to load property");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProperty();
  }, [
    propertyId,
    router,
    setBlocks,
    setSelectedYears,
    setCashStrategy,
    setIdealCashHoldingBalance,
    setEstimatedHomeAppreciationRate,
    setPurchaseDate,
  ]);

  const displayMetrics =
    hoveredIndex !== null && graphData.length > 0
      ? calculateKeyMetrics(graphData.slice(0, hoveredIndex + 1))
      : metrics;

  const hoveredTimeLabel =
    hoveredIndex !== null && graphData.length > 0
      ? (() => {
          const months = hoveredIndex + 1;
          const y = Math.floor(months / 12);
          const m = months % 12;
          if (y > 0 && m > 0) return `${y}y ${m}m`;
          if (y > 0) return `${y}y`;
          return `${m}m`;
        })()
      : null;

  useEffect(() => {
    const autoSave = async () => {
      if (property) {
        try {
          const updatedProperty: Property = {
            ...property,
            blocks,
            projectSettings: getProjectSettings(),
          };
          await saveProperty(updatedProperty);
          setSaveError(null);
        } catch (error) {
          if (error instanceof Error && error.message === "Unauthorized") {
            router.push("/login");
          } else {
            console.error("Failed to save property:", error);
            setSaveError("Failed to save changes");
          }
        }
      }
    };

    autoSave();
  }, [
    blocks,
    selectedYears,
    cashStrategy,
    idealCashHoldingBalance,
    estimatedHomeAppreciationRate,
    purchaseDate,
    property,
    getProjectSettings,
    router,
  ]);

  const handleExport = async () => {
    try {
      const projectSettings = getProjectSettings();
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks, projectSettings }),
      });
      if (!response.ok) {
        throw new Error(
          `Export failed: ${response.status} ${response.statusText}`,
        );
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "financial-analysis.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  useEffect(() => {
    const syncBlocks = async () => {
      try {
        const projectSettings: ProjectSettings = {
          years: selectedYears,
          cashStrategy,
          idealCashHoldingBalance: parseFloat(idealCashHoldingBalance) || 0,
          estimatedHomeAppreciationRate:
            parseFloat(estimatedHomeAppreciationRate) || 0,
          purchaseDate,
        };

        const response = await fetch("/api/build", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            blocksJson: JSON.stringify(blocks),
            projectSettings,
          }),
        });
        if (!response.ok) {
          throw new Error(
            `API error: ${response.status} ${response.statusText}`,
          );
        }
        const result = await response.json();

        console.log({
          debug: "API_SYNC",
          blocks: blocks.map((b) => ({
            id: b.id,
            type: b.type,
            data: b.data,
          })),
          graphData: {
            length: result.graphData?.length || 0,
            data: result.graphData || [],
            sample: result.graphData?.slice(0, 3) || [],
          },
          monthlyPayment: result.monthlyPayment,
          loanOverlapMonthsMap: result.loanOverlapMonthsMap,
          debugBlocksSetup: result.debug?.blocks || null,
          fullResponse: { ...result, debug: undefined },
        });

        if (result.debug) {
          if (result.debug.blocks && result.debug.blocks.length > 0) {
            const hasCalculatedRefinance = result.debug.blocks.some(
              (b: Block) =>
                b.type === "refinance" &&
                (b.data as RefinanceBlockData)?.cost &&
                parseFloat((b.data as RefinanceBlockData).cost) > 0,
            );
            if (hasCalculatedRefinance) {
              setBlocks((prevBlocks: Block[]): Block[] => {
                let changed = false;
                const updatedBlocks: Block[] = prevBlocks.map(
                  (prevBlock: Block): Block => {
                    const calculatedBlock = result.debug.blocks.find(
                      (cb: Block) => cb.type === prevBlock.type,
                    );
                    if (
                      calculatedBlock &&
                      calculatedBlock.data &&
                      prevBlock.type === "refinance" &&
                      calculatedBlock.data.cost
                    ) {
                      const prevData = prevBlock.data as RefinanceBlockData;
                      if (
                        prevData.cost !== calculatedBlock.data.cost ||
                        prevData.costType !== calculatedBlock.data.costType
                      ) {
                        changed = true;
                        return {
                          ...prevBlock,
                          data: {
                            ...prevBlock.data,
                            cost: calculatedBlock.data.cost,
                            costType: calculatedBlock.data.costType,
                          },
                        };
                      }
                    }
                    return prevBlock;
                  },
                );
                return changed ? updatedBlocks : prevBlocks;
              });
            }
          }
        }
        if (result.graphData) {
          setGraphData(result.graphData);
        }
        if (result.monthlyPayment !== undefined) {
          setMonthlyPayment(result.monthlyPayment);
        }
        if (result.loanOverlapMonthsMap) {
          setLoanOverlapMonthsMap(result.loanOverlapMonthsMap);
        }
      } catch (error) {
        console.error("Failed to sync blocks:", error);
        if (error instanceof Error) {
          console.error("Error details:", error.message);
        }
      }
    };

    if (blocks.length > 0) {
      void syncBlocks();
    }
  }, [
    blocks,
    selectedYears,
    cashStrategy,
    idealCashHoldingBalance,
    estimatedHomeAppreciationRate,
    purchaseDate,
    setBlocks,
  ]);

  useEffect(() => {
    const calculateMetrics = async () => {
      try {
        const projectSettings: ProjectSettings = {
          years: selectedYears,
          cashStrategy,
          idealCashHoldingBalance: parseFloat(idealCashHoldingBalance) || 0,
          estimatedHomeAppreciationRate:
            parseFloat(estimatedHomeAppreciationRate) || 0,
          purchaseDate,
        };

        const response = await fetch("/api/metrics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            blocksJson: JSON.stringify(blocks),
            projectSettings,
          }),
        });
        if (!response.ok) {
          throw new Error(
            `API error: ${response.status} ${response.statusText}`,
          );
        }
        const result = await response.json();
        if (result.metrics) {
          console.log({
            debug: "METRICS_CALCULATION",
            metrics: result.metrics,
            roi: result.metrics.roi,
            annualizedRoi: result.metrics.annualizedRoi,
            cashOnCashReturn: result.metrics.cashOnCashReturn,
            capRate: result.metrics.capRate,
            netOperatingIncome: result.metrics.netOperatingIncome,
            netPresentValue: result.metrics.netPresentValue,
            totalProfit: result.metrics.totalProfit,
            timeToPayOffLoan: result.metrics.timeToPayOffLoan,
          });
          setMetrics(result.metrics);
        }
      } catch (error) {
        console.error("Failed to calculate metrics:", error);
        if (error instanceof Error) {
          console.error("Error details:", error.message);
        }
      }
    };

    if (blocks.length > 0) {
      void calculateMetrics();
    }
  }, [
    blocks,
    selectedYears,
    cashStrategy,
    idealCashHoldingBalance,
    estimatedHomeAppreciationRate,
    purchaseDate,
  ]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-text-muted">Loading property...</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="p-6">
        <div className="text-text-muted">Property not found</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-65px)]">
      <div className="flex-1 min-w-0 p-6 overflow-y-auto">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <button
              data-testid="back-to-dashboard"
              onClick={() => router.push("/")}
              className="text-primary hover:text-primary-dark mb-2 flex items-center gap-1 text-sm font-medium"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-text mb-2">
              {property.name}
            </h1>
            <p className="text-text-muted">
              {[property.zipCode, property.county].filter(Boolean).join(" · ")}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ProjectSettingsPanel
              idealCashHoldingBalance={idealCashHoldingBalance}
              onCashBalanceChange={setIdealCashHoldingBalance}
              estimatedHomeAppreciationRate={estimatedHomeAppreciationRate}
              onAppreciationRateChange={setEstimatedHomeAppreciationRate}
              purchaseDate={purchaseDate}
              onPurchaseDateChange={setPurchaseDate}
              cashStrategy={cashStrategy}
              onCashStrategyChange={setCashStrategy}
            />
            <Button
              onClick={() => setChatOpen((prev) => !prev)}
              variant={chatOpen ? "primary" : "secondary"}
              title={chatOpen ? "Close AI chat" : "Open AI chat"}
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              }
            >
              AI Chat
            </Button>
            <DropdownMenu
              options={[
                {
                  value: "buy",
                  label: "Buy Block",
                  disabled: hasBuyBlock,
                  dotColor: "#3b82f6",
                  dataTestId: "add-buy-block",
                },
                {
                  value: "renovate",
                  label: "Renovate Block",
                  dotColor: "#10b981",
                  dataTestId: "add-renovate-block",
                },
                {
                  value: "refinance",
                  label: "Refinance Block",
                  dotColor: "#8b5cf6",
                  dataTestId: "add-refinance-block",
                },
                {
                  value: "rent",
                  label: "Rent Block",
                  dotColor: "#f59e0b",
                  dataTestId: "add-rent-block",
                },
                {
                  value: "sell",
                  label: "Sell Block",
                  disabled: hasSellBlock,
                  dotColor: "#14b8a6",
                  dataTestId: "add-sell-block",
                },
              ]}
              onSelect={(value) => {
                addBlock(value as Parameters<typeof addBlock>[0]);
                scrollCarousel(value === "buy" ? "start" : "end");
              }}
              isOpen={dropdownOpen}
              onOpenChange={setDropdownOpen}
            >
              <Button
                onClick={() => setDropdownOpen((prev) => !prev)}
                title="Add block"
                data-testid="add-block-button"
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                }
              >
                Add Block
              </Button>
            </DropdownMenu>
          </div>
        </header>

        {saveError && (
          <Alert className="mb-4" title="Save Error">
            {saveError}
          </Alert>
        )}

        <div
          ref={carouselRef}
          className="flex flex-row gap-4 overflow-x-auto pb-4 items-start"
        >
          {blocks.length === 0 && (
            <EmptyState
              icon={
                <svg
                  className="w-10 h-10 text-text-muted/50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              }
              title="No blocks yet"
              description="Start building your real estate analysis by adding blocks above. Add a Buy block to begin."
            />
          )}

          {blocks.map((block, index) => (
            <div
              key={block.id}
              className={`bg-white rounded-xl shadow-sm border border-border border-l-4 ${blockTypeColors[block.type]} min-w-[380px] max-w-[420px] flex-shrink-0`}
            >
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-border">
                <h3 className="font-semibold text-text flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full ${getBlockDotColor(block.type)}`}
                  />
                  {blockTypeLabels[block.type]} Block #{index + 1}
                </h3>
                <div className="flex items-center gap-1">
                  <IconButton
                    onClick={() => moveBlock(index, "up")}
                    disabled={
                      index === 0 ||
                      blocks[index - 1]?.type === "buy" ||
                      block.type === "buy" ||
                      block.type === "sell"
                    }
                    title={
                      block.type === "buy" || block.type === "sell"
                        ? "Fixed position"
                        : "Move left"
                    }
                    label="Move left"
                  >
                    ←
                  </IconButton>
                  <IconButton
                    onClick={() => moveBlock(index, "down")}
                    disabled={
                      index === blocks.length - 1 ||
                      blocks[index + 1]?.type === "sell" ||
                      block.type === "buy" ||
                      block.type === "sell"
                    }
                    title={
                      block.type === "buy" || block.type === "sell"
                        ? "Fixed position"
                        : "Move right"
                    }
                    label="Move right"
                  >
                    →
                  </IconButton>
                  <IconButton
                    onClick={() => removeBlock(block.id)}
                    className="ml-2"
                    variant="danger"
                    title="Delete block"
                    label="Delete block"
                  >
                    ×
                  </IconButton>
                </div>
              </div>

              <div className="p-4">
                {block.type === "buy" && (
                  <BuyBlock
                    data={block.data as BuyBlockData}
                    onChange={(data) => updateBlockData(block.id, data)}
                  />
                )}
                {block.type === "renovate" && (
                  <RenovateBlock
                    data={block.data as RenovateBlockData}
                    onChange={(data) => updateBlockData(block.id, data)}
                    monthlyPayment={monthlyPayment}
                    loanOverlapMonths={loanOverlapMonthsMap[index] || 0}
                  />
                )}
                {block.type === "refinance" && (
                  <RefinanceBlock
                    data={block.data as RefinanceBlockData}
                    onChange={(data) => updateBlockData(block.id, data)}
                  />
                )}
                {block.type === "rent" && (
                  <RentBlock
                    data={block.data as RentBlockData}
                    onChange={(data) => updateBlockData(block.id, data)}
                  />
                )}
                {block.type === "sell" && (
                  <SellBlock
                    data={block.data as SellBlockData}
                    onChange={(data) => updateBlockData(block.id, data)}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-6 items-stretch">
          <div className="w-80 bg-white rounded-xl shadow-sm border border-border p-4 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text">Key Metrics</h3>
              {hoveredTimeLabel && (
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                  as of {hoveredTimeLabel}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                label="ROI"
                value={displayMetrics.roi}
                format="percentage"
              />
              <MetricCard
                label="Annualized ROI"
                value={displayMetrics.annualizedRoi}
                format="percentage"
              />
              <MetricCard
                label="Cash on Cash Return"
                value={displayMetrics.cashOnCashReturn}
                format="percentage"
              />
              <MetricCard
                label="Cap Rate"
                value={displayMetrics.capRate}
                format="percentage"
              />
              <MetricCard
                label="NOI"
                value={displayMetrics.netOperatingIncome}
                format="currency"
              />
              <MetricCard
                label="Net Present Value"
                value={displayMetrics.netPresentValue}
                format="currency"
              />
              <MetricCard
                label="Time to Pay Off"
                value={metrics.timeToPayOffLoan}
                format="duration"
              />
              <MetricCard
                label="Total Profit"
                value={displayMetrics.totalProfit}
                format="currency"
              />
            </div>
          </div>
          <LineGraph
            data={graphData}
            selectedYears={selectedYears}
            onYearsChange={setSelectedYears}
            onHoverIndexChange={setHoveredIndex}
            onExport={handleExport}
          />
        </div>
      </div>
      <ChatPanel
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        blocks={blocks}
        projectSettings={currentProjectSettings}
        metrics={metrics}
      />
    </div>
  );
}
