import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClientProvider } from "@tanstack/react-query"
import { TooltipProvider } from "@/components/ui/tooltip"
import { queryClient } from "@/lib/queryClient"
import { AppLayout } from "@/components/layout/AppLayout"
import BudgetPage from "@/pages/BudgetPage"

const PeoplePage = lazy(() => import("@/pages/PeoplePage"))
const SummaryPage = lazy(() => import("@/pages/SummaryPage"))
const SettingsPage = lazy(() => import("@/pages/SettingsPage"))

function PageFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-muted-foreground">Loading...</p>
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/budget" replace />} />
              <Route path="/budget" element={<BudgetPage />} />
              <Route path="/people" element={<Suspense fallback={<PageFallback />}><PeoplePage /></Suspense>} />
              <Route path="/summary" element={<Suspense fallback={<PageFallback />}><SummaryPage /></Suspense>} />
              <Route path="/settings" element={<Suspense fallback={<PageFallback />}><SettingsPage /></Suspense>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App
