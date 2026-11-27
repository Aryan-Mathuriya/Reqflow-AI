import { useState } from 'react'
import { LockKeyhole, Mail, UserRound, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react'

const API_BASE_URL = import.meta.env.PROD ? 'https://reqflow-ai-ouje.onrender.com' : ''

export default function Auth({ onAuthenticated }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/${mode === 'login' ? 'login' : 'register'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'login' ? { email, password } : { name, email, password })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'Authentication failed.')
      onAuthenticated(data.access_token, data.user)
    } catch (err) {
      setError(err.message || 'Unable to connect to the server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-5">
      <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="hidden md:flex flex-col justify-between bg-slate-950 text-white p-10">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center"><Sparkles size={24} /></div>
            <h1 className="text-3xl font-bold mt-8">ReqFlow AI</h1>
            <p className="text-slate-300 mt-3 leading-relaxed">Turn client conversations into clear, structured project requirements.</p>
          </div>
          <div className="space-y-4 text-sm text-slate-300">
            <div className="flex items-center gap-3"><ShieldCheck className="text-blue-400" size={19} /> Private workspace for your analyses</div>
            <div className="flex items-center gap-3"><LockKeyhole className="text-blue-400" size={19} /> Secure account authentication</div>
            <p className="text-xs text-slate-500 pt-6">AI-powered Client Requirement Analyzer</p>
          </div>
        </div>
        <div className="p-7 sm:p-10 md:p-12">
          <div className="md:hidden flex items-center gap-2 text-blue-600 font-bold mb-8"><Sparkles size={20} /> ReqFlow AI</div>
          <p className="text-sm font-semibold text-blue-600">{mode === 'login' ? 'WELCOME BACK' : 'GET STARTED'}</p>
          <h2 className="text-3xl font-bold text-slate-900 mt-2">{mode === 'login' ? 'Sign in to your account' : 'Create your account'}</h2>
          <p className="text-sm text-slate-500 mt-2">{mode === 'login' ? 'Access your personal requirement workspace.' : 'Create a secure workspace for your project analyses.'}</p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            {mode === 'register' && <label className="block text-sm font-medium text-slate-700">Full name<div className="relative mt-2"><UserRound className="absolute left-3 top-3.5 text-slate-400" size={18}/><input required minLength={2} maxLength={80} value={name} onChange={e=>setName(e.target.value)} className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Your name"/></div></label>}
            <label className="block text-sm font-medium text-slate-700">Email address<div className="relative mt-2"><Mail className="absolute left-3 top-3.5 text-slate-400" size={18}/><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="you@example.com"/></div></label>
            <label className="block text-sm font-medium text-slate-700">Password<div className="relative mt-2"><LockKeyhole className="absolute left-3 top-3.5 text-slate-400" size={18}/><input required minLength={mode === 'register' ? 8 : 1} maxLength={128} type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder={mode === 'register' ? 'At least 8 characters' : 'Enter your password'}/></div></label>
            {mode === 'register' && <label className="block text-sm font-medium text-slate-700">Confirm password<div className="relative mt-2"><LockKeyhole className="absolute left-3 top-3.5 text-slate-400" size={18}/><input required type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Re-enter your password"/></div></label>}
            {error && <p className="rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-600">{error}</p>}
            <button disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'} {!loading && <ArrowRight size={17}/>}</button>
          </form>
          <p className="text-sm text-center text-slate-500 mt-7">{mode === 'login' ? "Don't have an account?" : 'Already have an account?'} <button onClick={()=>{setMode(mode === 'login' ? 'register' : 'login');setError('')}} className="font-semibold text-blue-600 hover:text-blue-700">{mode === 'login' ? 'Create account' : 'Sign in'}</button></p>
        </div>
      </div>
    </div>
  )
}
