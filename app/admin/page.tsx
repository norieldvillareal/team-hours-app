"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import Navbar from "@/components/Navbar"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const [sortColumn, setSortColumn] = useState("date")
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
      let valA = Number(a[sortColumn])
      let valB = Number(b[sortColumn])

      if (valA < valB) return sortDirection === "asc" ? -1 : 1
      if (valA > valB) return sortDirection === "asc" ? 1 : -1
      return 0
    })
  }

  const [entries, setEntries] = useState<any[]>([])
  const [rawEntries, setRawEntries] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  )
  const [selectedType, setSelectedType] = useState("All")

  // ✅ NEW NAME FILTER
  const [selectedName, setSelectedName] = useState("All")

  const getCategory = (type: string) => {
    if (!type) return ""
    if (type === "Night Shift") return "Night OT"
    if (type.includes("Weekend")) return "Weekend OT"
    if (type.includes("Holiday")) return "Holiday OT"
    return "Weekday OT"
  }

  const summarizeEntries = (data: any[]) => {
    const result: any = {}

    data.forEach((entry) => {
      const name = entry.name

      if (!result[name]) {
        result[name] = {
          name,
          weekday: 0,
          night: 0,
          weekend: 0,
          holiday: 0,
        }
      }

      const hours = Number(entry.hours) || 0

      if (entry.type === "Night Shift") {
        result[name].night += hours
      } else if (entry.type.includes("Weekend")) {
        result[name].weekend += hours
      } else if (entry.type.includes("Holiday")) {
        result[name].holiday += hours
      } else {
        result[name].weekday += hours
      }
    })

    return Object.values(result)
  }

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
  }, [selectedMonth, selectedType, selectedName]) // ✅ UPDATED

  useEffect(() => {
    setEntries((prev) => sortEntries(prev))
  }, [sortColumn, sortDirection])

  const fetchEntries = async () => {
    let query = supabase.from("time_entries").select("*")

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

    let filteredData = data || []

    // ✅ NAME FILTER
    if (selectedName !== "All") {
      filteredData = filteredData.filter(
        (entry) => entry.name === selectedName
      )
    }

    setRawEntries(filteredData)

    const summarized = summarizeEntries(filteredData)

    setEntries(sortEntries(summarized))
    setLoading(false)
  }

  if (loading) {
    return <div className="min-h-screen bg-[#c6dbdc]" />
  }

  const totalWeekday = entries.reduce((sum, e) => sum + e.weekday, 0)
  const totalNight = entries.reduce((sum, e) => sum + e.night, 0)
  const totalWeekend = entries.reduce((sum, e) => sum + e.weekend, 0)
  const totalHoliday = entries.reduce((sum, e) => sum + e.holiday, 0)
  const totalHours = totalWeekday + totalNight + totalWeekend + totalHoliday

  return (
    <div className="min-h-screen bg-[#c6dbdc] text-black">
      <Navbar />

      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white p-6 rounded-xl shadow-xl border">

          <h1 className="text-2xl font-semibold mb-4">
            Report Overview
          </h1>

          <p className="text-sm mb-4 text-gray-600">
            Logged in as: {user?.email}
          </p>

          {/* ✅ FILTERS */}
          <div className="mb-4 grid grid-cols-3 gap-3">

            {/* Month */}
            <div>
              <label className="block text-xs font-semibold mb-1">Month</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full border rounded-lg p-2"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-semibold mb-1">Type</label>
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

            {/* ✅ NAME FILTER */}
            <div>
              <label className="block text-xs font-semibold mb-1">Name</label>
              <select
                value={selectedName}
                onChange={(e) => setSelectedName(e.target.value)}
                className="w-full border rounded-lg p-2"
              >
                <option value="All">All</option>
                {[...new Set(rawEntries.map(e => e.name))].map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

          </div>

{/* ✅ TOTALS BY CATEGORY (LIKE TIMESHEET) */}
<div className="mb-3">

  <table className="w-full text-xs border rounded-lg overflow-hidden">
    
    <thead className="bg-[#be95be] text-black">
      <tr>
        <th className="p-2 text-center">Weekday</th>
        <th className="p-2 text-center">Night</th>
        <th className="p-2 text-center">Weekend</th>
        <th className="p-2 text-center">Holiday</th>
        <th className="p-2 text-center font-bold">Total OT</th>
      </tr>
    </thead>

    <tbody>
      <tr className="text-center font-semibold">
        <td className="p-2">{totalWeekday}</td>
        <td className="p-2">{totalNight}</td>
        <td className="p-2">{totalWeekend}</td>
        <td className="p-2">{totalHoliday}</td>
        <td className="p-2 font-bold">{totalHours}</td>
      </tr>
    </tbody>

  </table>

</div>


{/* ✅ EXPORT FULL */}
<div className="mb-4 flex justify-end">
  <button
    onClick={() => {

      const summaryRows = entries.map(e => `
        <Row>
          <Cell><Data ss:Type="String">${selectedMonth || "All"}</Data></Cell>
          <Cell><Data ss:Type="String">${e.name}</Data></Cell>
          <Cell><Data ss:Type="Number">${e.weekday}</Data></Cell>
          <Cell><Data ss:Type="Number">${e.night}</Data></Cell>
          <Cell><Data ss:Type="Number">${e.weekend}</Data></Cell>
          <Cell><Data ss:Type="Number">${e.holiday}</Data></Cell>
        </Row>
      `).join("")

const rawRows = rawEntries.map(e => `
  <Row>
    <Cell><Data ss:Type="String">${e.date}</Data></Cell>
    <Cell><Data ss:Type="String">${e.name}</Data></Cell>
    <Cell><Data ss:Type="String">${e.type}</Data></Cell>
    <Cell><Data ss:Type="String">${getCategory(e.type)}</Data></Cell>
    <Cell><Data ss:Type="Number">${e.hours}</Data></Cell>
    <Cell><Data ss:Type="String">${e.status || "Draft"}</Data></Cell>
    <Cell><Data ss:Type="String">${e.notes || ""}</Data></Cell>
  </Row>
`).join("")

      const xml = `<?xml version="1.0"?>
        <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
          <Worksheet ss:Name="Full Report">
            <Table>

              <Row><Cell><Data ss:Type="String">SUMMARY</Data></Cell></Row>

              <Row>
                <Cell><Data ss:Type="String">Month</Data></Cell>
                <Cell><Data ss:Type="String">Name</Data></Cell>
                <Cell><Data ss:Type="String">Weekday OT</Data></Cell>
                <Cell><Data ss:Type="String">Night OT</Data></Cell>
                <Cell><Data ss:Type="String">Weekend OT</Data></Cell>
                <Cell><Data ss:Type="String">Holiday OT</Data></Cell>
              </Row>

              ${summaryRows}

              <Row></Row>
              <Row></Row>

              <Row><Cell><Data ss:Type="String">RAW DATA</Data></Cell></Row>

<Row>
  <Cell><Data ss:Type="String">Date</Data></Cell>
  <Cell><Data ss:Type="String">Name</Data></Cell>
  <Cell><Data ss:Type="String">Type</Data></Cell>
  <Cell><Data ss:Type="String">Category</Data></Cell>
  <Cell><Data ss:Type="String">Hours</Data></Cell>
  <Cell><Data ss:Type="String">Status</Data></Cell>
  <Cell><Data ss:Type="String">Notes</Data></Cell>
</Row>


              ${rawRows}

            </Table>
          </Worksheet>
        </Workbook>`

      const blob = new Blob([xml], {
        type: "application/vnd.ms-excel",
      })

      const url = URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      link.download = `OT_Full_${new Date().toISOString().slice(0, 10)}.xls`
      link.click()
    }}
    className="w-[180px] text-center bg-[#40948d] text-white px-4 py-2 rounded-lg hover:opacity-90"
  >
    Export Data
  </button>
</div>


          {/* ✅ TABLE */}
          <table className="w-full text-xs border">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2">Month</th>
                <th className="p-2">Name</th>
                <th className="p-2 cursor-pointer" onClick={() => handleSort("weekday")}>Weekday OT ⬍</th>
                <th className="p-2 cursor-pointer" onClick={() => handleSort("night")}>Night OT ⬍</th>
                <th className="p-2 cursor-pointer" onClick={() => handleSort("weekend")}>Weekend OT ⬍</th>
                <th className="p-2 cursor-pointer" onClick={() => handleSort("holiday")}>Holiday OT ⬍</th>
                <th className="p-2 font-bold text-[#40948d] cursor-pointer">Total OT</th>
              </tr>
            </thead>

            <tbody>
              {entries.map((entry, index) => (
                <tr key={index} className="border-t">
                  <td className="p-2">{selectedMonth || "All"}</td>
                  <td className="p-2">{entry.name}</td>
                  <td className="p-2">{entry.weekday}</td>
                  <td className="p-2">{entry.night}</td>
                  <td className="p-2">{entry.weekend}</td>
                  <td className="p-2">{entry.holiday}</td>
                  <td className="p-2 font-semibold">
                    {entry.weekday + entry.night + entry.weekend + entry.holiday}
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr className="font-semibold bg-gray-100 border-t">
                <td></td>
                <td>TOTAL</td>
                <td>{totalWeekday}</td>
                <td>{totalNight}</td>
                <td>{totalWeekend}</td>
                <td>{totalHoliday}</td>
                <td>{totalHours}</td>
              </tr>
            </tfoot>

          </table>

        </div>
      </div>
    </div>
  )
}
