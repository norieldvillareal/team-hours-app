"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import Navbar from "@/components/Navbar"
import { useRouter } from "next/navigation"

export default function TimesheetPage() {
  const [sortColumn, setSortColumn] = useState("date")
  const [sortDirection, setSortDirection] = useState("asc")
  const router = useRouter()
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  
  const [selectedName, setSelectedName] = useState("All")
  const isAdmin = user && user.email === "nvillareal@pingala.eu"
const [allEntries, setAllEntries] = useState<any[]>([])



  // ✅ ADD ENTRY STATES
const [date, setDate] = useState("")
const [hours, setHours] = useState("")
const [type, setType] = useState("")
const [notes, setNotes] = useState("")
const [selectedCategory, setSelectedCategory] = useState("All")
const isAddDisabled =
  !date ||
  !type ||
  !hours ||
  Number(hours) <= 0 ||
  Number(hours) >= 24



  const getCategory = (type: string) => {
  if (!type) return ""

  if (type === "Night Shift") return "Night OT"
  if (type.includes("Weekend")) return "Weekend OT"
  if (type.includes("Holiday")) return "Holiday OT"

  return "Weekday OT"
}

const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === "Enter") {
    e.preventDefault()

    if (!isAddDisabled) {
      handleAddEntry()
    }
  }
}


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
  if (isAdmin) {
    setSelectedName("All")
  }
}, [user])

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
    }

    getUser()
  }, [])

useEffect(() => {
  if (user) {
    fetchEntries()
  }
}, [selectedName])


useEffect(() => {
  if (user) {
    fetchEntries()
  }
}, [user, selectedMonth, selectedType, selectedCategory])

  useEffect(() => {
  setEntries((prev) => sortEntries(prev))
}, [sortColumn, sortDirection])

const fetchEntries = async () => {
  if (!user) return

  const userName = allowedUsers[user.email]


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

// ✅ ALWAYS get ALL data for admin (for dropdown)
let allQuery = supabase
  .from("time_entries")
  .select("*")

// ✅ apply same filters (except name)
if (selectedMonth) {
  const startDate = `${selectedMonth}-01`
  const lastDay = new Date(
    new Date(selectedMonth + "-01").getFullYear(),
    new Date(selectedMonth + "-01").getMonth() + 1,
    0
  ).getDate()
  const endDate = `${selectedMonth}-${lastDay}`

  allQuery = allQuery.gte("date", startDate).lte("date", endDate)
}

if (selectedType !== "All") {
  allQuery = allQuery.eq("type", selectedType)
}


// ✅ NORMAL USER
if (!isAdmin) {
  query = query.eq("name", userName)
}

// ✅ ADMIN FILTER
if (isAdmin && selectedName !== "All") {
  query = query.eq("name", selectedName)
}




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

// ✅ get ALL entries (for dropdown)
const { data: allData } = await allQuery
setAllEntries(allData || [])

// ✅ get filtered entries (for table)
const { data } = await query.order("date", { ascending: true })


let filtered = data || []

if (selectedCategory !== "All") {
  filtered = filtered.filter(
    (e) => getCategory(e.type) === selectedCategory
  )
}

setEntries(sortEntries(filtered))
    setLoading(false)
  }

  const totalHours = entries.reduce(
    (sum, entry) => sum + (Number(entry.hours) || 0),
    0
  )

  const totalsByCategory = entries.reduce((acc, entry) => {
  const category = getCategory(entry.type)
  const hrs = Number(entry.hours) || 0

  if (!acc[category]) {
    acc[category] = 0
  }

  acc[category] += hrs

  return acc
}, {} as Record<string, number>)

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
    fetchEntries()
  }

  // ✅ DELETE
  const handleDelete = async (id: number) => {
    await supabase.from("time_entries").delete().eq("id", id)
    setMessage("✅ Entry deleted")
    fetchEntries()
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
    status: "Draft",
    overridden: isAdmin ? true : false, // ✅ ADD THIS
  })
      .eq("id", editingEntry.id)

    setEditingEntry(null)
    setMessage("✅ Entry updated")
    fetchEntries()
  }

  const handleAddEntry = async () => {
  setMessage("")

  if (!user) {
    setMessage("❌ Please login first.")
    return
  }

  const userName = allowedUsers[user.email]

  if (!date || !hours || !type) {
    setMessage("Please fill all required fields.")
    return
  }

  if (Number(hours) >= 24) {
    setMessage("❌ Hours must be less than 24.")
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
    setMessage("❌ Duplicate entry. This Date and OT Type already exists.")
    return
  }

  // ✅ INSERT
  const { error } = await supabase
    .from("time_entries")
    .insert([
      {
        name: userName,
        date,
        hours: Number(hours),
        type,
        notes,
      },
    ])

  if (error) {
    console.error(error)

    if (error.code === "23505") {
      setMessage("❌ Duplicate entry (database).")
    } else {
      setMessage("❌ Failed to save entry.")
    }

    return
  }

  setMessage("✅ Entry saved successfully.")

  // ✅ RESET FORM
  setDate("")
  setHours("")
  setType("")
  setNotes("")

  fetchEntries()
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

          {/*<p className="text-sm mb-4 text-gray-600">
            Logged in as: {allowedUsers[user.email]}
          </p>*/}

{/* ✅ ADD ENTRY FORM (ONE LINE) */}
{/* ✅ ADD ENTRY FORM (ONE LINE + ENTER SUPPORT) */}
<form
  onSubmit={(e) => {
    e.preventDefault()
    if (!isAddDisabled) handleAddEntry()
  }}
  className="mb-6 grid grid-cols-5 gap-2 items-center"
>

  <input
    type="date"
    value={date}
    onChange={(e) => setDate(e.target.value)}
    onKeyDown={handleKeyDown}
    className="border rounded-lg p-2"
  />

  <select
    value={type}
    onChange={(e) => setType(e.target.value)}
    onKeyDown={handleKeyDown}
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
    onKeyDown={handleKeyDown}
    className="border rounded-lg p-2"
  />

  <input
    placeholder="Notes"
    value={notes}
    onChange={(e) => setNotes(e.target.value)}
    onKeyDown={handleKeyDown}
    className="border rounded-lg p-2"
  />

  <button
    type="submit"
    disabled={isAddDisabled}
    className={`rounded-lg h-full text-white ${
      isAddDisabled
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-[#40948d] hover:opacity-90"
    }`}
  >
    File OT
  </button>

</form>


          {/* ✅ FILTERS */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">


            <div>
              <label className="block text-sm font-semibold mb-1">Month</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Type</label>
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
<div>
  <label className="block text-sm font-semibold mb-1">Category</label>
  <select
    value={selectedCategory}
    onChange={(e) => setSelectedCategory(e.target.value)}
    className="w-full border rounded-lg p-2"
  >
    <option value="All">All</option>
    <option value="Weekday OT">Weekday OT</option>
    <option value="Night OT">Night OT</option>
    <option value="Weekend OT">Weekend OT</option>
    <option value="Holiday OT">Holiday OT</option>
  </select>
</div>

{isAdmin && (
  <div>
    <label className="block text-sm font-semibold mb-1">Name</label>
    <select
      value={selectedName}
      onChange={(e) => setSelectedName(e.target.value)}
      className="w-full border rounded-lg p-2"
    >
      <option value="All">All</option>
      {[...new Set(allEntries.map(e => e.name))].map((name) => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </select>
  </div>
)}

          </div>


{/* HEADER */}
<div className="mb-4">
  {/* <div className="text-lg">
    Total hours for the month: <strong>{totalHours}</strong>
  </div>*/}

{/* ✅ TOTALS BY CATEGORY (TABLE STYLE) */}
<div className="mb-3">

  <table className="w-full text-sm border rounded-lg overflow-hidden">
    
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
        <td className="p-2">{totalsByCategory["Weekday OT"] || 0}</td>
        <td className="p-2">{totalsByCategory["Night OT"] || 0}</td>
        <td className="p-2">{totalsByCategory["Weekend OT"] || 0}</td>
        <td className="p-2">{totalsByCategory["Holiday OT"] || 0}</td>
        <td className="p-2 font-bold">{totalHours}</td>
      </tr>
    </tbody>

  </table>

</div>

  {/* ✅ BUTTON GROUP */}
  <div className="flex justify-end gap-2 mt-2">

    {/* ✅ SUBMIT BUTTON */}
    <button
      onClick={() => setShowConfirm(true)}
      disabled={isSubmitted}
      className={`w-[180px] text-center px-4 py-2 rounded-lg text-white ${
        isSubmitted
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-[#40948d] hover:opacity-90"
      }`}
    >
      {isSubmitted ? "Already Submitted" : "Submit OT Hours"}
    </button>

    {/* ✅ EXPORT BUTTON */}
    <button
      onClick={() => {

        const rows = entries.map(e => `
          <Row>
            <Cell><Data ss:Type="String">${e.date}</Data></Cell>
            <Cell><Data ss:Type="String">${e.type}</Data></Cell>
            <Cell><Data ss:Type="String">${getCategory(e.type)}</Data></Cell>
            <Cell><Data ss:Type="Number">${e.hours}</Data></Cell>
            <Cell><Data ss:Type="String">${e.notes || ""}</Data></Cell>
          </Row>
        `).join("")

        const xml = `<?xml version="1.0"?>
          <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
            xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
            <Worksheet ss:Name="My OT Data">
              <Table>

                <Row>
                  <Cell><Data ss:Type="String">Date</Data></Cell>
                  <Cell><Data ss:Type="String">Type</Data></Cell>
                  <Cell><Data ss:Type="String">Category</Data></Cell>
                  <Cell><Data ss:Type="String">Hours</Data></Cell>
                  <Cell><Data ss:Type="String">Notes</Data></Cell>
                </Row>

                ${rows}

              </Table>
            </Worksheet>
          </Workbook>`

        const blob = new Blob([xml], {
          type: "application/vnd.ms-excel",
        })

        const url = URL.createObjectURL(blob)

        const link = document.createElement("a")
        link.href = url
        link.download = `My_OT_${new Date().toISOString().slice(0, 10)}.xls`
        link.click()
      }}
      className="w-[180px] text-center bg-[#40948d] text-white px-4 py-2 rounded-lg hover:opacity-90"
    >
      Export Data
    </button>

  </div>
</div>



          {/* TABLE */}
          <table className="w-full text-sm border table-fixed">

<thead className="bg-gray-100 text-left">
  <tr>
    <th className="p-2 w-[120px] cursor-pointer" onClick={() => handleSort("date")}>
      Date ⬍
    </th>

    <th className="p-2 w-[180px] cursor-pointer" onClick={() => handleSort("type")}>
      Name ⬍
    </th>

    <th className="p-2 w-[140px] cursor-pointer" onClick={() => handleSort("type")}>
      Type ⬍
    </th>

    <th
      className="p-2  w-[140px] cursor-pointer"
      onClick={() => handleSort("type")}
    >
      Category ⬍
    </th>

    <th className="p-2 w-[80px] cursor-pointer" onClick={() => handleSort("hours")}>
      Hours ⬍
    </th>

    <th className="p-2 w-[120px]">Status</th>
    <th className="p-2">Notes</th>
    <th className="p-2 w-[100px]">Actions</th>
  </tr>
</thead>



<tbody>
  {entries.map((entry) => (
    <tr key={entry.id} className="border-t">

      {/* DATE */}
      <td className="p-2">{entry.date}</td>

      {/* NAME */}
<td className="p-2 whitespace-nowrap overflow-hidden text-ellipsis">
  {entry.name}
  {entry.name === allowedUsers[user?.email] && (
    <span className="text-[10px] text-gray-500 ml-1">(You)</span>
  )}
</td>

      {/* TYPE */}
      <td className="p-2">{entry.type}</td>

      {/* CATEGORY */}
      <td className="p-2">{getCategory(entry.type)}</td>

      {/* HOURS */}
      <td className="p-2">{entry.hours}</td>

      {/* ✅ STATUS + OVERRIDE */}
      <td className="p-2">
        <div className="flex flex-col gap-1">

          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${
              entry.status === "Submitted"
                ? "bg-[#6dbfb8] text-black"
                : "bg-[#fec76f] text-black"
            }`}
          >
            {entry.status || "Draft"}
          </span>

          {entry.overridden && (
            <span className="text-[10px] text-orange-600 font-semibold">
              Overridden by Admin
            </span>
          )}

        </div>
      </td>

      {/* NOTES */}
      <td className="p-2">{entry.notes}</td>

      {/* ✅ ACTIONS */}
      <td className="p-2">
        <div className="flex gap-2">

          {/* NORMAL USER */}
          {entry.status !== "Submitted" && (
            <>
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
            </>
          )}

          {/* ADMIN */}
          {entry.status === "Submitted" && isAdmin && selectedName !== "All" && (
            <button
              onClick={() => setEditingEntry(entry)}
              className="text-orange-500 text-xs"
            >
              Override
            </button>
          )}

        </div>
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