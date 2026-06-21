"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"


export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)

  // ✅ Allowed users (email → display name)
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

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }
    getUser()
  }, [])

  // ✅ Better active link style
  const linkClass = (path: string) =>
    `px-4 py-2 rounded-lg transition-all ${
      pathname === path
        ? "bg-white text-[#40948d] font-semibold shadow"
        : "text-white hover:bg-white/20"
    }`

  return (
    <div className="w-full bg-[#40948d] text-white">

      {/* ✅ TOP BAR */}
      <div className="max-w-4xl mx-auto flex justify-between items-center px-6 py-3">

        <div className="font-semibold text-lg">
          Project Overtime Hours
        </div>

        <div className="flex items-center gap-4">

          {/* ✅ User name */}
          <span className="text-sm">
            {allowedUsers[user?.email || ""] || user?.email}
          </span>

          {/* ✅ Logout */}
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              router.push("/login")
            }}
            className="text-sm text-white hover:underline"
          >
            Logout
          </button>

        </div>

      </div>

      {/* ✅ NAV LINKS */}
      <div className="max-w-4xl mx-auto flex gap-4 px-6 pb-3">

        <Link href="/log-hours" className={linkClass("/log-hours")}>
          File Overtime
        </Link>

        <Link href="/timesheet" className={linkClass("/timesheet")}>
          My Overtime Hours
        </Link>

        <Link href="/admin" className={linkClass("/admin")}>
          Admin
        </Link>

      </div>

    </div>
  )
}
