"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import Navbar from "@/components/Navbar"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const [sortColumn, setSortColumn] = useState("")
  const [sortDirection, setSortDirection] = useState("asc")
  const ADMIN_EMAIL = "nvillareal@pingala.eu"
  const router = useRouter()

  const handleSort = (column: string) => {
  if (sortColumn === column) {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
  } else {
    setSortColumn(column)
    setSortDirection("asc")
  }
}

  const sortEntries = (data: any[]) => {
  if (!sortColumn) return data

  return [...data].sort((a, b) => {
    let valA = a[sortColumn]
    let valB = b[sortColumn]

    if (sortColumn === "hours") {
      valA = Number(valA)
      valB = Number(valB)
    }

    if (valA < valB) return sortDirection === "asc" ? -1 : 1
    if (valA > valB) return sortDirection === "asc" ? 1 : -1
    return 0
  })
}

  const [entries, setEntries] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // ✅ FILTER STATES (ADDED)
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  )
  const [selectedType, setSelectedType] = useState("All")

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
  }, [selectedMonth, selectedType]) // ✅ IMPORTANT

  // ✅ Fetch entries WITH FILTERS
  const fetchEntries = async () => {

    const startDate = `${selectedMonth}-01`

    const lastDay = new Date(
      new Date(selectedMonth + "-01").getFullYear(),
      new Date(selectedMonth + "-01").getMonth() + 1,
      0
    ).getDate()

    const endDate = `${selectedMonth}-${lastDay}`

let query = supabase
  .from("time_entries")
  .select("*")

// ✅ ONLY apply date filter if month is selected
if (selectedMonth) {
  const startDate = `${selectedMonth}-01`

  const lastDay = new Date(
    new Date(selectedMonth + "-01").getFullYear(),
    new Date(selectedMonth + "-01").getMonth() + 1,
    0
  ).getDate()

  const endDate = `${selectedMonth}-${lastDay}`

  query = query
    .gte("date", startDate)
    .lte("date", endDate)
}


    if (selectedType !== "All") {
      query = query.eq("type", selectedType)
    }

    const { data } = await query.order("date", { ascending: false })

    setEntries(sortEntries(data || []))
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

          <p className="text-sm mb-4 text-gray-600">
            Logged in as: {user?.email}
          </p>

          {/* ✅ FILTERS (ADDED BACK) */}
          <div className="mb-4 grid grid-cols-2 gap-3">

            <div>
              <label className="block text-sm mb-1">Month</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full border rounded-lg p-2"
              >
                <option value="All">All</option>
                <option value="Pre-Shift">Pre-Shift</option>
                <option value="Post-Shift">Post-Shift</option>
                <option value="Night Shift">Night Shift</option>
                <option value="Weekend HC">Weekend HC</option>
                <option value="Weekend Shift">Weekend Shift</option>
                <option value="Weekend Release">Weekend Release</option>
                <option value="Weekend Patching">Weekend Patching</option>
                <option value="Holiday Shift">Holiday Shift</option>
              </select>
            </div>

          </div>

          {/* ✅ REAL EXCEL EXPORT (FIXED) */}
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => {

                const rows = entries.map(e => `
                  <Row>
                    <Cell><Data ss:Type="String">${e.date}</Data></Cell>
                    <Cell><Data ss:Type="String">${e.name}</Data></Cell>
                    <Cell><Data ss:Type="String">${e.type}</Data></Cell>
                    <Cell><Data ss:Type="Number">${e.hours}</Data></Cell>
                  </Row>
                `).join("")

                const xml = `
                  <?xml version="1.0"?>
                  <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
                    xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
                    <Worksheet ss:Name="OT Report">
                      <Table>

                        <Row>
                          <Cell><Data ss:Type="String">Date</Data></Cell>
                          <Cell><Data ss:Type="String">Name</Data></Cell>
                          <Cell><Data ss:Type="String">Type</Data></Cell>
                          <Cell><Data ss:Type="String">Hours</Data></Cell>
                        </Row>

                        ${rows}

                      </Table>
                    </Worksheet>
                  </Workbook>
                `

                const blob = new Blob([xml], {
                  type: "application/vnd.ms-excel",
                })

                const url = URL.createObjectURL(blob)

                const link = document.createElement("a")
                link.href = url
                link.download = `OT_Report_${new Date()
                  .toISOString()
                  .slice(0, 10)}.xls`
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
    <th className="p-2 cursor-pointer" onClick={() => handleSort("date")}>
      Date ⬍
    </th>
    <th className="p-2 cursor-pointer" onClick={() => handleSort("date")}>
      Name ⬍
    </th>

    <th className="p-2 cursor-pointer" onClick={() => handleSort("date")}>
      Type ⬍
    </th>
    <th className="p-2 cursor-pointer" onClick={() => handleSort("date")}>
      Hours ⬍
    </th>
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