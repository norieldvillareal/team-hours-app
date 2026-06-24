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

  const [sortColumn, setSortColumn] = useState("date")
  const [sortDirection, setSortDirection] = useState("asc")

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  )
  const [selectedType, setSelectedType] = useState("All")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const [message, setMessage] = useState("")
  const [showConfirm, setShowConfirm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<any>(null)

  // ✅ ADD ENTRY STATES
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
  }, [selectedMonth, selectedType, selectedCategory])

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

    let filtered = data || []

    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (e) => getCategory(e.type) === selectedCategory
      )
    }

    setEntries(sortEntries(filtered))
    setLoading(false)
  }

  // ✅ ADD ENTRY (WITH DUPLICATE)
  const handleAddEntry = async () => {
    const userName = allowedUsers[user.email]

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

    await supabase.from("time_entries").insert([
      { name: userName, date, hours: Number(hours), type, notes },
    ])

    setMessage("✅ Entry added")

    setDate("")
    setHours("")
    setType("")
    setNotes("")

    fetchEntries(user.email)
  }

  const handleDelete = async (id: number) => {
    await supabase.from("time_entries").delete().eq("id", id)
    fetchEntries(user.email)
  }

  const handleUpdate = async () => {
    await supabase
      .from("time_entries")
      .update({
        date: editingEntry.date,
        hours: editingEntry.hours,
        notes: editingEntry.notes,
      })
      .eq("id", editingEntry.id)

    setEditingEntry(null)
    fetchEntries(user.email)
  }

  const handleSubmitTimesheet = async () => {
    const userName = allowedUsers[user.email]

    await supabase
      .from("time_entries")
      .update({ status: "Submitted" })
      .eq("name", userName)

    fetchEntries(user.email)
  }

  const totalHours = entries.reduce(
    (sum, entry) => sum + Number(entry.hours || 0),
    0
  )

  if (loading) return <div />

  return (
    <div className="p-6">

      {/* ✅ ADD ENTRY */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} />
        <select value={type} onChange={(e)=>setType(e.target.value)}>
          <option value="">Type</option>
          <option value="Post-Shift">Post-Shift</option>
          <option value="Night Shift">Night Shift</option>
        </select>
        <input type="number" value={hours} onChange={(e)=>setHours(e.target.value)} />
        <input value={notes} onChange={(e)=>setNotes(e.target.value)} />
        <button onClick={handleAddEntry}>Add</button>
      </div>

      {/* ✅ HEADER */}
      <div className="flex justify-between mb-4">
        <div>Total Hours: {totalHours}</div>
        <button onClick={()=>setShowConfirm(true)}>Submit</button>
      </div>

      {/* ✅ TABLE */}
      <table>
        <thead>
          <tr>
            <th onClick={()=>handleSort("date")}>Date</th>
            <th>Type</th>
            <th>Category</th>
            <th onClick={()=>handleSort("hours")}>Hours</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {entries.map(e=>(
            <tr key={e.id}>
              <td>{e.date}</td>
              <td>{e.type}</td>
              <td>{getCategory(e.type)}</td>
              <td>{e.hours}</td>
              <td>{e.notes}</td>
              <td>
                <button onClick={()=>setEditingEntry(e)}>Edit</button>
                <button onClick={()=>handleDelete(e.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  )
}
