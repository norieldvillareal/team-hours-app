"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const pathname = usePathname()
  

  return (
<div className="w-full bg-[#40948d] text-white">
  <div className="max-w-4xl mx-auto flex gap-4 p-4">


<Link
  href="/log-hours"
className={`px-4 py-2 rounded-lg ${
  pathname === "/log-hours"
    ? "bg-[#be95be] text-white font-semibold shadow-md"
    : "text-white hover:bg-white/20"
}`}

>
  File OT Hours
</Link>


        <Link
          href="/timesheet"
className={`px-4 py-2 rounded-lg ${
  pathname === "/timesheet"
    ? "bg-[#be95be] text-white font-semibold shadow-md"
    : "text-white hover:bg-white/20"
}`}

>
          Overview
        </Link>

        <Link
          href="/admin"
className={`px-4 py-2 rounded-lg ${
  pathname === "/admin"
    ? "bg-[#be95be] text-white font-semibold shadow-md"
    : "text-white hover:bg-white/20"
}`}

>
          Admin
        </Link>

      </div>
    </div>
  )
}
