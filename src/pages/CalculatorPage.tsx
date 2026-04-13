import { SectionHeading } from "@/components/ui/section-heading"
import { CalcButton } from "@/components/calculator/CalcButton"
import { useCalculator } from "@/hooks/useCalculator"

export default function CalculatorPage() {
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
  } = useCalculator()

  return (
    <div className="p-4 md:p-6 space-y-6 md:space-y-8 max-w-md mx-auto pb-20 md:pb-6">
      <SectionHeading
        title="Calculator"
        subtitle="Quick calculations for your budget"
      />

      {/* Calculator Card */}
      <div className="rounded-xl md:rounded-2xl bg-card glass-card p-4 md:p-5 space-y-4 md:space-y-5">
        {/* Display */}
        <div className="p-3 md:p-4 rounded-xl bg-surface-container-high dark:bg-surface-container min-h-[80px] md:min-h-[100px] flex flex-col justify-end items-end">
          {operation && previousValue !== null && (
            <div className="text-xs md:text-sm text-muted-foreground mb-1">
              {previousValue} {operation}
            </div>
          )}
          <div className="text-3xl md:text-5xl font-semibold tabular-nums tracking-tight truncate max-w-full">
            {formatDisplay(display)}
          </div>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-2 md:gap-3">
          <CalcButton onClick={clear} variant="function">C</CalcButton>
          <CalcButton onClick={toggleSign} variant="function">±</CalcButton>
          <CalcButton onClick={percentage} variant="function">%</CalcButton>
          <CalcButton onClick={() => performOperation("÷")} variant="operator">÷</CalcButton>

          <CalcButton onClick={() => inputDigit("7")}>7</CalcButton>
          <CalcButton onClick={() => inputDigit("8")}>8</CalcButton>
          <CalcButton onClick={() => inputDigit("9")}>9</CalcButton>
          <CalcButton onClick={() => performOperation("×")} variant="operator">×</CalcButton>

          <CalcButton onClick={() => inputDigit("4")}>4</CalcButton>
          <CalcButton onClick={() => inputDigit("5")}>5</CalcButton>
          <CalcButton onClick={() => inputDigit("6")}>6</CalcButton>
          <CalcButton onClick={() => performOperation("-")} variant="operator">−</CalcButton>

          <CalcButton onClick={() => inputDigit("1")}>1</CalcButton>
          <CalcButton onClick={() => inputDigit("2")}>2</CalcButton>
          <CalcButton onClick={() => inputDigit("3")}>3</CalcButton>
          <CalcButton onClick={() => performOperation("+")} variant="operator">+</CalcButton>

          <CalcButton onClick={() => inputDigit("0")} span={2}>0</CalcButton>
          <CalcButton onClick={inputDecimal}>.</CalcButton>
          <CalcButton onClick={equals} variant="equals">=</CalcButton>
        </div>
      </div>
    </div>
  )
}
