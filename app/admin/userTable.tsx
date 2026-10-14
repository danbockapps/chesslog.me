'use client'

import {useMemo, useState} from 'react'

export type AdminCollection = {
  id: string
  displayName: string
  deleted: boolean
  loggedCount: number
}

export type AdminUserRow = {
  id: string
  email: string
  lichessUsername: string | null
  createdAt: string
  totalLoggedCount: number
  lastActivity: string | null
  collections: AdminCollection[]
}

type SortKey = 'lichessUsername' | 'email' | 'totalLoggedCount' | 'createdAt' | 'lastActivity'
type SortDir = 'asc' | 'desc'

const COLUMNS: {key: SortKey; label: string}[] = [
  {key: 'email', label: 'Email'},
  {key: 'lichessUsername', label: 'Lichess username'},
  {key: 'totalLoggedCount', label: 'Logged games'},
  {key: 'createdAt', label: 'Created'},
  {key: 'lastActivity', label: 'Last activity'},
]

function formatDateTime(value: string | null) {
  if (!value) return '—'
  const d = new Date(value)
  if (isNaN(d.getTime())) return value
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function AdminUserTable({rows}: {rows: AdminUserRow[]}) {
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      // Nulls last regardless of direction
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
      return String(av).localeCompare(String(bv)) * dir
    })
  }, [rows, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === 'totalLoggedCount' ? 'desc' : 'asc')
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra">
        <thead>
          <tr>
            {COLUMNS.map(({key, label}) => (
              <th key={key} className="cursor-pointer select-none" onClick={() => toggleSort(key)}>
                {label}
                {sortKey === key && <span className="ml-1">{sortDir === 'asc' ? '▲' : '▼'}</span>}
              </th>
            ))}
            <th>Collections</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((u) => (
            <tr key={u.id}>
              <td>{u.email}</td>
              <td>{u.lichessUsername ?? '—'}</td>
              <td>{u.totalLoggedCount}</td>
              <td suppressHydrationWarning>{formatDateTime(u.createdAt)}</td>
              <td suppressHydrationWarning>{formatDateTime(u.lastActivity)}</td>
              <td>
                {u.collections.length === 0 ? (
                  <span className="text-base-content/40">—</span>
                ) : (
                  <ul className="space-y-1">
                    {u.collections.map((c) => (
                      <li key={c.id} className="text-sm">
                        <a
                          href={`/collections/${c.id}`}
                          className={`link link-hover
                            ${c.deleted ? 'line-through text-base-content/40' : ''}`}
                        >
                          {c.displayName}
                        </a>
                        <span className="ml-2 text-base-content/60">{c.loggedCount}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
