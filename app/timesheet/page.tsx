"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import Navbar from "@/components/Navbar"

export default function TimesheetPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  )
  const [selectedType, setSelectedType] = useState("All")
  const [message, setMessage] = useState("")
  const [showConfirm, setShowConfirm] = useState(false)

  // ✅ SAME mapping as log-hours
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
  }

  // ✅ AUTH FIRST
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      const email = data.user?.email

      if (!email) {
        window.location.href = "/login"
        return
      }

      if (!allowedUsers[email]) {
        alert("❌ You are not authorized")
        window.location.href = "/login"
        return
      }

      setUser(data.user)
      fetchEntries(email)
    }

    getUser()
  }, [selectedMonth, selectedType])

  // ✅ FILTER BY USER (THIS IS THE FIX)
const fetchEntries = async (email: string) => {
  setLoading(true)

  const userName = allowedUsers[email]

  // ✅ ADD THESE BACK
  const startDate = `${selectedMonth}-01`

  const lastDay = new Date(
    new Date(selectedMonth + "-01").getFullYear(),
    new Date(selectedMonth + "-01").getMonth() + 1,
    0
  ).getDate()

  const endDate = `${selectedMonth}-${lastDay}`

  // ✅ QUERY
  let query = supabase
    .from("time_entries")
    .select("*")
    .eq("name", userName)
    .gte("date", startDate)
    .lte("date", endDate)

  if (selectedType !== "All") {
    query = query.eq("type", selectedType)
  }

  const { data, error } = await query.order("date", {
    ascending: false,
  })

  if (!error) {
    setEntries(data || [])
  }

  setLoading(false)
}


  const totalHours = entries.reduce(
    (sum, entry) => sum + (Number(entry.hours) || 0),
    0
  )

  const isSubmitted =
    entries.length > 0 &&
    entries.every((entry) => entry.status === "Submitted")

  const handleSubmitTimesheet = async () => {
    const userName = allowedUsers[user.email]

    const startDate = `${selectedMonth}-01`

    const lastDay = new Date(
      new Date(selectedMonth + "-01").getFullYear(),
      new Date(selectedMonth + "-01").getMonth() + 1,
      0
    ).getDate()

    const endDate = `${selectedMonth}-${lastDay}`

    const { error } = await supabase
      .from("time_entries")
      .update({ status: "Submitted" })
      .eq("name", userName)
      .gte("date", startDate)
      .lte("date", endDate)

    if (error) {
      setMessage("❌ Failed to submit OT hours")
    } else {
      setMessage("✅ OT hours submitted")
      fetchEntries(user.email)
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-[#c6dbdc] text-black">
      <Navbar />

      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white p-6 rounded-xl shadow-xl border">

          <h1 className="text-2xl font-semibold mb-4">
            My Overtime Hours
          </h1>

          <p className="text-sm mb-4 text-gray-600">
            Logged in as: {allowedUsers[user.email]}
          </p>

          <div className="mb-4">
            Total Hours: <strong>{totalHours}</strong>
          </div>

          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Type</th>
                <th className="p-2 text-left">Hours</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Notes</th>
              </tr>
            </thead>

            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-t">
                  <td className="p-2">{entry.date}</td>
                  <td className="p-2">{entry.type}</td>
                  <td className="p-2">{entry.hours}</td>
                  <td className="p-2">{entry.status || "Draft"}</td>
                  <td className="p-2">{entry.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      </div>
    </div>
  )
}
