"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"

export function Newsletter() {
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Newsletter signup:", email)
    setEmail("")
  }

  return (
    <section className="py-16 bg-neutral-900 text-white">
      <div className="container max-w-2xl text-center">
        <Mail className="mx-auto mb-6" size={48} />
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Fique por Dentro
        </h2>
        <p className="text-neutral-300 mb-8">
          Receba novidades, lançamentos e ofertas exclusivas diretamente no seu e-mail.
        </p>
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 px-4 py-2 rounded-md bg-white/10 border border-white/20 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-white"
          />
          <Button type="submit" className="bg-white text-black hover:bg-neutral-200">
            Inscrever
          </Button>
        </form>
      </div>
    </section>
  )
}
