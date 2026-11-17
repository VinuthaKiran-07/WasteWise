import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

export default function StatCard({ label, value, detail, icon: Icon, tone = 'emerald', trend }) {
  const TrendIcon = trend > 0 ? ArrowUpRight : trend < 0 ? ArrowDownRight : Minus;
  return <article className={`stat-card tone-${tone}`}><div className="stat-card-top"><span className="stat-label">{label}</span><span className="stat-icon"><Icon size={18} /></span></div><div className="stat-value">{value}</div><div className="stat-detail">{trend !== undefined && <span className={`trend ${trend >= 0 ? 'positive' : 'negative'}`}><TrendIcon size={13} /> {Math.abs(trend)}%</span>}<span>{detail}</span></div></article>;
}

