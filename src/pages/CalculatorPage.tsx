import { useState } from "react"
import { SectionHeading } from "@/components/ui/section-heading"
import { cn } from "@/lib/utils"

type Operation = "+" | "-" | "×" | "÷" | null

function CalcButton({
  children,
  onClick,
  variant = "default",
  span = 1,
}: {
  children: React.ReactNode
  onClick: () => void
  variant?: "default" | "operator" | "function" | "equals"
  span?: number
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-xl md:rounded-2xl text-xl md:text-2xl font-medium transition-all duration-200 active:scale-95",
        "flex items-center justify-center select-none",
        "h-14 md:h-16",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        variant === "default" && "bg-surface-container hover:bg-surface-container-high text-foreground",
        variant === "operator" && "bg-primary/15 hover:bg-primary/25 text-primary font-semibold",
        variant === "function" && "bg-secondary/15 hover:bg-secondary/25 text-secondary",
        variant === "equals" && "bg-primary hover:bg-primary/90 text-white font-semibold",
        span === 2 && "col-span-2",
      )}
    >
      {children}
    </button>
  )
}

export default function CalculatorPage() {
  const [display, setDisplay] = useState("0")
  const [previousValue, setPreviousValue] = useState<number | null>(null)
  const [operation, setOperation] = useState<Operation>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit)
      setWaitingForOperand(false)
    } else {
      setDisplay(display === "0" ? digit : display + digit)
    }
  }

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay("0.")
      setWaitingForOperand(false)
      return
    }
    if (!display.includes(".")) {
      setDisplay(display + ".")
    }
  }

  const clear = () => {
    setDisplay("0")
    setPreviousValue(null)
    setOperation(null)
    setWaitingForOperand(false)
  }

  const toggleSign = () => {
    const value = parseFloat(display)
    setDisplay(String(value * -1))
  }

  const percentage = () => {
    const value = parseFloat(display)
    setDisplay(String(value / 100))
  }

  const performOperation = (nextOperation: Operation) => {
    const inputValue = parseFloat(display)

    if (previousValue === null) {
      setPreviousValue(inputValue)
    } else if (operation) {
      const result = calculate(previousValue, inputValue, operation)
      setDisplay(String(result))
      setPreviousValue(result)
    }

    setWaitingForOperand(true)
    setOperation(nextOperation)
  }

  const calculate = (left: number, right: number, op: Operation): number => {
    switch (op) {
      case "+":
        return left + right
      case "-":
        return left - right
      case "×":
        return left * right
      case "÷":
        return right !== 0 ? left / right : 0
      default:
        return right
    }
  }

  const equals = () => {
    if (operation === null || previousValue === null) return

    const inputValue = parseFloat(display)
    const result = calculate(previousValue, inputValue, operation)
    
    setDisplay(String(result))
    setPreviousValue(null)
    setOperation(null)
    setWaitingForOperand(true)
  }

  const formatDisplay = (value: string): string => {
    const num = parseFloat(value)
    if (isNaN(num)) return "0"
    
    // Handle very large or very small numbers
    if (Math.abs(num) > 999999999999 || (Math.abs(num) < 0.000001 && num !== 0)) {
      return num.toExponential(6)
    }
    
    // Limit decimal places for display
    if (value.includes(".") && !value.endsWith(".")) {
      const parts = value.split(".")
      if (parts[1].length > 8) {
        return num.toFixed(8).replace(/\.?0+$/, "")
      }
    }
    
    return value
  }

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
          {/* Row 1 */}
          <CalcButton onClick={clear} variant="function">C</CalcButton>
          <CalcButton onClick={toggleSign} variant="function">±</CalcButton>
          <CalcButton onClick={percentage} variant="function">%</CalcButton>
          <CalcButton onClick={() => performOperation("÷")} variant="operator">÷</CalcButton>

          {/* Row 2 */}
          <CalcButton onClick={() => inputDigit("7")}>7</CalcButton>
          <CalcButton onClick={() => inputDigit("8")}>8</CalcButton>
          <CalcButton onClick={() => inputDigit("9")}>9</CalcButton>
          <CalcButton onClick={() => performOperation("×")} variant="operator">×</CalcButton>

          {/* Row 3 */}
          <CalcButton onClick={() => inputDigit("4")}>4</CalcButton>
          <CalcButton onClick={() => inputDigit("5")}>5</CalcButton>
          <CalcButton onClick={() => inputDigit("6")}>6</CalcButton>
          <CalcButton onClick={() => performOperation("-")} variant="operator">−</CalcButton>

          {/* Row 4 */}
          <CalcButton onClick={() => inputDigit("1")}>1</CalcButton>
          <CalcButton onClick={() => inputDigit("2")}>2</CalcButton>
          <CalcButton onClick={() => inputDigit("3")}>3</CalcButton>
          <CalcButton onClick={() => performOperation("+")} variant="operator">+</CalcButton>

          {/* Row 5 */}
          <CalcButton onClick={() => inputDigit("0")} span={2}>0</CalcButton>
          <CalcButton onClick={inputDecimal}>.</CalcButton>
          <CalcButton onClick={equals} variant="equals">=</CalcButton>
        </div>
      </div>
    </div>
  )
}
