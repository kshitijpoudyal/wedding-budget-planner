import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/lib/queryClient"
import BudgetPage from "@/pages/BudgetPage"
import PeoplePage from "@/pages/PeoplePage"
import SummaryPage from "@/pages/SummaryPage"
import SettingsPage from "@/pages/SettingsPage"

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/budget" replace />} />
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/people" element={<PeoplePage />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
