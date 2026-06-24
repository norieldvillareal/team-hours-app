"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import Navbar from "@/components/Navbar"
import { useRouter } from "next/navigation"

export default function TimesheetPage() {
  const router = useRouter()

  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  )
  const [selectedType, setSelectedType] = useState("All")

  const [message, setMessage] = useState("")
  const [showConfirm, setShowConfirm] = useState(false)

  // ✅ NEW: ADD ENTRY STATES
  const [date, setDate] = useState("")
  const [hours, setHours] = useState("")
  const [type, setType] = useState("")
  const [notes, setNotes] = useState("")

  const allowedUsers: Record<string, string> = {
    "nvillareal@pingala.eu": "Noriel Villareal",
    "norieldvillareal@gmail.com": "Noriel GMAIL",
  }

  const getCategory = (type: string) => {
    if (!type) return ""
    if (type === "Night Shift") return "Night OT"
    if (type.includes("Weekend")) return "Weekend OT"
    if (type.includes("Holiday")) return "Holiday OT"
    return "Weekday OT"
  }

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      const email = data.user?.email

      if (!email || !allowedUsers[email]) {
        router.push("/login")
        return
      }

      setUser(data.user)
      fetchEntries(email)
    }

    getUser()
  }, [selectedMonth, selectedType])

  const fetchEntries = async (email: string) => {
    setLoading(true)

    const userName = allowedUsers[email]

    let query = supabase
      .from("time_entries")
      .select("*")
      .eq("name", userName)

    if (selectedMonth) {
      const startDate = `${selectedMonth}-01`
      const lastDay = new Date(
        new Date(selectedMonth + "-01").getFullYear(),
        new Date(selectedMonth + "-01").getMonth() + 1,
        0
      ).getDate()
      const endDate = `${selectedMonth}-${lastDay}`

      query = query.gte("date", startDate).lte("date", endDate)
    }

    if (selectedType !== "All") {
      query = query.eq("type", selectedType)
    }

    const { data } = await query.order("date", { ascending: true })

    setEntries(data || [])
    setLoading(false)
  }

  // ✅ ✅ ADD ENTRY WITH DUPLICATE CHECK
  const handleAddEntry = async () => {
    setMessage("")

    const userName = allowedUsers[user.email]

    if (!date || !hours || !type) {
      setMessage("Please fill all required fields.")
      return
    }

    if (Number(hours) > 24) {
      setMessage("Hours cannot exceed 24.")
      return
    }

    // ✅ DUPLICATE CHECK
    const { data: existing } = await supabase
      .from("time_entries")
      .select("*")
      .eq("name", userName)
      .eq("date", date)
      .eq("type", type)

    if (existing && existing.length > 0) {
      setMessage("❌ Duplicate entry exists.")
      return
    }

    const { error } = await supabase.from("time_entries").insert([
      {
        name: userName,
        date,
        hours: Number(hours),
        type,
        notes,
      },
    ])

    if (error) {
      if (error.code === "23505") {
        setMessage("❌ Duplicate entry (DB).")
      } else {
        setMessage("❌ Failed to save.")
      }
      return
    }

    setMessage("✅ Entry added")

    setDate("")
    setHours("")
    setType("")
    setNotes("")

    fetchEntries(user.email)
  }

  const totalHours = entries.reduce(
    (sum, entry) => sum + Number(entry.hours || 0),
    0
  )

  if (loading) {
    return <div className="min-h-screen bg-[#c6dbdc]" />
  }

  return (
    <div className="min-h-screen bg-[#c6dbdc] text-black">
      <Navbar />

      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white p-6 rounded-xl shadow-xl border">

          <h1 className="text-2xl font-semibold mb-4">
            My Overtime
          </h1>

          {/* ✅ ADD ENTRY FORM */}
          <div className="mb-6 grid grid-cols-5 gap-2">

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded-lg p-2"
            />

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="border rounded-lg p-2"
            >
              <option value="">Type</option>
              <option value="Pre-Shift">Pre-Shift</option>
              <option value="Post-Shift">Post-Shift</option>
              <option value="Night Shift">Night Shift</option>
              <option value="Weekend HC">Weekend HC</option>
              <option value="Weekend Shift">Weekend Shift</option>
              <option value="Weekend Release">Weekend Release</option>
              <option value="Weekend Patching">Weekend Patching</option>
              <option value="Holiday Shift">Holiday Shift</option>
            </select>

            <input
              type="number"
              placeholder="Hours"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="border rounded-lg p-2"
            />

            <input
              placeholder="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border rounded-lg p-2"
            />

            <button
              onClick={handleAddEntry}
              className="bg-[#40948d] text-white rounded-lg"
            >
              Add
            </button>

          </div>

          {/* ✅ TOTAL */}
          <div className="mb-4 text-lg">
            Total Hours: <strong>{totalHours}</strong>
          </div>

          {/* ✅ TABLE */}
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Date</th>
                <th className="p-2">Type</th>
                <th className="p-2">Hours</th>
                <th className="p-2">Notes</th>
              </tr>
            </thead>

            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-t">
                  <td className="p-2">{entry.date}</td>
                  <td className="p-2">{entry.type}</td>
                  <td className="p-2">{entry.hours}</td>
                  <td className="p-2">{entry.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {message && (
            <p className="text-sm mt-3 text-center">{message}</p>
          )}

        </div>
      </div>
    </div>
  )
}