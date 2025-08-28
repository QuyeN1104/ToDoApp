export default function TodoItem({ todo, onToggle, onDelete }) {
  const deadlineLabel = (() => {
    try {
      const d = new Date(todo.deadline)
      return d.toLocaleString('vi-VN')
    } catch {
      return todo.deadline
    }
  })()

  return (
    <div className="bg-blue-100 rounded-2xl p-3 flex flex-col gap-3">
      <div className="text-center">
        <label className="font-semibold">Deadline: {deadlineLabel}</label>
        <p className={"text-slate-700 " + (todo.done ? 'line-through text-slate-400' : '')}>{todo.title}</p>
      </div>
      <div className="flex items-center justify-between">
        <label className="inline-flex items-center gap-2 text-slate-700">
          <input
            type="checkbox"
            className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            checked={todo.done}
            onChange={() => onToggle?.(todo.id)}
          />
          <span>Đã hoàn thành</span>
        </label>
        <button
          className="p-2 rounded hover:bg-gray-100 text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          aria-label="Xóa"
          onClick={() => onDelete?.(todo.id)}
        >
          <svg aria-hidden="true" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 6h18"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
