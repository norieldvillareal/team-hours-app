"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import Navbar from "@/components/Navbar"
const primaryButton =
  "bg-[#71a3c1] text-white px-4 py-2 rounded-lg hover:opacity-90"

const hourTypes = [
  {
    name: "Pre-Shift",
    description: "Time rendered before the scheduled shift"
  },
  {
    name: "Post-Shift",
    description: "Time rendered after the shift that cannot be handed over"
  },
  {
    name: "Weekday HC",
    description: "Health check on weekdays when not on shift"
  },
  {
    name: "Night Shift",
    description: "Shift between 10PM – 6AM"
  },
  {
    name: "Weekend HC",
    description: "Health check on weekends when not on shift"
  },
  {
    name: "Weekend Release",
    description: "Release activities (2nd week of month)"
  },
  {
    name: "Weekend Patching",
    description: "Patching activities (3rd week of month)"
  },
  {
    name: "Weekend Shift",
    description: "Work beyond 5 working days"
  },
  {
    name: "Holiday Shift",
    description: "Shift during public holiday"
  }
]

export default function AddEntryPage() {
  const [name, setName] = useState("")
  const [date, setDate] = useState("")
  const [hours, setHours] = useState("")
  const [type, setType] = useState("")
  const [notes, setNotes] = useState("")
  const [message, setMessage] = useState("")

const handleSubmit = async () => {
  setMessage("")

if (!name || !date || !hours || !type) {
  setMessage("Please fill all required fields.")
  return
}

  if (Number(hours) > 24) {
    setMessage("Hours cannot exceed 24. Find a life!")
    return
  }

  const { data, error } = await supabase
    .from("time_entries")
.insert([
  {
    name: name,
    date: date,
    hours: Number(hours),
    type: type,
    notes: notes
  }
])

  if (error) {
    console.error("Database error:", error)
    setMessage("❌ Failed to save entry.")
    return
  }

  setMessage("✅ Entry saved successfully.")

  // reset form
  setDate("")
  setHours("")
  setType("")
  setNotes("")
}

  return (
<div className="min-h-screen bg-[#c6dbdc] text-black">
  <Navbar />

<div className="max-w-4xl mx-auto p-6">
  <div className="bg-white text-black p-6 rounded-xl shadow-xl border border-gray-200">

        {/* Title */}
        <div>
          <h1 className="text-2xl font-semibold">Overtime Hours</h1>
          <p className="text-sm text-gray-700">
            Add your work hours for a specific day
          </p>
        </div>

{/* Name */}
<div>
  <label className="block text-sm font-medium mb-1">
    Your Name
  </label>
  <input
    type="text"
    placeholder="Enter your name"
    className="w-full border border-gray-300 rounded-lg p-2 bg-white text-black"
    value={name}
    onChange={(e) => setName(e.target.value)}
  />
</div>



        {/* Date */}
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            className="w-full border border-gray-300 rounded-lg p-2 bg-white text-black"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            className="w-full border border-gray-300 rounded-lg p-2 bg-white text-black"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">Select type</option>
            {hourTypes.map((t) => (
              <option key={t.name} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Description */}
          {type && (
            <p className="text-xs text-gray-500 mt-1">
              {
                hourTypes.find((t) => t.name === type)
                  ?.description
              }
            </p>
          )}
        </div>

        {/* Hours */}
        <div>
          <label className="block text-sm font-medium mb-1">Hours</label>
          <input
            type="number"
            placeholder="e.g. 2, 4, 8"
            className="w-full border border-gray-300 rounded-lg p-2 bg-white text-black"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Notes (optional)
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-2 bg-white text-black"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Button */}
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-[#71a3c1] text-white rounded-lg py-2 hover:opacity-90"
          >
            Add Entry
          </button>

          <button
            onClick={handleSubmit}
            className="flex-1 bg-[#71a3c1] text-white rounded-lg py-2 hover:opacity-90"
          >
            Add & New
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className="text-sm text-center text-gray-600">
            {message}
          </div>
        )}
        
      </div>
    </div>
    </div>
  )

}
   