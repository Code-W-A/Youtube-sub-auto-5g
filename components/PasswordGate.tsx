"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const STORAGE_KEY = "app_access_granted"
const PASS = "Cristina1994!"

export function PasswordGate({ children }: { children: React.ReactNode }) {
  const [granted, setGranted] = useState<boolean>(false)
  const [value, setValue] = useState("")
  const [error, setError] = useState<string>("")

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY)
      if (v === "1") setGranted(true)
    } catch {}
  }, [])

  const submit = () => {
    if (value === PASS) {
      try { localStorage.setItem(STORAGE_KEY, "1") } catch {}
      setGranted(true)
      setError("")
    } else {
      setError("Parolă incorectă")
    }
  }

  if (granted) return <>{children}</>

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm border-border">
        <CardHeader>
          <CardTitle className="text-foreground text-center">Acces restricționat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Input
              type="password"
              placeholder="Introdu parola"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            {error && <div className="text-sm text-red-500">{error}</div>}
            <Button className="w-full" onClick={submit}>Intră</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


