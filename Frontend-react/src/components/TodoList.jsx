import TodoItem from './TodoItem'

export default function TodoList({ todos = [], onToggle, onDelete }) {
  return (
    <div className="mt-4 rounded-xl border p-4 text-slate-800 bg-white">
      <p className="font-medium">Danh sách công việc</p>
      {todos.length === 0 ? (
        <p className="text-slate-500 mt-2">Chưa có công việc</p>
      ) : (
        <div className="mt-2 space-y-3">
          {todos.map((t) => (
            <TodoItem key={t.id} todo={t} onToggle={onToggle} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
