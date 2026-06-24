"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import Navbar from "@/components/Navbar"
import { useRouter } from "next/navigation"

export default function AddEntryPage() {
const router = useRouter()
  // ✅ Allowed users
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

  // ✅ States
  const [date, setDate] = useState("")
  const [hours, setHours] = useState("")
  const [type, setType] = useState("")
  const [notes, setNotes] = useState("")
  const [message, setMessage] = useState("")
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // ✅ Ensure session is initialized
  useEffect(() => {
    const handleSession = async () => {
      await supabase.auth.getSession()
    }
    handleSession()
  }, [])

  // ✅ Auth + Access Control
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      const email = data.user?.email

      if (!email) {
        router.push("/login")
        return
      }

      if (!allowedUsers[email]) {
        alert("❌ You are not authorized to access this app.")
        router.push("/login")
        return
      }

      setUser(data.user)
      setLoading(false)
    }

    getUser()
  }, [])

  // ✅ Submit
  const handleSubmit = async () => {
  setMessage("")

  if (!user) {
    setMessage("❌ Please login first.")
    return
  }

  if (!date || !hours || !type) {
    setMessage("Please fill all required fields.")
    return
  }

if (Number(hours) >= 24) {
  setMessage("❌ Hours must be less than 24.")
  return
}

  const userName = allowedUsers[user.email]

  // ✅ ✅ DUPLICATE CHECK (NEW)
  const { data: existing } = await supabase
    .from("time_entries")
    .select("*")
    .eq("name", userName)
    .eq("date", date)
    .eq("type", type)

  if (existing && existing.length > 0) {
    setMessage("❌ Duplicate entry. This Date and OT Type already exists.")
    return
  }

  // ✅ INSERT (unchanged)
  const { error } = await supabase
    .from("time_entries")
    .insert([
      {
        name: allowedUsers[user.email],
        date,
        hours: Number(hours),
        type,
        notes,
      },
    ])

  if (error) {
    console.error(error)
    setMessage("❌ Failed to save entry.")
    return
  }

  setMessage("✅ Entry saved successfully.")

  // ✅ Reset form
  setDate("")
  setHours("")
  setType("")
  setNotes("")
}


if (loading) {
  return <div className="min-h-screen bg-[#c6dbdc]" />
}


  return (
    <div className="min-h-screen bg-[#c6dbdc] text-black">
      <Navbar />

      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white p-6 rounded-xl shadow-xl border">

          <h1 className="text-2xl font-semibold mb-2">
            File Overtime
          </h1>

          <p className="text-sm text-gray-700 mb-2">
            Add your work hours for a specific day.
            <br></br>
          </p>

          <p className="text-sm mb-4 text-gray-600">
            Logged in as: {allowedUsers[user.email]}
          </p>

          {/* ✅ Date */}
          <input
            type="date"
            className="w-full border rounded-lg p-2 mb-3"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          {/* ✅ Type */}
          <select
            className="w-full border rounded-lg p-2 mb-3"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">Select OT Type</option>
            <option value="Pre-Shift">Pre-Shift</option>
            <option value="Post-Shift">Post-Shift</option>
            <option value="Night Shift">Night Shift</option>
            <option value="Weekend HC">Weekend HC</option>
            <option value="Weekend Shift">Weekend Shift</option>
            <option value="Weekend Release">Weekend Release</option>
            <option value="Weekend Patching">Weekend Patching</option>
            <option value="Holiday Shift">Holiday Shift</option>
          </select>

          {/* ✅ Hours */}
          <input
            type="number"
            placeholder="OT Hours"
            className="w-full border rounded-lg p-2 mb-3"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
          />

          {/* ✅ Notes */}
          <textarea
            className="w-full border rounded-lg p-2 mb-3"
            placeholder="Notes (Optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {/* ✅ Button */}
          <button
            onClick={handleSubmit}
            className="w-full bg-[#71a3c1] text-white py-2 rounded-lg hover:opacity-90"
          >
            Add Entry
          </button>

          {/* ✅ Message */}
          {message && (
            <p className="text-sm mt-3 text-center">
              {message}
            </p>
          )}

        </div>
      </div>
    </div>
  )
}
