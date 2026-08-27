import React, { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import './DataTable.css'

/**
 * Props:
 *  columns   array of { key, label, render?, sortable?, width? }
 *  data      array of row objects
 *  emptyText string
 *  loading   bool
 */
export default function DataTable({ columns = [], data = [], emptyText = 'No data', loading = false }) {
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }

  let rows = [...data]
  if (sortKey) {
    rows.sort((a, b) => {
      const av = a[sortKey] ?? ''
      const bv = b[sortKey] ?? ''
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }

  const total = rows.length
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const sliced = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="data-table-wrap">
      {/* Desktop table */}
      <div className="data-table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={col.sortable ? 'sortable' : ''}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <span>{col.label}</span>
                  {col.sortable && (
                    <span className="sort-icons">
                      <ChevronUp size={10} className={sortKey === col.key && sortDir === 'asc' ? 'active' : ''} />
                      <ChevronDown size={10} className={sortKey === col.key && sortDir === 'desc' ? 'active' : ''} />
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={columns.length} className="table-loading">Loading…</td></tr>
            ) : sliced.length === 0 ? (
              <tr><td colSpan={columns.length} className="table-empty">{emptyText}</td></tr>
            ) : sliced.map((row, ri) => (
              <tr key={row.id || ri}>
                {columns.map(col => (
                  <td key={col.key}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <div className="data-cards">
        {loading ? (
          <div className="table-loading">Loading…</div>
        ) : sliced.length === 0 ? (
          <div className="table-empty">{emptyText}</div>
        ) : sliced.map((row, ri) => (
          <div key={row.id || ri} className="data-card">
            {columns.map(col => (
              <div key={col.key} className="data-card-row">
                <span className="data-card-label">{col.label}</span>
                <span className="data-card-value">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="table-pagination">
          <span className="label-mono" style={{ fontSize: 11 }}>
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
          </span>
          <div className="pagination-btns">
            <button
              className="btn btn-secondary btn-sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Prev
            </button>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page === pages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
