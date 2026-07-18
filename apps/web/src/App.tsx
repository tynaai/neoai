import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'

import { AdvisorHeader } from '~/components/advisor/advisor-header'
import { RealChatPanel } from '~/components/advisor/real-chat-panel'
import { RealResultsPanel } from '~/components/advisor/real-results-panel'
import type { AdvisorResponse } from '~/lib/advisor-api'
import { ForgotPasswordPage, LoginPage, ProtectedRoute, RegisterPage } from './auth'

function AdvisorApp() {
  const [response, setResponse] = useState<AdvisorResponse | null>(null)

  return (
    <div className="flex min-h-svh flex-col bg-muted/40">
      <AdvisorHeader />
      <main className="flex-1">
        <div className="grid w-full gap-0 lg:grid-cols-[440px_minmax(0,1fr)] xl:grid-cols-[500px_minmax(0,1fr)] 2xl:grid-cols-[540px_minmax(0,1fr)]">
          <div className="h-[560px] border-b bg-card lg:sticky lg:top-16 lg:h-[calc(100svh-64px)] lg:self-start lg:border-r lg:border-b-0">
            <RealChatPanel onResponse={setResponse} />
          </div>
          <div className="flex min-w-0 flex-col gap-5 px-3 py-4 sm:px-5 lg:px-6 lg:py-6">
            <RealResultsPanel response={response} />
          </div>
        </div>
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route element={<AdvisorApp />} path="/" />
        </Route>
        <Route element={<LoginPage />} path="/login" />
        <Route element={<RegisterPage />} path="/register" />
        <Route element={<ForgotPasswordPage />} path="/forgot-password" />
      </Routes>
    </BrowserRouter>
  )
}

export default App
