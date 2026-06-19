"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import Navbar from "@/components/Navbar"
const primaryButton =
  "bg-[#71a3c1] text-white px-4 py-2 rounded-lg hover:opacity-90"



export default function TimesheetPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  )
  const [selectedType, setSelectedType] = useState("All")
  const [message, setMessage] = useState("")
  const [showConfirm, setShowConfirm] = useState(false)

  const fetchEntries = async () => {
    setLoading(true)

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
      .gte("date", startDate)
      .lte("date", endDate)

    if (selectedType !== "All") {
      query = query.eq("type", selectedType)
    }

    const { data, error } = await query.order("date", { ascending: false })

    if (error) {
      console.error("FULL ERROR:", JSON.stringify(error, null, 2))
      setEntries([])
    } else {
      setEntries(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchEntries()
  }, [selectedMonth, selectedType])

  const totalHours = entries.reduce(
    (sum, entry) => sum + (Number(entry.hours) || 0),
    0
  )

  const isSubmitted =
    entries.length > 0 &&
    entries.every((entry) => entry.status === "Submitted")

  // ✅ SUBMIT FUNCTION (NO confirm anymore)
  const handleSubmitTimesheet = async () => {
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
      .gte("date", startDate)
      .lte("date", endDate)

    if (error) {
      console.error(error)
      setMessage("❌ Failed to submit OT hours")
    } else {
      setMessage("✅ OT hours submitted")
      fetchEntries()
    }
  }

  return (
<div className="min-h-screen bg-[#c6dbdc] text-black">

  <Navbar />

<div className="max-w-4xl mx-auto p-6">
  <div className="bg-white text-black p-6 rounded-xl shadow-xl border border-gray-200">


      <h1 className="text-2xl font-semibold mb-4">
        My Overtime Hours
      </h1>

      {/* Month */}
      <div className="mb-4">
        <label className="block text-sm mb-1">Select Month</label>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border border-gray-300 rounded-lg p-2"
        />
      </div>

      {/* Type */}
      <div className="mb-4">
        <label className="block text-sm mb-1">Filter by Type</label>
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

      {/* Total */}
      <div className="mb-4 text-lg">
        Total Hours: <strong>{totalHours}</strong>
      </div>

      {/* Submit Button */}
      <div className="mb-4">
        <button
          onClick={() => setShowConfirm(true)}
          disabled={isSubmitted}
className={`px-4 py-2 rounded-lg text-white ${
  isSubmitted
    ? "bg-gray-400 cursor-not-allowed"
    : "bg-[#71a3c1] hover:opacity-90"
}`}

        >
          {isSubmitted ? "Already Submitted" : "Submit OT Hours"}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className="mb-4 text-sm text-green-600">
          {message}
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
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
                <td className="p-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      entry.status === "Submitted"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {entry.status || "Draft"}
                  </span>
                </td>
                <td className="p-2">{entry.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>

    {/* ✅ MODAL MUST BE INSIDE MAIN RETURN */}
    {showConfirm && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">

          <h2 className="text-lg font-semibold mb-3">
            Confirm Submission
          </h2>

          <p className="text-sm text-gray-600 mb-6">
            Are you sure you want to submit your OT hours? You won’t be able to change them later.
          </p>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              className="bg-[#be95be] text-white px-4 py-2 rounded-lg hover:opacity-90"
            >
              Cancel
            </button>

            <button
              onClick={async () => {
                await handleSubmitTimesheet()
                setShowConfirm(false)
              }}
              className="bg-[#71a3c1] text-white px-4 py-2 rounded-lg hover:opacity-90"
            >
              Confirm
            </button>
          </div>

        </div>
      </div>
    )}
</div>
  </div>
)
}
