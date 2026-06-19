"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
    })

    if (error) {
      setMessage("❌ Error sending email")
    } else {
      setMessage("✅ Check your email for login link")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#c6dbdc]">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">

        <h1 className="text-xl font-semibold mb-4">
          Login
        </h1>

        <input
          type="email"
          placeholder="Enter your email"
          className="border border-gray-300 rounded-lg p-2 w-full mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-[#71a3c1] text-white py-2 rounded-lg"
        >
          Send Login Link
        </button>

        {message && (
          <p className="mt-3 text-sm text-gray-600">
            {message}
          </p>
        )}

      </div>
    </div>
  )
}
