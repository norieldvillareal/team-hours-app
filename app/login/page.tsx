"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  const inputRef = useRef<HTMLInputElement>(null)

  // ✅ Auto-focus email field
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleLogin = async () => {
    setMessage("")

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          process.env.NODE_ENV === "development"
            ? "http://localhost:3000/log-hours"
            : "https://team-hours-app.vercel.app/log-hours",
      },
    })

    if (error) {
      setMessage("❌ Unable to send login link")
    } else {
      setMessage("✅ Check your email for login link")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#c6dbdc]">

      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md text-center">

        {/* ✅ LOGO (CIRCLE) */}
        <img
          src="/logo.jpg"
          alt="Company Logo"
          className="w-20 h-20 rounded-full object-cover border-2 border-[#40948d] mx-auto mb-4"
        />

        <h1 className="text-2xl font-semibold mb-2 text-gray-800">
          Overtime Hours
        </h1>

        <p className="text-sm text-gray-600 mb-6">
          Login using your work email
        </p>

        {/* ✅ INPUT (READABLE + AUTOFOCUS) */}
        <input
          ref={inputRef}
          type="email"
          placeholder="yourname@pingala.eu"
          className="w-full border border-gray-300 rounded-lg p-3 mb-4 text-black placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#40948d]"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-[#40948d] text-white py-3 rounded-lg hover:opacity-90 transition"
        >
          Send Login Link
        </button>

        {message && (
          <p className="mt-4 text-sm text-gray-700">
            {message}
          </p>
        )}

      </div>
    </div>
  )
}
