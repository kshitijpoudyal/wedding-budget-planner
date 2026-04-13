import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { CalcButton } from "./CalcButton"
import { useCalculator } from "@/hooks/useCalculator"
import { cn } from "@/lib/utils"

type CalculatorModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CalculatorModal({ open, onOpenChange }: CalculatorModalProps) {
  const {
    display,
    previousValue,
    operation,
    inputDigit,
    inputDecimal,
    clear,
    toggleSign,
    percentage,
    performOperation,
    equals,
    formatDisplay,
    history,
    clearHistory,
  } = useCalculator()

  const [showHistory, setShowHistory] = useState(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[360px] p-0 overflow-hidden gap-0"
      >
        {/* Header */}
        <DialogHeader className="flex-row items-center justify-between px-4 pt-4 pb-0 gap-0">
          <DialogTitle>Calculator</DialogTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowHistory((v) => !v)}
              className={cn(showHistory && "bg-muted")}
              aria-label="Toggle history"
            >
              <Icon name="history" size="md" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onOpenChange(false)}
              aria-label="Close calculator"
            >
              <Icon name="close" size="md" />
            </Button>
          </div>
        </DialogHeader>

        {/* History panel */}
        {showHistory && (
          <div className="mx-4 mt-3 rounded-xl bg-surface-container-low overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
              <p className="text-xs font-medium text-muted-foreground">History</p>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-xs text-destructive hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="max-h-40 overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4 italic">
                  No calculations yet
                </p>
              ) : (
                history.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between px-3 py-2 border-b border-border/30 last:border-0"
                  >
                    <span className="text-xs text-muted-foreground truncate mr-2">
                      {entry.expression}
                    </span>
                    <span className="text-sm font-semibold tabular-nums shrink-0">
                      = {entry.result}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Calculator body */}
        <div className="p-4 space-y-3">
          {/* Display */}
          <div className="px-3 py-3 rounded-xl bg-surface-container-high dark:bg-surface-container min-h-[72px] flex flex-col justify-end items-end">
            {operation && previousValue !== null && (
              <div className="text-xs text-muted-foreground mb-1">
                {previousValue} {operation}
              </div>
            )}
            <div className="text-3xl font-semibold tabular-nums tracking-tight truncate max-w-full">
              {formatDisplay(display)}
            </div>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-4 gap-2">
            <CalcButton onClick={clear} variant="function" compact>C</CalcButton>
            <CalcButton onClick={toggleSign} variant="function" compact>±</CalcButton>
            <CalcButton onClick={percentage} variant="function" compact>%</CalcButton>
            <CalcButton onClick={() => performOperation("÷")} variant="operator" compact>÷</CalcButton>

            <CalcButton onClick={() => inputDigit("7")} compact>7</CalcButton>
            <CalcButton onClick={() => inputDigit("8")} compact>8</CalcButton>
            <CalcButton onClick={() => inputDigit("9")} compact>9</CalcButton>
            <CalcButton onClick={() => performOperation("×")} variant="operator" compact>×</CalcButton>

            <CalcButton onClick={() => inputDigit("4")} compact>4</CalcButton>
            <CalcButton onClick={() => inputDigit("5")} compact>5</CalcButton>
            <CalcButton onClick={() => inputDigit("6")} compact>6</CalcButton>
            <CalcButton onClick={() => performOperation("-")} variant="operator" compact>−</CalcButton>

            <CalcButton onClick={() => inputDigit("1")} compact>1</CalcButton>
            <CalcButton onClick={() => inputDigit("2")} compact>2</CalcButton>
            <CalcButton onClick={() => inputDigit("3")} compact>3</CalcButton>
            <CalcButton onClick={() => performOperation("+")} variant="operator" compact>+</CalcButton>

            <CalcButton onClick={() => inputDigit("0")} span={2} compact>0</CalcButton>
            <CalcButton onClick={inputDecimal} compact>.</CalcButton>
            <CalcButton onClick={equals} variant="equals" compact>=</CalcButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
