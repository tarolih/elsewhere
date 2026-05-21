export default function Card({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      {title && <h3 className="text-lg font-semibold">{title}</h3>}
      {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      <div className="mt-2">{children}</div>
    </div>
  )
}
