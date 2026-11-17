import { AlertCircle, CheckCircle2, LoaderCircle } from 'lucide-react';

export function LoadingState({ label = 'Loading workspace data' }) { return <div className="state-panel"><LoaderCircle className="spin" size={22} /><span>{label}</span></div>; }
export function ErrorState({ message }) { return <div className="state-panel error-state"><AlertCircle size={22} /><span>{message}</span></div>; }
export function SuccessMessage({ children }) { return <div className="feedback success"><CheckCircle2 size={16} />{children}</div>; }

