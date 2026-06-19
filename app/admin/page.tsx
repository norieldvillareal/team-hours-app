"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import Navbar from "@/components/Navbar"
import { useRouter } from "next/navigation"

export default function AdminPage() {

  const ADMIN_EMAIL = "nvillareal@pingala.eu"
const router = useRouter()
  const [entries, setEntries] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // ✅ Auth + Admin check
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      const email = data.user?.email

      if (!email) {
        router.push("/login")
        return
      }

      if (email !== ADMIN_EMAIL) {
        alert("❌ Admin access only")
        router.push("/log-hours")
        return
      }

      setUser(data.user)
      fetchEntries()
    }

    checkUser()
  }, [])

  // ✅ Fetch ALL entries (admin only)
  const fetchEntries = async () => {
    const { data, error } = await supabase
      .from("time_entries")
      .select("*")
      .order("date", { ascending: false })

    if (!error) {
      setEntries(data || [])
    }

    setLoading(false)
  }

  // ✅ Loading guard
if (loading) {
  return <div className="min-h-screen bg-[#c6dbdc]" />
}


  return (
    <div className="min-h-screen bg-[#c6dbdc] text-black">
      <Navbar />


      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white p-6 rounded-xl shadow-xl border">

          <h1 className="text-2xl font-semibold mb-4">
            Admin - Team Overview
          </h1>

          {/* ✅ Logged in user */}
          <p className="text-sm mb-4 text-gray-600">
            Logged in as: {user?.email}
          </p>

<div className="mb-4 flex justify-end">
  <button
  onClick={() => {
    // ✅ Header row
    const header = "Date,Name,Type,Hours\n"

    // ✅ Data rows
    const rows = entries
      .map(
        (e) =>
          `${e.date},${e.name},${e.type},${e.hours}`
      )
      .join("\n")

    // ✅ Create file
    const blob = new Blob([header + rows], {
      type: "text/csv;charset=utf-8;",
    })

    const url = URL.createObjectURL(blob)

    // ✅ Download
    const link = document.createElement("a")
    link.href = url
    link.download = `OT_Report_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx` // 👈 looks like Excel
    link.click()
  }}
  className="bg-[#71a3c1] text-white px-4 py-2 rounded-lg hover:opacity-90"
>
  Export Excel
</button>

</div>


          {/* ✅ Table */}
          <table className="w-full text-sm border">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Type</th>
                <th className="p-2 text-left">Hours</th>
              </tr>
            </thead>

            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-t">
                  <td className="p-2">{entry.date}</td>
                  <td className="p-2">{entry.name}</td>
                  <td className="p-2">{entry.type}</td>
                  <td className="p-2">{entry.hours}</td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      </div>
    </div>
  )
}
