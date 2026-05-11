import { Component, type ReactNode } from "react"
import { Button } from "@/components/ui/button"

interface Props { children: ReactNode }
interface State { hasError: boolean }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State { return { hasError: true } }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center space-y-4 max-w-sm">
            <h1 className="text-xl font-bold">页面出了点问题</h1>
            <p className="text-sm text-muted-foreground">可能是网络波动或数据异常，请重试</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => { window.location.href = "/" }}>返回首页</Button>
              <Button onClick={() => { this.setState({ hasError: false }) }}>刷新重试</Button>
            </div>
          </div>
        </main>
      )
    }
    return this.props.children
  }
}
