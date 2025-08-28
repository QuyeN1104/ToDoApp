import { useEffect, useMemo, useState } from 'react'

export default function ControlBar({ onAdd, onSearch, searchTerm = '', resultsCount = 0, disabled = false }) {
  const [title, setTitle] = useState('')
  const [deadline, setDeadline] = useState('')
  const [query, setQuery] = useState('')
  const [titleErr, setTitleErr] = useState('')
  const [deadlineErr, setDeadlineErr] = useState('')

  useEffect(() => {
    setQuery(searchTerm)
  }, [searchTerm])

  const validate = useMemo(() => ({
    title(value) {
      if (!value || !value.trim()) return 'Vui lòng nhập nội dung công việc'
      if (value.trim().length > 200) return 'Nội dung quá dài (tối đa 200 ký tự)'
      return ''
    },
    deadline(value) {
      if (!value) return ''
      const t = Date.parse(value)
      if (Number.isNaN(t)) return 'Định dạng thời gian không hợp lệ'
      return ''
    },
  }), [])

  const handleAdd = () => {
    if (disabled) return
    const tErr = validate.title(title)
    const dErr = validate.deadline(deadline)
    setTitleErr(tErr)
    setDeadlineErr(dErr)
    if (tErr || dErr) return
    onAdd?.(title, deadline)
    setTitle('')
    setDeadline('')
  }

  const handleSearch = () => {
    if (disabled) return
    onSearch?.(query)
  }

  const handleClearSearch = () => {
    setQuery('')
    onSearch?.('')
  }

  return (
    <div className="rounded-xl border p-4 text-slate-800 bg-white">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Công việc</span>
            <input
              type="text"
              placeholder="Nhập nội dung..."
              className={`rounded border px-3 py-2 outline-none focus:ring-2 ${titleErr ? 'border-red-400 focus:ring-red-500' : 'focus:ring-blue-500'}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              disabled={disabled}
            />
            {titleErr && <span className="text-sm text-red-600">{titleErr}</span>}
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Hạn chót</span>
            <input
              type="datetime-local"
              className={`rounded border px-3 py-2 outline-none focus:ring-2 ${deadlineErr ? 'border-red-400 focus:ring-red-500' : 'focus:ring-blue-500'}`}
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              disabled={disabled}
            />
            {deadlineErr && <span className="text-sm text-red-600">{deadlineErr}</span>}
          </label>
        </div>
        <div className="flex flex-col md:flex-row gap-2 md:items-end">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Tìm kiếm</span>
            <input
              type="text"
              placeholder="Nhập từ khóa..."
              className="rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch()
                if (e.key === 'Escape') handleClearSearch()
              }}
              disabled={disabled}
            />
          </label>
          <div className="flex gap-2">
            <button className={`shadow rounded-2xl px-4 py-2 border ${disabled ? 'bg-blue-50/50 text-blue-300 cursor-not-allowed' : 'bg-blue-50 text-blue-700'}`} onClick={handleAdd} disabled={disabled}>
              Thêm
            </button>
            <button className={`shadow rounded-2xl px-4 py-2 border ${disabled ? 'bg-gray-50/50 text-gray-400 cursor-not-allowed' : 'bg-gray-50 text-gray-700'}`} onClick={handleSearch} disabled={disabled}>
              Tìm kiếm
            </button>
            {searchTerm && (
              <button className={`shadow rounded-2xl px-4 py-2 border ${disabled ? 'bg-red-50/50 text-red-300 cursor-not-allowed' : 'bg-red-50 text-red-700'}`} onClick={handleClearSearch} disabled={disabled}>
                Xóa tìm
              </button>
            )}
          </div>
        </div>
      </div>
      {searchTerm && (
        <div className="text-sm text-slate-600 mt-2">
          Đang lọc theo: <span className="font-medium">"{searchTerm}"</span> — {resultsCount} kết quả
        </div>
      )}
    </div>
  )
}

