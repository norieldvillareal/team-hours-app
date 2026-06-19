"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import Navbar from "@/components/Navbar"
import * as XLSX from "xlsx"
const ADMIN_EMAIL = "nvillareal@pingala.eu"
const [user, setUser] = useState<any>(null)
const [loading, setLoading] = useState(true)

export default function AdminPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  )
  const [selectedType, setSelectedType] = useState("All")

  // ✅ FETCH DATA
const fetchEntries = async () => {
  let query = supabase
    .from("time_entries")
    .select("*")
    
if (loading) {
  return <div className="p-6">Loading...</div>
}


  // ✅ Only apply date filter IF user selects month
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

  // ✅ Type filter still works
  if (selectedType !== "All") {
    query = query.eq("type", selectedType)
  }

  const { data, error } = await query.order("date", { ascending: false })

  if (!error) {
    setEntries(data || [])
  }
}


  // ✅ CATEGORY LOGIC
  const getCategory = (type: string) => {
    if (type === "Pre-Shift" || type === "Post-Shift") return "Weekday OT"
    if (type === "Night Shift") return "Night OT"
    if (
      type === "Weekend HC" ||
      type === "Weekend Shift" ||
      type === "Weekend Release" ||
      type === "Weekend Patching"
    )
      return "Weekend OT"
    if (type === "Holiday Shift") return "Holiday OT"
    return "other"
  }

  // ✅ GROUP DATA
  const groupedData: any = {}

  entries.forEach((entry) => {
    const name = entry.name || "User"
    const categoryLabel = getCategory(entry.type)

let category = ""

if (categoryLabel === "Weekday OT") category = "weekday"
if (categoryLabel === "Night OT") category = "night"
if (categoryLabel === "Weekend OT") category = "weekend"
if (categoryLabel === "Holiday OT") category = "holiday"

    const hours = Number(entry.hours || 0)

    if (!groupedData[name]) {
      groupedData[name] = {
        weekday: 0,
        night: 0,
        weekend: 0,
        holiday: 0,
      }
    }

    groupedData[name][category] += hours
  })

  const tableData = Object.entries(groupedData)

  // ✅ TOTALS
  const totals = {
    weekday: 0,
    night: 0,
    weekend: 0,
    holiday: 0,
  }

  Object.values(groupedData).forEach((data: any) => {
    totals.weekday += data.weekday
    totals.night += data.night
    totals.weekend += data.weekend
    totals.holiday += data.holiday
  })

  // ✅ EXPORT TO EXCEL
const exportToExcel = () => {
  const monthLabel = selectedMonth
    ? new Date(selectedMonth + "-01").toLocaleString("default", {
        month: "short",
      })
    : "All"

const data = tableData.map(([name, row]: any) => ({
Month: selectedMonth
  ? new Date(selectedMonth + "-01").toLocaleString("default", {
      month: "short",
    })
  : "Multiple",


    Name: name,
    "Weekday OT": row.weekday,
    "Night OT": row.night,
    "Weekend OT": row.weekend,
    "Holiday OT": row.holiday,
  }))

  data.push({
    Month: "",
    Name: "TOTAL",
    "Weekday OT": totals.weekday,
    "Night OT": totals.night,
    "Weekend OT": totals.weekend,
    "Holiday OT": totals.holiday,
  })

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report")

  XLSX.writeFile(workbook, `OT_Report_${selectedMonth || "ALL"}.xlsx`)
}


const exportBreakdownToExcel = () => {
  const data = entries.map((entry) => ({
    Date: entry.date,
    Name: entry.name || "User",
    Type: entry.type,
    Category: getCategory(entry.type),
    Hours: entry.hours,
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Breakdown")

  XLSX.writeFile(
    workbook,
    `OT_Breakdown_${selectedMonth || "ALL"}.xlsx`
  )
}



useEffect(() => {
  const checkUser = async () => {
    const { data } = await supabase.auth.getUser()
    const email = data.user?.email

    if (!email) {
      window.location.href = "/login"
      return
    }

    if (email !== ADMIN_EMAIL) {
      alert("❌ Admin access only")
      window.location.href = "/log-hours"
      return
    }

    setUser(data.user)
    setLoading(false)
  }

  checkUser()
}, [])

  return (
    <div className="min-h-screen bg-[#c6dbdc] text-black">
      <Navbar />

      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white p-6 rounded-xl shadow-xl border">

          <h1 className="text-2xl font-semibold mb-4">
            Admin - Team Overview
          </h1>

          {/* ✅ Filters */}
          <div className="grid grid-cols-2 gap-4 mb-6">

            <div>
              <label className="block text-sm mb-1">Filter by Month (optional)</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 w-full"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Filter by OT Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 w-full"
              >
                <option value="All">All</option>
                <option value="Pre-Shift">Pre-Shift</option>
                <option value="Post-Shift">Post-Shift</option>
                <option value="Weekday HC">Weekday HC</option>
                <option value="Night Shift">Night Shift</option>
                <option value="Weekend HC">Weekend HC</option>
                <option value="Weekend Release">Weekend Release</option>
                <option value="Weekend Patching">Weekend Patching</option>
                <option value="Weekend Shift">Weekend Shift</option>
                <option value="Holiday Shift">Holiday Shift</option>
              </select>
            </div>

          </div>

          {/* ✅ Export Button */}
<div className="mb-4 flex justify-end gap-3">

  <button
    onClick={exportToExcel}
    className="bg-[#71a3c1] text-white px-4 py-2 rounded-lg shadow hover:opacity-90"
  >
    Export Summary
  </button>

  <button
    onClick={exportBreakdownToExcel}
    className="bg-[#be95be] text-white px-4 py-2 rounded-lg shadow hover:opacity-90"
  >
    Export Breakdown
  </button>

</div>


          {/* ✅ Table */}
          <div className="border rounded-lg overflow-hidden bg-white">
            <table className="w-full text-sm">

              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 text-left">Month</th>
                  <th className="p-2 text-left">Employee Name</th>
                  <th className="p-2 text-left">Weekday OT</th>
                  <th className="p-2 text-left">Night OT</th>
                  <th className="p-2 text-left">Weekend OT</th>
                  <th className="p-2 text-left">Holiday OT</th>
                </tr>
              </thead>

              <tbody>

                {tableData.map(([name, data]: any) => (
                  <tr key={name} className="border-t even:bg-gray-50">

<td className="p-2">
  {selectedMonth
    ? new Date(selectedMonth + "-01").toLocaleString("default", {
        month: "short",
      })
    : "All"}
</td>


                    <td className="p-2 font-medium">{name}</td>

                    <td className="p-2 text-center">
                      {data.weekday > 0 ? data.weekday : ""}
                    </td>

                    <td className="p-2 text-center">
                      {data.night > 0 ? data.night : ""}
                    </td>

                    <td className="p-2 text-center">
                      {data.weekend > 0 ? data.weekend : ""}
                    </td>

                    <td className="p-2 text-center">
                      {data.holiday > 0 ? data.holiday : ""}
                    </td>

                  </tr>
                ))}

                {/* ✅ GRAND TOTAL ROW */}
                <tr className="border-t-2 border-gray-400 bg-[#71a3c1] text-white font-bold">
                  <td></td>
                  <td>Total</td>
                  <td className="text-center">{totals.weekday}</td>
                  <td className="text-center">{totals.night}</td>
                  <td className="text-center">{totals.weekend}</td>
                  <td className="text-center">{totals.holiday}</td>
                </tr>

              </tbody>

            </table>
          </div>

        </div>
      </div>
    </div>
  )
}