import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ChefHat, ClipboardCheck, PackageOpen, Recycle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getConsumptionTrends, getMeals, getSummary, getWasteTrends, apiMessage } from '../api.js';
import StatCard from '../components/StatCard.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import ChartPanel from '../components/ChartPanel.jsx';
import { ErrorState, LoadingState } from '../components/Feedback.jsx';
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const number = (value) => Number(value || 0).toLocaleString('en-IN');
const dateLabel = (value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

export default function Dashboard() {
  const [state, setState] = useState({ loading: true, error: '', summary: null, waste: [], consumption: [], meals: [] });
  useEffect(() => {
    let mounted = true;
    Promise.all([getSummary(), getWasteTrends(), getConsumptionTrends(), getMeals({ limit: 5, sortBy: 'date', sortOrder: 'desc' })])
      .then(([summary, waste, consumption, meals]) => mounted && setState({ loading: false, error: '', summary: summary.data.data, waste: waste.data.data, consumption: consumption.data.data, meals: meals.data.data }))
      .catch((error) => mounted && setState((current) => ({ ...current, loading: false, error: apiMessage(error) })));
    return () => { mounted = false; };
  }, []);

  const chartData = useMemo(() => state.consumption.slice(-14).map((row) => ({ ...row, label: dateLabel(row.date) })), [state.consumption]);
  const wasteData = useMemo(() => state.waste.slice(-14).map((row) => ({ ...row, label: dateLabel(row.date) })), [state.waste]);
  if (state.loading) return <LoadingState label="Loading the planning pulse" />;
  if (state.error) return <ErrorState message={state.error} />;
  const summary = state.summary || {};
  const latest = summary.latestPrediction;
  return <div className="page-stack">
    <div className="page-intro"><div><p className="eyebrow">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p><h1>Good morning. Here’s the planning pulse.</h1><p className="intro-copy">A quick read on what has been served, what remains, and where the next prep decision needs attention.</p></div><Link to="/predictions" className="button primary"><Sparkles size={17} /> Generate forecast</Link></div>
    <div className="stat-grid">
      <StatCard label="Meals prepared" value={number(summary.prepared)} detail="All recorded services" icon={ChefHat} tone="emerald" />
      <StatCard label="Meals consumed" value={number(summary.consumed)} detail="Across all meal types" icon={ClipboardCheck} tone="blue" />
      <StatCard label="Leftover meals" value={number(summary.leftover)} detail="Measured from records" icon={PackageOpen} tone="amber" />
      <StatCard label="Average waste rate" value={`${Number(summary.wasteRate || 0).toFixed(1)}%`} detail={`${summary.recordCount || 0} meal records`} icon={Recycle} tone="coral" />
    </div>
    <div className="dashboard-grid">
      <ChartPanel title="Consumption vs. forecast" description="Actual consumption and saved prediction outputs share one planning view." className="span-two">
        {chartData.length ? <ResponsiveContainer width="100%" height={270}><LineChart data={chartData} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}><CartesianGrid vertical={false} stroke="#e9eeeb" /><XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#7b8784', fontSize: 11 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: '#7b8784', fontSize: 11 }} /><Tooltip contentStyle={{ border: '1px solid #dce5e1', borderRadius: 10, boxShadow: '0 12px 30px rgba(32, 55, 49, .08)' }} /><Line type="monotone" dataKey="consumed" name="Actual" stroke="#1f4b42" strokeWidth={2.5} dot={false} /><Line type="monotone" dataKey="predicted" name="Forecast" stroke="#0f9f86" strokeWidth={2.5} strokeDasharray="6 5" dot={false} /></LineChart></ResponsiveContainer> : <EmptyChart label="Save records and forecasts to see the comparison." />}
      </ChartPanel>
      <ChartPanel title="Leftover trend" description="Last 14 recorded service days.">
        {wasteData.length ? <ResponsiveContainer width="100%" height={270}><AreaChart data={wasteData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}><defs><linearGradient id="leftoverFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f2b15a" stopOpacity="0.35" /><stop offset="100%" stopColor="#f2b15a" stopOpacity="0.02" /></linearGradient></defs><CartesianGrid vertical={false} stroke="#e9eeeb" /><XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#7b8784', fontSize: 11 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: '#7b8784', fontSize: 11 }} /><Tooltip contentStyle={{ border: '1px solid #dce5e1', borderRadius: 10 }} /><Area type="monotone" dataKey="leftover" name="Leftover meals" stroke="#d38a2a" fill="url(#leftoverFill)" strokeWidth={2.2} /></AreaChart></ResponsiveContainer> : <EmptyChart label="Leftover trend will appear after the first record." />}
      </ChartPanel>
    </div>
    <div className="lower-grid">
      <section className="table-panel"><SectionHeader title="Recent meal records" description="The latest service activity from MongoDB." action={<Link className="text-link" to="/records">View all <ArrowRight size={14} /></Link>} />{state.meals.length ? <div className="table-scroll"><table><thead><tr><th>Date</th><th>Meal</th><th>Prepared</th><th>Consumed</th><th>Leftover</th></tr></thead><tbody>{state.meals.map((meal) => <tr key={meal._id}><td>{dateLabel(meal.date)}</td><td><span className="meal-badge">{meal.mealType}</span></td><td>{number(meal.prepared)}</td><td>{number(meal.consumed)}</td><td><strong className={meal.leftover > meal.prepared * .1 ? 'warn-text' : 'good-text'}>{number(meal.leftover)}</strong></td></tr>)}</tbody></table></div> : <EmptyChart label="No meal records yet. Start with your first service." />}</section>
      <section className="next-action-panel"><div className="next-action-icon"><Sparkles size={20} /></div><p className="eyebrow">Next decision</p><h2>{latest ? `${number(latest.predictedMeals)} meals predicted` : 'No forecast saved yet'}</h2><p>{latest ? `${latest.mealType} · ${dateLabel(latest.predictionDate)} · prepare ${number(latest.recommendedPreparation)} with a ${latest.bufferPercentage}% planning buffer.` : 'Use the prediction workspace to turn attendance and historical demand into a practical prep quantity.'}</p><Link to="/predictions" className="button secondary">Open predictions <ArrowRight size={16} /></Link><small>Planning buffer is guidance, not measured waste.</small></section>
    </div>
  </div>;
}

function EmptyChart({ label }) { return <div className="empty-chart"><div className="empty-chart-line" /><span>{label}</span></div>; }

