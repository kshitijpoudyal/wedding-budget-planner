import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClientProvider } from "@tanstack/react-query"
import { TooltipProvider } from "@/components/ui/tooltip"
import { queryClient } from "@/lib/queryClient"
import { AuthProvider } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { AppLayout } from "@/components/layout/AppLayout"
import BudgetPage from "@/pages/BudgetPage"
import LoginPage from "@/pages/LoginPage"

const SummaryPage = lazy(() => import("@/pages/SummaryPage"))
const SettingsPage = lazy(() => import("@/pages/SettingsPage"))
const CalculatorPage = lazy(() => import("@/pages/CalculatorPage"))

function PageFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-muted-foreground">Loading...</p>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Navigate to="/budget" replace />} />
                  <Route path="/budget" element={<BudgetPage />} />
                  <Route path="/summary" element={<Suspense fallback={<PageFallback />}><SummaryPage /></Suspense>} />
                  <Route path="/calculator" element={<Suspense fallback={<PageFallback />}><CalculatorPage /></Suspense>} />
                  <Route path="/settings" element={<Suspense fallback={<PageFallback />}><SettingsPage /></Suspense>} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
