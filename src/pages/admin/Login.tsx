import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"

const ADMIN_KEY = "nihongo-kun-admin"

export default function Login() {
  const [pw, setPw] = useState("")
  const [err, setErr] = useState("")
  const nav = useNavigate()

  const handleLogin = () => {
    if (pw === (import.meta.env.VITE_ADMIN_PASSWORD || "admin123")) {
      sessionStorage.setItem(ADMIN_KEY, "1")
      nav("/admin")
    } else {
      setErr("密码错误")
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold text-center">管理员登录</h1>
        <input
          type="password"
          value={pw}
          onChange={e => { setPw(e.target.value); setErr("") }}
          onKeyDown={e => e.key === "Enter" && handleLogin()}
          placeholder="输入管理员密码"
          className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        {err && <p className="text-sm text-destructive">{err}</p>}
        <Button className="w-full" onClick={handleLogin}>登录</Button>
      </div>
    </main>
  )
}

export function useAdminAuth() {
  return sessionStorage.getItem(ADMIN_KEY) === "1"
}
