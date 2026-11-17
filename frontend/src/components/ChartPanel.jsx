export default function ChartPanel({ title, description, children, className = '' }) {
  return <section className={`chart-panel ${className}`}><div className="panel-heading"><div><h3>{title}</h3>{description && <p>{description}</p>}</div></div>{children}</section>;
}

