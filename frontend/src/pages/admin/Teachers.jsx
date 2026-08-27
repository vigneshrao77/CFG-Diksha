import React, { useEffect, useState } from 'react'
import { UserPlus, Trash2, Star } from 'lucide-react'
import DataTable from '../../components/Table/DataTable.jsx'
import Modal from '../../components/Modal/Modal.jsx'
import Spinner from '../../components/Loading/Spinner.jsx'
import { getTeachers, addTeacher, removeTeacher, getSchools } from '../../services/adminService.js'

const ROLES = ['Centre Lead', 'Centre Educator', 'SEL Facilitator', 'Arts Facilitator', 'Science Educator', 'Life Skills Educator', 'Volunteer Educator']
const PROGRAMS = ['sel', 'academics', 'arts', 'lifeskills', 'science']
const QUALIFICATIONS = ['B.Ed', 'M.Ed', 'B.A.', 'M.A.', 'B.Sc.', 'M.Sc.', 'B.F.A.', 'B.Com.', 'MBA', 'M.A. Psychology', 'B.Sc. Physics']

const blankForm = { name: '', role: 'Centre Educator', centre: '', program: 'academics', contact: '', qualification: 'B.Ed' }

export default function Teachers() {
  const [teachers, setTeachers] = useState([])
  const [schools, setSchools] = useState([])
  const [filters, setFilters] = useState({ centre: 'all', status: 'all' })
  const [addOpen, setAddOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState(null)
  const [form, setForm] = useState(blankForm)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  // Fetch schools list for centre dropdowns and ratio calculation
  useEffect(() => {
    getSchools().then(s => {
      setSchools(s)
      if (s.length > 0) {
        setForm(f => ({ ...f, centre: s[0]._id }))
      }
    }).catch(console.error)
  }, [])

  const fetchTeacherData = () => {
    setLoading(true)
    getTeachers(filters)
      .then(t => setTeachers(t))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchTeacherData()
  }, [filters])

  // Student-to-teacher ratio per centre
  const centreRatios = schools.map(s => {
    const assignedTeachers = teachers.filter(t => {
      const centreId = typeof t.centre === 'object' ? t.centre?._id : t.centre
      return centreId === s._id
    })
    const count = assignedTeachers.length
    return {
      name: s.name,
      students: s.students,
      teachers: count,
      ratio: count ? Math.round(s.students / count) : 'N/A',
    }
  })

  async function handleAdd() {
    if (!form.name || !form.centre) return
    setSaving(true)
    try {
      await addTeacher(form)
      fetchTeacherData()
      setAddOpen(false)
      setForm({ ...blankForm, centre: schools[0]?._id || '' })
    } catch (err) {
      alert(`Error adding teacher: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove() {
    if (!removeTarget) return
    try {
      await removeTeacher(removeTarget._id)
      setTeachers(prev => prev.filter(t => t._id !== removeTarget._id))
      setRemoveTarget(null)
    } catch (err) {
      alert(`Error removing teacher: ${err.message}`)
    }
  }

  const centreName = (c) => {
    if (!c) return 'Unassigned'
    if (typeof c === 'object') return c.name
    const found = schools.find(s => s._id === c)
    return found ? found.name : c
  }

  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <div className="avatar avatar-indigo">{val ? val.split(' ').map(w => w[0]).join('').slice(0, 2) : 'T'}</div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--slate-900)' }}>{val}</div>
            <div style={{ fontSize: 11, color: 'var(--slate-500)' }}>{row.qualification}</div>
          </div>
        </div>
      ),
    },
    { key: 'role', label: 'Role', sortable: true },
    {
      key: 'centre',
      label: 'Centre',
      sortable: true,
      render: val => <span style={{ fontSize: 12 }}>{centreName(val)}</span>,
    },
    {
      key: 'program',
      label: 'Program',
      render: val => <span className="chip chip-indigo">{val}</span>,
    },
    {
      key: 'rating',
      label: 'Rating',
      sortable: true,
      render: val => (
        <div className="flex items-center gap-1">
          <Star size={12} style={{ color: 'var(--marigold)', fill: 'var(--marigold)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{val || 5.0}</span>
        </div>
      ),
    },
    {
      key: 'contact',
      label: 'Contact',
      render: val => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--slate-600)' }}>
          {val || 'N/A'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: val => <span className={val === 'Active' ? 'chip chip-green' : 'chip chip-marigold'}>{val}</span>,
    },
    {
      key: '_id',
      label: 'Actions',
      render: (_, row) => (
        <button
          className="btn btn-ghost btn-sm"
          style={{ color: 'var(--kumkum-red)' }}
          onClick={() => setRemoveTarget(row)}
        >
          <Trash2 size={13} /> Remove
        </button>
      ),
    },
  ]

  const centreOptions = [
    { _id: 'all', name: 'All Centres' },
    ...schools,
  ]

  return (
    <div className="page-body">
      <div className="page-header">
        <div>
          <h1 className="page-title">Teachers & Staff</h1>
          <p className="page-subtitle">Manage educators, volunteers, and centre allocations dynamically</p>
        </div>
        <button className="btn btn-primary" onClick={() => setAddOpen(true)}>
          <UserPlus size={15} /> Add Teacher
        </button>
      </div>

      {/* Student-to-Teacher Ratios */}
      <div className="card mb-6">
        <h2 className="section-title">Student : Teacher Ratio by Centre</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 'var(--space-3)' }}>
          {centreRatios.map(c => (
            <div key={c.name} style={{ textAlign: 'center', background: 'var(--slate-50)', borderRadius: 'var(--radius-btn)', padding: 'var(--space-3)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--slate-400)', marginBottom: 4 }}>
                {c.name.replace('Govt. School Partnership ', 'GS ')}
              </div>
              <div className="display-num" style={{ fontSize: 22 }}>{c.ratio}</div>
              <div style={{ fontSize: 11, color: 'var(--slate-500)', marginTop: 2 }}>students per teacher ({c.teachers} staff)</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="form-group">
          <label className="form-label">Centre</label>
          <select className="form-control" value={filters.centre} onChange={e => setFilters(f => ({ ...f, centre: e.target.value }))}>
            {centreOptions.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-control" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <DataTable columns={columns} data={teachers} loading={loading} emptyText="No teachers found." />
      </div>

      {/* Add Teacher Modal */}
      <Modal
        open={addOpen}
        onClose={() => { setAddOpen(false); setForm({ ...blankForm, centre: schools[0]?._id || '' }) }}
        title="Add Teacher / Volunteer"
        size="md"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setAddOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAdd} disabled={!form.name || saving}>
              {saving ? 'Saving…' : 'Add Teacher'}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-control" placeholder="e.g. Priya Sharma" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-control" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Qualification</label>
              <select className="form-control" value={form.qualification} onChange={e => setForm(f => ({ ...f, qualification: e.target.value }))}>
                {QUALIFICATIONS.map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Assigned Centre *</label>
              <select className="form-control" value={form.centre} onChange={e => setForm(f => ({ ...f, centre: e.target.value }))}>
                {schools.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Program</label>
              <select className="form-control" value={form.program} onChange={e => setForm(f => ({ ...f, program: e.target.value }))}>
                {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Contact Number</label>
            <input className="form-control" placeholder="10-digit mobile" value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} />
          </div>
        </div>
      </Modal>

      {/* Remove Confirm Modal */}
      <Modal
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        title="Remove Teacher"
        size="sm"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setRemoveTarget(null)}>Cancel</button>
            <button className="btn btn-destructive" onClick={handleRemove}>Yes, Remove</button>
          </>
        }
      >
        <p style={{ fontSize: 14, color: 'var(--slate-600)' }}>
          Are you sure you want to remove <strong>{removeTarget?.name}</strong> from{' '}
          <strong>{centreName(removeTarget?.centre)}</strong>? This will delete the record from the database.
        </p>
      </Modal>
    </div>
  )
}
