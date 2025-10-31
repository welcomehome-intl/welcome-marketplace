"use client"

import { ReactNode } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { TransactionToastContainer } from "../ui/transaction-status"
import { TransactionCacheProvider } from "../web3/transaction-cache-provider"
import { PageTransition } from "./page-transition"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <TransactionCacheProvider>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <Header />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
        </div>

        {/* Transaction Status Toasts */}
        <TransactionToastContainer />
      </div>
    </TransactionCacheProvider>
  )
}