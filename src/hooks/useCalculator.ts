import { useState, useEffect } from "react"

export type Operation = "+" | "-" | "×" | "÷" | null

type CalculatorState = {
  display: string
  previousValue: number | null
  operation: Operation
  waitingForOperand: boolean
}

export type HistoryEntry = {
  id: number
  expression: string
  result: string
}

const DEFAULT_STATE: CalculatorState = {
  display: "0",
  previousValue: null,
  operation: null,
  waitingForOperand: false,
}

function readLocalStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function calculate(left: number, right: number, op: Operation): number {
  switch (op) {
    case "+": return left + right
    case "-": return left - right
    case "×": return left * right
    case "÷": return right !== 0 ? left / right : 0
    default: return right
  }
}

export function useCalculator() {
  const [state, setState] = useState<CalculatorState>(() =>
    readLocalStorage("calc_state", DEFAULT_STATE),
  )
  const [history, setHistory] = useState<HistoryEntry[]>(() =>
    readLocalStorage("calc_history", []),
  )

  useEffect(() => {
    localStorage.setItem("calc_state", JSON.stringify(state))
  }, [state])

  useEffect(() => {
    localStorage.setItem("calc_history", JSON.stringify(history))
  }, [history])

  const { display, previousValue, operation, waitingForOperand } = state

  const inputDigit = (digit: string) => {
    setState((s) =>
      s.waitingForOperand
        ? { ...s, display: digit, waitingForOperand: false }
        : { ...s, display: s.display === "0" ? digit : s.display + digit },
    )
  }

  const inputDecimal = () => {
    setState((s) => {
      if (s.waitingForOperand) return { ...s, display: "0.", waitingForOperand: false }
      if (s.display.includes(".")) return s
      return { ...s, display: s.display + "." }
    })
  }

  const clear = () => setState(DEFAULT_STATE)

  const toggleSign = () => {
    setState((s) => ({ ...s, display: String(parseFloat(s.display) * -1) }))
  }

  const percentage = () => {
    setState((s) => ({ ...s, display: String(parseFloat(s.display) / 100) }))
  }

  const performOperation = (nextOperation: Operation) => {
    setState((s) => {
      const inputValue = parseFloat(s.display)
      if (s.previousValue === null) {
        return { ...s, previousValue: inputValue, operation: nextOperation, waitingForOperand: true }
      }
      if (s.operation) {
        const result = calculate(s.previousValue, inputValue, s.operation)
        return {
          display: String(result),
          previousValue: result,
          operation: nextOperation,
          waitingForOperand: true,
        }
      }
      return { ...s, operation: nextOperation, waitingForOperand: true }
    })
  }

  const equals = () => {
    setState((s) => {
      if (s.operation === null || s.previousValue === null) return s
      const inputValue = parseFloat(s.display)
      const result = calculate(s.previousValue, inputValue, s.operation)
      const resultStr = String(result)
      const entry: HistoryEntry = {
        id: Date.now(),
        expression: `${s.previousValue} ${s.operation} ${inputValue}`,
        result: resultStr,
      }
      setHistory((h) => [entry, ...h].slice(0, 50))
      return { display: resultStr, previousValue: null, operation: null, waitingForOperand: true }
    })
  }

  const formatDisplay = (value: string): string => {
    const num = parseFloat(value)
    if (isNaN(num)) return "0"
    if (Math.abs(num) > 999999999999 || (Math.abs(num) < 0.000001 && num !== 0)) {
      return num.toExponential(6)
    }
    if (value.includes(".") && !value.endsWith(".")) {
      const parts = value.split(".")
      if (parts[1].length > 8) {
        return num.toFixed(8).replace(/\.?0+$/, "")
      }
    }
    return value
  }

  const clearHistory = () => setHistory([])

  return {
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
  }
}
