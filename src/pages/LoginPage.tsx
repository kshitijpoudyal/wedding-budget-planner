import { useState, type FormEvent } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { useNavigate } from "react-router-dom"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Invalid email or password",
  "auth/user-not-found": "No account found with this email",
  "auth/wrong-password": "Invalid email or password",
  "auth/too-many-requests": "Too many attempts. Please try again later",
  "auth/invalid-email": "Invalid email address",
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("test1@gmail.com")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate("/budget", { replace: true })
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ""
      setError(ERROR_MESSAGES[code] || "Sign in failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl bg-card p-6 shadow-[0_20px_40px_rgba(128,82,83,0.06)] dark:shadow-none dark:bg-surface-container-low space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Wedding Planner</h1>
          <p className="text-sm text-muted-foreground">Sign in to manage your budget</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  )
}
