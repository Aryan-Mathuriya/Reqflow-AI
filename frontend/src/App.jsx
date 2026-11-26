import { useEffect, useState } from 'react'


import {

  LayoutDashboard,

  FileText,

  History,

  Upload,

  Download,

  Sparkles,

  ArrowRight,

  CheckCircle2,

  FileSearch,

  Layers,

  Clock3,

  Menu,

  AlertCircle,

  Target,

  Code,

  CalendarDays,

  HelpCircle,

  ListChecks,

  X,

  Trash2,

  RefreshCw,

} from 'lucide-react'



const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

function App() {

  const [requirements, setRequirements] = useState('')

  const [loading, setLoading] = useState(false)

  const [analysis, setAnalysis] = useState(null)

  const [error, setError] = useState('')

  const [selectedFile, setSelectedFile] = useState(null)

  const [uploading, setUploading] = useState(false)

  const [downloading, setDownloading] = useState(false)

  const [currentView, setCurrentView] = useState('dashboard')

  const [history, setHistory] = useState([])

  const [historyLoading, setHistoryLoading] = useState(false)

  const [historyError, setHistoryError] = useState('')

  const [selectedAnalysisId, setSelectedAnalysisId] = useState(null)

  const [stats, setStats] = useState(null)

  const [statsError, setStatsError] = useState('')



  useEffect(() => {

    fetchDashboardStats()

  }, [])



  const features = [

    ['Project Objectives', 'Understand the core business goals.'],

    ['Requirement Extraction', 'Identify functional and non-functional needs.'],

    ['Technical Recommendations', 'Get suitable technology stack suggestions.'],

    ['Project Roadmap', 'Generate milestones and estimated durations.'],

    ['Gap Identification', 'Discover missing information and ambiguities.'],

    ['Clarification Questions', 'Know exactly what to ask your client.'],

  ]



  // Analyze text requirements

  const handleAnalyze = async () => {

    if (!requirements.trim()) return



    setLoading(true)

    setError('')

    setAnalysis(null)



    try {

      const response = await fetch(`${API_BASE_URL}/api/analyze`, {

        method: 'POST',

        headers: {

          'Content-Type': 'application/json',

        },

        body: JSON.stringify({ requirements }),

      })



      const data = await response.json()



      if (!response.ok) {

        throw new Error(data.detail || 'Analysis failed.')

      }



      setAnalysis(data.analysis)

      setSelectedAnalysisId(data.analysis_id ?? null)

      setCurrentView('dashboard')

      fetchHistory()

      fetchDashboardStats()

    } catch (err) {

      setError(err.message || 'Unable to connect to the backend.')

    } finally {

      setLoading(false)

    }

  }



  // Upload and analyze PDF/DOCX

  const handleUpload = async () => {

    if (!selectedFile) return



    setUploading(true)

    setError('')

    setAnalysis(null)



    const formData = new FormData()

    formData.append('file', selectedFile)



    try {

      const response = await fetch(

        `${API_BASE_URL}/api/upload-document`,

        {

          method: 'POST',

          body: formData,

        }

      )



      const data = await response.json()



      if (!response.ok) {

        throw new Error(data.detail || 'Document processing failed.')

      }



      setAnalysis(data.analysis)

      setSelectedAnalysisId(data.analysis_id ?? null)

      setCurrentView('dashboard')

      fetchHistory()

      fetchDashboardStats()

      setRequirements(data.extracted_text || '')

    } catch (err) {

      setError(err.message || 'Unable to process the document.')

    } finally {

      setUploading(false)

    }

  }



  // Download generated PDF report

  const handleDownloadPDF = async () => {

    if (!analysis) return



    setDownloading(true)

    setError('')



    try {

      const response = await fetch(

        `${API_BASE_URL}/api/download-report`,

        {

          method: 'POST',

          headers: {

            'Content-Type': 'application/json',

          },

          body: JSON.stringify(analysis),

        }

      )



      if (!response.ok) {

        const data = await response.json()

        throw new Error(data.detail || 'Failed to generate PDF report.')

      }



      const blob = await response.blob()

      const url = window.URL.createObjectURL(blob)



      const link = document.createElement('a')

      link.href = url

      link.download = 'ReqFlow_AI_Analysis_Report.pdf'



      document.body.appendChild(link)

      link.click()

      link.remove()



      window.URL.revokeObjectURL(url)

    } catch (err) {

      setError(err.message || 'Unable to download PDF.')

    } finally {

      setDownloading(false)

    }

  }



  // Retrieve dashboard statistics

  const fetchDashboardStats = async () => {

    setStatsError('')

    try {

      const response = await fetch(`${API_BASE_URL}/api/dashboard-stats`)

      const data = await response.json()

      if (!response.ok) throw new Error(data.detail || 'Unable to load dashboard statistics.')

      setStats(data.stats)

    } catch (err) {

      setStatsError(err.message || 'Unable to load dashboard statistics.')

    }

  }



  const formatTimeSaved = (minutes) => {

    if (minutes == null) return '—'

    if (minutes < 60) return `${minutes} min`

    const hours = Math.floor(minutes / 60)

    const remainingMinutes = minutes % 60

    return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`

  }



  // Retrieve saved analyses

  const fetchHistory = async () => {

    setHistoryLoading(true)

    setHistoryError('')

    try {

      const response = await fetch(`${API_BASE_URL}/api/history`)

      const data = await response.json()

      if (!response.ok) throw new Error(data.detail || 'Unable to load analysis history.')

      setHistory(data.history || [])

    } catch (err) {

      setHistoryError(err.message || 'Unable to connect to the backend.')

    } finally {

      setHistoryLoading(false)

    }

  }



  // Open a previously saved analysis

  const openHistoryAnalysis = async (analysisId) => {

    setHistoryError('')

    try {

      const response = await fetch(`${API_BASE_URL}/api/history/${analysisId}`)

      const data = await response.json()

      if (!response.ok) throw new Error(data.detail || 'Unable to open saved analysis.')

      setAnalysis(data.analysis.analysis_data)

      setSelectedAnalysisId(analysisId)

      setCurrentView('dashboard')

      setError('')

    } catch (err) {

      setHistoryError(err.message || 'Unable to open saved analysis.')

    }

  }



  // Delete a saved analysis

  const removeHistoryAnalysis = async (analysisId) => {

    if (!window.confirm('Are you sure you want to delete this analysis?')) return

    try {

      const response = await fetch(`${API_BASE_URL}/api/history/${analysisId}`,  {

        method: 'DELETE'

      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.detail || 'Unable to delete analysis.')

      setHistory((previous) => previous.filter((item) => item.id !== analysisId))

      fetchDashboardStats()

      if (selectedAnalysisId === analysisId) {

        setAnalysis(null)

        setSelectedAnalysisId(null)

      }

    } catch (err) {

      setHistoryError(err.message || 'Unable to delete analysis.')

    }

  }



  const showHistory = () => {

    setCurrentView('history')

    setAnalysis(null)

    fetchHistory()

  }



  // Reset workspace

  const resetAnalysis = () => {

    setAnalysis(null)

    setError('')

    setRequirements('')

    setSelectedFile(null)

    setSelectedAnalysisId(null)

    setCurrentView('dashboard')

  }



  const SectionHeading = ({ icon: Icon, title }) => (

    <div className="flex items-center gap-3 mb-5">

      <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">

        <Icon size={19} />

      </div>

      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>

    </div>

  )



  return (

    <div className="min-h-screen bg-slate-50 text-slate-800 flex">



      {/\* Sidebar \*/}

      <aside className="w-64 border-r border-slate-200 bg-white p-6 hidden md:flex flex-col shrink-0">



        <div className="flex items-center gap-3 mb-12">

          <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center">

            <Layers size={22} />

          </div>

          <div>

            <h1 className="text-xl font-bold">ReqFlow AI</h1>

            <p className="text-xs text-slate-400">Requirement Intelligence</p>

          </div>

        </div>



        <p className="text-xs uppercase tracking-widest text-slate-400 mb-4">

          Workspace

        </p>



        <nav className="space-y-2">

          <button

            onClick={resetAnalysis}

            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 text-blue-600 font-medium"

          >

            <LayoutDashboard size={19} />

            Dashboard

          </button>



          <button

            onClick={resetAnalysis}

            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${

              currentView === 'dashboard' && !analysis

                ? 'bg-blue-50 text-blue-600'

                : 'text-slate-500 hover:bg-slate-50'

            }`}

          >

            <FileText size={19} />

            New Analysis

          </button>



          <button

            onClick={showHistory}

            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${

              currentView === 'history' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'

            }`}

          >

            <History size={19} />

            Analysis History

          </button>

        </nav>





        <div className="mt-auto rounded-2xl border border-blue-100 bg-blue-50 p-4">

          <div className="flex items-center gap-2 text-blue-600 mb-2">

            <Sparkles size={17} />

            <span className="text-sm font-semibold">Powered by AI</span>

          </div>

          <p className="text-xs text-slate-500 leading-relaxed">

            Transform unstructured client conversations into structured project requirements.

          </p>

        </div>

      </aside>



      {/\* Main Content \*/}

      <main className="flex-1 min-w-0">



        {/\* Header \*/}

        <header className="h-20 border-b border-slate-200 bg-white flex items-center justify-between px-6 md:px-10">

          <div>

            <div className="flex items-center gap-2">

              <Menu className="md:hidden text-slate-500" />

              <h2 className="text-lg font-semibold">{currentView === 'history' ? 'Analysis History' : 'Dashboard'}</h2>

            </div>

            <p className="text-xs text-slate-400 mt-1">

              Your intelligent project analysis workspace

            </p>

          </div>



        </header>



        <div className="max-w-6xl mx-auto p-6 md:p-10">



          {currentView === 'history' ? (

            <div className="space-y-6">

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                <div>

                  <h1 className="text-3xl font-bold">Analysis History</h1>

                  <p className="text-slate-500 mt-2">View and reopen your previously saved project analyses.</p>

                </div>

                <button

                  onClick={fetchHistory}

                  disabled={historyLoading}

                  className="flex items-center justify-center gap-2 border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"

                >

                  <RefreshCw size={16} className={historyLoading ? 'animate-spin' : ''} />

                  Refresh

                </button>

              </div>



              {historyError && (

                <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-4 text-red-600 text-sm">

                  <AlertCircle size={19} className="shrink-0" />

                  <p>{historyError}</p>

                </div>

              )}



              {historyLoading ? (

                <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-sm text-slate-500">Loading your saved analyses...</div>

              ) : history.length === 0 ? (

                <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">

                  <History size={32} className="mx-auto text-slate-300 mb-3" />

                  <h3 className="font-semibold text-slate-700">No saved analyses yet</h3>

                  <p className="text-sm text-slate-500 mt-2">Your completed analyses will appear here.</p>

                  <button onClick={resetAnalysis} className="mt-5 bg-blue-500 text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-blue-600">Create New Analysis</button>

                </div>

              ) : (

                <div className="space-y-3">

                  {history.map((item) => (

                    <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                      <div className="min-w-0">

                        <div className="flex items-center gap-2">

                          <FileText size={18} className="text-blue-500 shrink-0" />

                          <h3 className="font-semibold text-slate-800 truncate">{item.project_name}</h3>

                        </div>

                        <p className="text-sm text-slate-500 mt-2 line-clamp-2">{item.project_summary || 'No project summary available.'}</p>

                        <p className="text-xs text-slate-400 mt-2">Saved: {new Date(item.created_at).toLocaleString()} · ID: {item.id}</p>

                      </div>

                      <div className="flex items-center gap-2 shrink-0">

                        <button onClick={() => openHistoryAnalysis(item.id)} className="flex items-center gap-2 bg-blue-500 text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-blue-600">

                          <FileSearch size={15} /> Open

                        </button>

                        <button onClick={() => removeHistoryAnalysis(item.id)} title="Delete analysis" className="p-2.5 rounded-xl border border-red-100 text-red-500 hover:bg-red-50">

                          <Trash2 size={17} />

                        </button>

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </div>

          ) : (

            <>

          {/\* Welcome \*/}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">

            <div>

              <h1 className="text-3xl font-bold">

                Turn conversations into{' '}

                <span className="text-blue-500">clarity.</span>

              </h1>

              <p className="text-slate-500 mt-2">

                Extract requirements, discover project needs and plan smarter.

              </p>

            </div>



            <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-full w-fit">

              <CheckCircle2 size={15} />

              AI Engine Ready

            </div>

          </div>



          {/\* Statistics \*/}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">

            {[

              { label: 'Analyses Created', value: stats ? stats.total_analyses : '—', icon: FileSearch },

              { label: 'Documents Processed', value: stats ? stats.documents_processed : '—', icon: FileText },

              { label: 'Time Saved', value: stats ? formatTimeSaved(stats.time_saved_minutes) : '—', icon: Clock3 },

            ].map((item) => {

              const Icon = item.icon

              return (

                <div key={item.label} className="border border-slate-200 bg-white rounded-2xl p-5 shadow-sm">

                  <div className="flex justify-between items-center">

                    <p className="text-sm text-slate-500">{item.label}</p>

                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">

                      <Icon size={19} />

                    </div>

                  </div>

                  <h3 className="text-2xl font-bold mt-4">{item.value}</h3>

                </div>

              )

            })}

          </div>

          {statsError && (

            <div className="-mt-6 mb-8 flex items-center justify-between gap-3 rounded-xl border border-amber-100 bg-amber-50 p-3 text-sm text-amber-700">

              <span>{statsError}</span>

              <button onClick={fetchDashboardStats} className="font-semibold underline">Retry</button>

            </div>

          )}

          <p className="-mt-6 mb-8 text-xs text-slate-400">Time saved is an estimate based on 30 minutes per completed analysis.</p>



          {/\* Analysis Input \*/}

          {!analysis && (

            <div className="border border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden">

              <div className="p-6 border-b border-slate-100">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">

                    <Sparkles size={21} />

                  </div>

                  <div>

                    <h2 className="font-semibold text-lg">

                      New Requirement Analysis

                    </h2>

                    <p className="text-sm text-slate-400">

                      Provide client requirements to get started.

                    </p>

                  </div>

                </div>

              </div>



              <div className="p-6">

                <label className="block text-sm font-medium mb-3">

                  Client Requirements

                </label>



                <textarea

                  value={requirements}

                  onChange={(e) => setRequirements(e.target.value)}

                  placeholder="Paste your client conversation, project brief, meeting notes or requirements here..."

                  className="w-full min-h-52 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-y"

                />



                <div className="flex justify-between text-xs text-slate-400 mt-2">

                  <span>Be as detailed as possible for better results.</span>

                  <span>{requirements.length} characters</span>

                </div>



                {/\* Document Upload \*/}

                <div className="mt-5 border border-dashed border-blue-200 bg-blue-50/50 rounded-xl p-5">

                  <div className="flex items-center gap-3">

                    <Upload size={21} className="text-blue-500" />

                    <div>

                      <p className="text-sm font-medium text-slate-700">

                        Upload client document

                      </p>

                      <p className="text-xs text-slate-400 mt-1">

                        PDF or DOCX files supported

                      </p>

                    </div>

                  </div>



                  <input

                    type="file"

                    accept=".pdf,.docx"

                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}

                    className="mt-4 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"

                  />



                  {selectedFile && (

                    <div className="flex items-center justify-between mt-3 text-sm">

                      <span className="text-slate-600 truncate">{selectedFile.name}</span>

                      <button onClick={() => setSelectedFile(null)}>

                        <X size={17} className="text-slate-400" />

                      </button>

                    </div>

                  )}



                  {selectedFile && (

                    <button

                      onClick={handleUpload}

                      disabled={uploading || loading}

                      className="mt-4 w-full bg-white border border-blue-200 text-blue-600 rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-50 disabled:opacity-50"

                    >

                      {uploading ? 'Processing document...' : 'Upload & Analyze Document'}

                    </button>

                  )}

                </div>



                <button

                  onClick={handleAnalyze}

                  disabled={!requirements.trim() || loading || uploading}

                  className="w-full mt-5 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl px-5 py-3.5 text-sm font-semibold shadow-sm transition"

                >

                  <Sparkles size={17} />

                  {loading ? 'Analyzing Requirements...' : 'Analyze Requirements'}

                  {!loading && <ArrowRight size={17} />}

                </button>



                {(loading || uploading) && (

                  <p className="text-center text-sm text-blue-500 mt-4">

                    AI is processing your information. This may take a few moments...

                  </p>

                )}



                {error && (

                  <div className="mt-5 flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-4 text-red-600 text-sm">

                    <AlertCircle size={19} className="shrink-0" />

                    <p>{error}</p>

                  </div>

                )}

              </div>

            </div>

          )}



          {/\* Analysis Results \*/}

          {analysis && (

            <div className="space-y-6">



              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">

                <div>

                  <h2 className="text-2xl font-bold">Analysis Results</h2>

                  <p className="text-sm text-slate-500 mt-1">

                    AI-generated project requirement report

                  </p>

                </div>



                <div className="flex flex-wrap gap-2">

                  <button

                    onClick={handleDownloadPDF}

                    disabled={downloading}

                    className="flex items-center justify-center gap-2 border border-blue-200 text-blue-600 bg-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-blue-50 disabled:opacity-50"

                  >

                    <Download size={16} />

                    {downloading ? 'Generating PDF...' : 'Download PDF'}

                  </button>



                  <button

                    onClick={resetAnalysis}

                    className="flex items-center gap-2 bg-blue-500 text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-blue-600"

                  >

                    <Upload size={16} />

                    New Analysis

                  </button>

                </div>

              </div>



              {error && (

                <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-4 text-red-600 text-sm">

                  <AlertCircle size={19} className="shrink-0" />

                  <p>{error}</p>

                </div>

              )}



              {/\* Project Overview \*/}

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

                <p className="text-xs font-semibold uppercase tracking-wider text-blue-500 mb-2">

                  Project Overview

                </p>

                <h3 className="text-2xl font-bold">{analysis.project_name}</h3>

                <p className="text-sm text-slate-600 mt-3 leading-relaxed">

                  {analysis.project_summary}

                </p>

              </div>



              {/\* Objectives \*/}

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

                <SectionHeading icon={Target} title="Project Objectives" />

                <div className="space-y-3">

                  {analysis.objectives?.map((item, index) => (

                    <div key={index} className="flex gap-3 text-sm text-slate-600">

                      <CheckCircle2 size={18} className="text-blue-500 shrink-0 mt-0.5" />

                      <span>{item.objective}</span>

                    </div>

                  ))}

                </div>

              </div>



              {/\* Functional Requirements \*/}

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

                <SectionHeading icon={ListChecks} title="Functional Requirements" />

                <div className="grid sm:grid-cols-2 gap-4">

                  {analysis.functional_requirements?.map((item, index) => (

                    <div key={index} className="rounded-xl border border-slate-100 bg-slate-50 p-4">

                      <div className="flex justify-between gap-2">

                        <h4 className="text-sm font-semibold">{item.feature}</h4>

                        <span className="text-xs text-blue-600 bg-blue-50 rounded-full px-2 py-1 h-fit">

                          {item.priority}

                        </span>

                      </div>

                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">

                        {item.description}

                      </p>

                    </div>

                  ))}

                </div>

              </div>



              {/\* Non-functional Requirements \*/}

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

                <SectionHeading icon={CheckCircle2} title="Non-Functional Requirements" />

                <div className="grid sm:grid-cols-2 gap-4">

                  {analysis.non_functional_requirements?.map((item, index) => (

                    <div key={index} className="rounded-xl border border-slate-100 bg-slate-50 p-4">

                      <h4 className="text-sm font-semibold">{item.feature}</h4>

                      <p className="text-xs text-slate-500 mt-2">{item.description}</p>

                      <span className="inline-block mt-3 text-xs text-blue-600">

                        Priority: {item.priority}

                      </span>

                    </div>

                  ))}

                </div>

              </div>



              {/\* Technical Requirements \*/}

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

                <SectionHeading icon={Code} title="Technical Requirements" />

                <div className="space-y-3">

                  {analysis.technical_requirements?.map((item, index) => (

                    <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 last:border-0">

                      <span className="text-sm text-slate-700">{item.requirement}</span>

                      <span className="text-xs text-blue-600 bg-blue-50 rounded-full px-3 py-1 w-fit">

                        {item.category}

                      </span>

                    </div>

                  ))}

                </div>

              </div>



              {/\* Technology Stack \*/}

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

                <SectionHeading icon={Layers} title="Recommended Technology Stack" />

                <div className="grid sm:grid-cols-2 gap-4">

                  {analysis.recommended_stack?.map((item, index) => (

                    <div key={index} className="border border-slate-100 rounded-xl p-4">

                      <h4 className="font-semibold text-sm text-blue-600">{item.technology}</h4>

                      <p className="text-xs text-slate-500 mt-1">{item.purpose}</p>

                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">{item.reason}</p>

                    </div>

                  ))}

                </div>

              </div>



              {/\* Milestones \*/}

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

                <SectionHeading icon={CalendarDays} title="Project Milestones" />

                <div className="space-y-5">

                  {analysis.milestones?.map((item, index) => (

                    <div key={index} className="flex gap-4">

                      <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 text-sm font-semibold">

                        {index + 1}

                      </div>

                      <div className="flex-1 border-b border-slate-100 pb-4">

                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1">

                          <h4 className="text-sm font-semibold">{item.milestone}</h4>

                          <span className="text-xs text-blue-600">{item.duration}</span>

                        </div>

                        <p className="text-xs text-slate-400 mt-2">Deliverables</p>

                        <ul className="mt-2 space-y-1">

                          {item.deliverables?.map((deliverable, i) => (

                            <li key={i} className="text-xs text-slate-500 flex gap-2">

                              <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />

                              {deliverable}

                            </li>

                          ))}

                        </ul>

                      </div>

                    </div>

                  ))}

                </div>

              </div>



              {/\* Clarification Questions \*/}

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

                <SectionHeading icon={HelpCircle} title="Clarification Questions" />

                <div className="space-y-4">

                  {analysis.clarification_questions?.map((item, index) => (

                    <div key={index} className="bg-amber-50/70 border border-amber-100 rounded-xl p-4">

                      <p className="text-sm font-medium text-slate-700">

                        {index + 1}. {item.question}

                      </p>

                      <p className="text-xs text-slate-500 mt-2">

                        Why this matters: {item.reason}

                      </p>

                    </div>

                  ))}

                  {analysis.clarification_questions?.length === 0 && (

                    <p className="text-sm text-slate-500">

                      No clarification questions were identified.

                    </p>

                  )}

                </div>

              </div>



              <div className="text-center text-xs text-slate-400 py-4">

                Analysis generated by ReqFlow AI

              </div>

            </div>

          )}



          {/\* Features \*/}

          {!analysis && (

            <div className="mt-10">

              <h2 className="font-semibold text-lg mb-5">

                What ReqFlow AI delivers

              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                {features.map(([title, description]) => (

                  <div key={title} className="border border-slate-200 bg-white rounded-xl p-5 shadow-sm hover:border-blue-200 hover:shadow-md transition">

                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center mb-4">

                      <CheckCircle2 size={18} />

                    </div>

                    <h3 className="font-medium text-sm">{title}</h3>

                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">

                      {description}

                    </p>

                  </div>

                ))}

              </div>

            </div>

          )}



            </>

          )}



          <footer className="text-center text-xs text-slate-400 mt-12 pb-4">

            ReqFlow AI · Intelligent Requirement Analysis

          </footer>



        </div>

      </main>

    </div>

  )

}



export default App