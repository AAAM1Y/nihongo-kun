import { useState } from "react"
import { Button } from "@/components/ui/button"
import { getDataSource, setDataSource } from "@/lib/dataAdapter"

export default function DataToggle() {
  const [src, setSrc] = useState(getDataSource())
  const toggle = () => {
    const next = src === "supabase" ? "local" : "supabase"
    setDataSource(next)
    setSrc(next)
  }
  return (
    <Button variant="outline" size="sm" onClick={toggle} title={src === "supabase" ? "当前：服务器题库" : "当前：本地题库"}>
      {src === "supabase" ? "服务器" : "本地"}
    </Button>
  )
}
