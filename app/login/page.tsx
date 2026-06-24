"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

// ✅ allowed users OUTSIDE component (correct)
const allowedUsers: Record<string, string> = {
  "socciano@pingala.eu": "Sarah Ammon Occiano",
  "rjavier@pingala.eu": "Romilyn Joy Javier",
  "dvillanueva@pingala.eu": "Diane Villanueva",
  "kquilay@pingala.eu": "Kinverly Rhazmen Quilay",
  "ksaquing@pingala.eu": "Krizza Fatima Saquing",
  "nabesamis@pingala.eu": "Niel Joseph Abesamis",
  "ffaruqui@pingala.eu": "Faraz Faruqui",
  "jcruz@pingala.eu": "Joyce Monica Cruz",
  "athomas@pingala.eu": "Anu Thomas",
  "hgadepalli@pingala.eu": "Harshil Gadepalli",
  "skrishnan@pingala.eu": "Sagar Krishnan",
  "rgogineni@pingala.eu": "Rahul Gogineni",
  "polarte@pingala.eu": "Patricia Olarte",
  "cmartinez@pingala.eu": "Cleive Martinez",
  "rlata@pingala.eu": "Rosemarie Elaine Lata",
  "rvelasco@pingala.eu": "Richard Mon Velasco",
  "nvillareal@pingala.eu": "Noriel Villareal",
  "norieldvillareal@gmail.com": "Noriel GMAIL",
}

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  // ✅ filteredUsers INSIDE component (fix)
  const filteredUsers = Object.entries(allowedUsers).filter(
    ([emailKey, name]) =>
      emailKey.toLowerCase().includes(email.toLowerCase()) ||
      name.toLowerCase().includes(email.toLowerCase())
  )

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser()

      if (data.user) {
        router.push("/log-hours")
      } else {
        setLoading(false)
        inputRef.current?.focus()
      }
    }

    init()
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

  if (loading) {
    return <div className="min-h-screen bg-[#c6dbdc]" />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#c6dbdc]">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md text-center">

        <img
          src="/logo.jpg"
          alt="Company Logo"
          className="w-20 h-20 rounded-full object-cover border-2 border-[#40948d] mx-auto mb-4"
        />

        <h1 className="text-2xl font-semibold mb-2 text-gray-800">
          Overtime App
        </h1>

        <p className="text-sm text-gray-600 mb-6">
          Login using your work email
        </p>

        {/* ✅ INPUT */}
        <input
          ref={inputRef}
          type="text"
          autoComplete="off"
          placeholder="flastname@pingala.eu"
          className="w-full border border-gray-300 rounded-lg p-3 mb-1 text-black placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#40948d]"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setShowSuggestions(true)
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />

        {/* ✅ DROPDOWN */}
        {showSuggestions && email && (
          <div className="w-full bg-white border border-gray-200 rounded-lg shadow-md max-h-40 overflow-y-auto mb-3 text-left">

            {filteredUsers.length > 0 ? (
              filteredUsers.map(([emailKey, name]) => (
                <div
                  key={emailKey}
                  onClick={() => {
                    setEmail(emailKey)
                    setShowSuggestions(false)
                  }}
                  className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                >
                  <div className="font-medium text-gray-800">{name}</div>
                  <div className="text-gray-500 text-xs">{emailKey}</div>
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-400 text-sm">
                No matches found
              </div>
            )}

          </div>
        )}

        <button
          onClick={handleLogin}
          className="w-full bg-[#40948d] text-white py-3 rounded-lg hover:opacity-90"
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