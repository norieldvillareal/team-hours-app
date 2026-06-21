"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import Navbar from "@/components/Navbar"
import { useRouter } from "next/navigation"

export default function TimesheetPage() {
  const [sortColumn, setSortColumn] = useState("")
  const [sortDirection, setSortDirection] = useState("asc")
  const router = useRouter()
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  const handleSort = (column: string) => {
  if (sortColumn === column) {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
  } else {
    setSortColumn(column)
    setSortDirection("asc")
  }
}


  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  )
  const [selectedType, setSelectedType] = useState("All")
  const [message, setMessage] = useState("")
  const [showConfirm, setShowConfirm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<any>(null)

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


  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      const email = data.user?.email

      if (!email) {
        router.push("/login")
        return
      }

      if (!allowedUsers[email]) {
        alert("❌ You are not authorized")
        router.push("/login")
        return
      }

      setUser(data.user)
      fetchEntries(email)
    }

    getUser()
  }, [selectedMonth, selectedType])

  useEffect(() => {
  setEntries((prev) => sortEntries(prev))
}, [sortColumn, sortDirection])

  const fetchEntries = async (email: string) => {
    setLoading(true)

    const userName = allowedUsers[email]

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
  .eq("name", userName)


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

  const totalHours = entries.reduce(
    (sum, entry) => sum + (Number(entry.hours) || 0),
    0
  )

  const isSubmitted =
    entries.length > 0 &&
    entries.every((entry) => entry.status === "Submitted")

  // ✅ SUBMIT
  const handleSubmitTimesheet = async () => {
    const userName = allowedUsers[user.email]

    const startDate = `${selectedMonth}-01`

    const lastDay = new Date(
      new Date(selectedMonth + "-01").getFullYear(),
      new Date(selectedMonth + "-01").getMonth() + 1,
      0
    ).getDate()

    const endDate = `${selectedMonth}-${lastDay}`

    await supabase
      .from("time_entries")
      .update({ status: "Submitted" })
      .eq("name", userName)
      .gte("date", startDate)
      .lte("date", endDate)

    setMessage("✅ OT hours submitted")
    fetchEntries(user.email)
  }

  // ✅ DELETE
  const handleDelete = async (id: number) => {
    await supabase.from("time_entries").delete().eq("id", id)
    setMessage("✅ Entry deleted")
    fetchEntries(user.email)
  }

  // ✅ UPDATE
  const handleUpdate = async () => {
    if (!editingEntry) return

    await supabase
      .from("time_entries")
      .update({
        date: editingEntry.date,
        hours: editingEntry.hours,
        notes: editingEntry.notes,
      })
      .eq("id", editingEntry.id)

    setEditingEntry(null)
    setMessage("✅ Entry updated")
    fetchEntries(user.email)
  }

  //if (loading) return <div className="p-6">Loading...</div>
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

          <p className="text-sm mb-4 text-gray-600">
            Logged in as: {allowedUsers[user.email]}
          </p>

          {/* ✅ FILTERS */}
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

          {/* HEADER */}
          <div className="mb-4 flex justify-between items-center">
            <div className="text-lg">
              Total Hours: <strong>{totalHours}</strong>
            </div>

            <button
              onClick={() => setShowConfirm(true)}
              disabled={isSubmitted}
              className={`px-4 py-2 rounded-lg text-white ${
                isSubmitted
                  ? "bg-gray-400"
                  : "bg-[#71a3c1]"
              }`}
            >
              {isSubmitted ? "Already Submitted" : "Submit OT Hours"}
            </button>
          </div>

          {/* TABLE */}
          <table className="w-full text-sm border">
<thead className="bg-gray-100">
  <tr>
    <th className="p-2 cursor-pointer" onClick={() => handleSort("date")}>
      Date ⬍
    </th>
    <th className="p-2 cursor-pointer" onClick={() => handleSort("type")}>
      Type ⬍
    </th>
    <th className="p-2 cursor-pointer" onClick={() => handleSort("hours")}>
      Hours ⬍
    </th>
    <th className="p-2">Status</th>
    <th className="p-2">Notes</th>
    <th className="p-2">Actions</th>
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

                  <td className="p-2">
                    {entry.status !== "Submitted" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingEntry(entry)}
                          className="text-blue-500 text-xs"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="text-red-500 text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      </div>

      {/* ✅ SUBMIT MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-xl">
            <h2 className="mb-4">Confirm submission?</h2>

            <div className="flex gap-2">
              <button onClick={() => setShowConfirm(false)}>
                Cancel
              </button>

              <button
                onClick={async () => {
                  await handleSubmitTimesheet()
                  setShowConfirm(false)
                }}
              >
                Confirm
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ✅ EDIT MODAL */}
{editingEntry && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    
    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">

      <h2 className="text-lg font-semibold mb-4">
        Edit Entry
      </h2>

      {/* ✅ DATE */}
      <div className="mb-3">
        <label className="block text-sm mb-1">Date</label>
        <input
          type="date"
          value={editingEntry.date}
          onChange={(e) =>
            setEditingEntry({ ...editingEntry, date: e.target.value })
          }
          className="w-full border rounded-lg p-2"
        />
      </div>

      {/* ✅ HOURS */}
      <div className="mb-3">
        <label className="block text-sm mb-1">Hours</label>
        <input
          type="number"
          value={editingEntry.hours}
          onChange={(e) =>
            setEditingEntry({ ...editingEntry, hours: e.target.value })
          }
          className="w-full border rounded-lg p-2"
        />
      </div>

      {/* ✅ NOTES */}
      <div className="mb-4">
        <label className="block text-sm mb-1">Notes</label>
        <textarea
          value={editingEntry.notes}
          onChange={(e) =>
            setEditingEntry({ ...editingEntry, notes: e.target.value })
          }
          className="w-full border rounded-lg p-2"
        />
      </div>

      {/* ✅ BUTTONS */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => setEditingEntry(null)}
          className="px-4 py-2 bg-gray-300 rounded-lg"
        >
          Cancel
        </button>

        <button
          onClick={handleUpdate}
          className="px-4 py-2 bg-[#71a3c1] text-white rounded-lg"
        >
          Save
        </button>
      </div>

    </div>
  </div>
)}


    </div>
  )
}
