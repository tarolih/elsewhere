export default function Card({ title, subtitle, children }) {
  return (
    <div className="cozy-card rounded-3xl p-4 sm:p-5">
      {title && <h3 className="page-title text-xl font-semibold">{title}</h3>}
      {subtitle && <p className="page-subtitle mt-1 text-sm">{subtitle}</p>}
      <div className="mt-2">{children}</div>
    </div>
  )
}
