import { BrowserRouter, Routes, Route } from "react-router-dom"
import QuizApp from "@/pages/QuizApp"
import Login from "@/pages/admin/Login"
import Dashboard from "@/pages/admin/Dashboard"
import QuestionForm from "@/pages/admin/QuestionForm"
import AiImport from "@/pages/admin/AiImport"
import ErrorBoundary from "@/components/ErrorBoundary"

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<QuizApp />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/new" element={<QuestionForm />} />
          <Route path="/admin/edit/:id" element={<QuestionForm />} />
          <Route path="/admin/ai-import" element={<AiImport />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
