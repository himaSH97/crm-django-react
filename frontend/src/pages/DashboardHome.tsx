import { useEffect, useState } from 'react'
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Building2,
  Check, RefreshCw, Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getCompanies, type Company } from '@/features/companies/api'

export function DashboardPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [companyCount, setCompanyCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    void getCompanies({ page: 1, page_size: 6, ordering: '-created_at' })
      .then((result) => {
        if (!active) return
        setCompanies(result.results)
        setCompanyCount(result.count)
        setError('')
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Your company directory could not be loaded.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [reloadKey])

  function refreshCompanies() {
    setLoading(true)
    setReloadKey((key) => key + 1)
  }

  const latestCompany = companies[0]
  const latestAdded = latestCompany
    ? new Date(latestCompany.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : 'No additions yet'

  return (
    <div className="mx-auto w-full max-w-[1380px] px-[15px] pb-5 pt-6 sm:px-7 sm:pt-9 lg:px-[clamp(22px,4vw,56px)]">
          <section className="mb-6 flex items-end justify-between gap-4">
            <div><div className="mb-2 flex items-center gap-2 text-[10px] font-semibold tracking-widest text-[#718078]"><span className="size-1.5 rotate-45 rounded-[2px] bg-[#c18449]" /> YOUR OPERATIONS AT A GLANCE</div><h1 className="m-0 font-serif text-[27px] font-normal leading-tight text-[#25332e] sm:text-[32px]">Workspace overview</h1><p className="mt-1.5 text-xs text-[#828c85] sm:text-[13px]">Your company network, all in one place.</p></div>
          </section>

          {error && <div className="mb-4 flex items-center justify-between gap-3 rounded border border-[#eed8ca] bg-[#fff8f3] px-3.5 py-2.5 text-xs text-[#814a34]" role="alert"><span>{error}</span><button className="inline-flex shrink-0 items-center gap-1.5" type="button" onClick={refreshCompanies}><RefreshCw size={15} /> Retry</button></div>}

          <section className="mb-[19px] grid grid-cols-2 gap-2.5 sm:gap-3.5 lg:grid-cols-[1.15fr_1fr_1fr]" aria-label="Workspace metrics">
            <article className="relative col-span-2 min-h-[126px] overflow-hidden rounded-md border border-[#d6e3d6] bg-gradient-to-br from-[#edf3e8] via-[#f3f5e9] to-[#e6eee2] p-3.5 sm:min-h-[137px] sm:p-[17px] lg:col-span-1">
              <div className="relative z-10 flex items-center justify-between text-[8px] font-semibold tracking-wide text-[#77837b] sm:text-[9px]"><span>COMPANIES IN DIRECTORY</span><span className="grid size-[26px] place-items-center rounded bg-[#eaf2e8] text-[#39725c] sm:size-[29px]"><Building2 size={17} /></span></div>
              <div className="relative z-10 mt-2 text-[27px] font-medium leading-none tabular-nums text-[#25362f] sm:text-[31px]">{loading ? '–' : companyCount.toLocaleString()}</div>
              <div className="relative z-10 mt-1.5 flex items-center gap-1.5 text-[10px] text-[#7d8880] sm:text-[11px]"><span className="size-1.5 rounded-full bg-[#8ba578]" /> Across your company network</div>
              <div className="absolute bottom-0 right-3 flex h-[39px] items-end gap-1 opacity-40" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <span key={index} className={`w-[7px] rounded-t-[3px] border border-b-0 border-[#71977b] bg-[#c6d8b9] ${index % 3 === 0 ? 'h-[19px]' : index % 3 === 1 ? 'h-[30px]' : 'h-[25px]'}`} />)}</div>
            </article>
            <article className="min-h-[126px] rounded-md border border-[#e5eae4] bg-white p-3.5 sm:min-h-[137px] sm:p-[17px]"><div className="flex items-center justify-between text-[8px] font-semibold tracking-wide text-[#77837b] sm:text-[9px]"><span>LATEST ADDITION</span><span className="grid size-[26px] place-items-center rounded bg-[#e9f4ed] text-[#3f8868] sm:size-[29px]"><ArrowDownRight size={17} /></span></div><div className="mt-2 text-[19px] font-medium leading-tight text-[#25362f] sm:text-[23px]">{loading ? 'Loading…' : latestAdded}</div><div className="mt-1.5 truncate text-[10px] text-[#7d8880] sm:text-[11px]">{latestCompany?.name ?? (loading ? 'Checking your directory' : 'Add your first company')}</div></article>
            <article className="min-h-[126px] rounded-md border border-[#e5eae4] bg-white p-3.5 sm:min-h-[137px] sm:p-[17px]"><div className="flex items-center justify-between text-[8px] font-semibold tracking-wide text-[#77837b] sm:text-[9px]"><span>DIRECTORY STATUS</span><span className="grid size-[26px] place-items-center rounded bg-[#f7f0e5] text-[#a36c37] sm:size-[29px]"><Check size={17} /></span></div><div className="mt-2 text-[19px] font-medium leading-tight text-[#25362f] sm:text-2xl">{loading ? 'Checking' : error ? 'Unavailable' : 'Connected'}</div><div className="mt-1.5 text-[10px] text-[#7d8880] sm:text-[11px]">Company data is up to date</div></article>
          </section>

          <section className="grid items-start gap-3.5 lg:grid-cols-[minmax(0,1.75fr)_minmax(230px,.9fr)] lg:gap-[17px]">
            <div className="min-w-0 rounded-md border border-[#e5eae4] bg-white">
              <div className="flex min-h-[72px] items-center justify-between gap-3.5 border-b border-[#edf0ed] px-3.5 py-3.5 sm:px-[17px]"><div><div className="mb-0.5 text-[9px] font-semibold tracking-wide text-[#9a7c59]">YOUR NETWORK</div><h2 className="m-0 text-[15px] font-semibold text-[#2d3a34]">Recently added</h2></div><div className="flex items-center gap-2"><button className="grid size-[30px] place-items-center rounded text-[#7a8580] hover:bg-[#f8faf7] hover:text-[#286b55] disabled:opacity-50" type="button" onClick={refreshCompanies} aria-label="Refresh companies" title="Refresh companies" disabled={loading}><RefreshCw size={16} /></button><Link className="inline-flex items-center gap-1 whitespace-nowrap text-[11px] font-medium text-[#39735b] hover:text-[#244c3d]" to="/companies">View all <ArrowRight size={15} /></Link></div></div>
              <div className="min-h-[98px]">
                {loading && <div className="grid min-h-[98px] place-items-center text-xs text-[#939d96]">Loading your company directory…</div>}
                {!loading && !error && companies.length === 0 && <div className="flex min-h-[188px] flex-col items-center justify-center p-[22px] text-center"><span className="mb-2.5 grid size-[38px] place-items-center rounded-md bg-[#edf4e9] text-[#4c7c61]"><Building2 size={20} /></span><strong className="text-[13px] font-semibold text-[#34433a]">Your network starts here</strong><span className="mt-1 text-[11px] text-[#929d95]">Add a company to begin building your directory.</span><Link className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-[#39735b]" to="/companies">Open companies <ArrowRight size={14} /></Link></div>}
                {!loading && companies.map((company, index) => <Link className="grid min-h-[61px] grid-cols-[32px_minmax(0,1fr)_minmax(55px,.4fr)_14px] items-center gap-2 border-b border-[#f0f2ef] px-3 py-2 last:border-0 hover:bg-[#f8faf7] sm:grid-cols-[34px_minmax(0,1fr)_minmax(80px,.45fr)_18px] sm:gap-[11px] sm:px-[17px]" to={`/companies/${encodeURIComponent(company.id)}`} key={company.id}><span className={`grid size-8 place-items-center rounded-[5px] font-serif text-[15px] ${['bg-[#e7f0e4] text-[#35644d]', 'bg-[#f4ebdf] text-[#835b38]', 'bg-[#e5eff0] text-[#476d70]', 'bg-[#efe8ee] text-[#745b71]'][index % 4]}`}>{company.name.trim().charAt(0).toUpperCase()}</span><span className="flex min-w-0 flex-col gap-0.5"><strong className="truncate text-xs font-medium text-[#334139]">{company.name}</strong><span className="truncate text-[10px] text-[#9aa29c]">{company.industry || 'Industry not specified'}</span></span><span className="truncate text-[10px] text-[#7e8981] sm:text-[11px]">{company.country || '—'}</span><span className="grid place-items-center text-[#a8b1aa]"><ArrowUpRight size={15} /></span></Link>)}
              </div>
              {!loading && companies.length > 0 && <div className="border-t border-[#edf0ed] px-[17px] py-2.5 text-[10px] text-[#9aa39d]">Showing {companies.length} of {companyCount.toLocaleString()} companies</div>}
            </div>

            <aside className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-md border border-[#e6e9e2] bg-white px-4 pb-2 pt-[17px]">
                <div className="flex items-center gap-2 text-[9px] font-semibold tracking-wide text-[#8b8a78]"><span className="grid size-[25px] place-items-center rounded bg-[#f5f0e4] text-[#a17842]"><Sparkles size={16} /></span> QUICK ACCESS</div>
                <h2 className="mb-0 mt-[13px] font-serif text-xl font-normal text-[#2e3a33]">Keep things moving.</h2><p className="mb-3 mt-1 text-[11px] text-[#8b958e]">Pick up where your team left off.</p>
                <Link className="flex min-h-[57px] items-center gap-2.5 border-t border-[#eff1ed]" to="/companies"><span className="grid size-[30px] shrink-0 place-items-center rounded bg-[#edf4e9] text-[#39735b]"><Building2 size={16} /></span><span className="flex min-w-0 flex-1 flex-col gap-0.5"><strong className="text-[11px] font-medium text-[#46534a]">Company directory</strong><small className="text-[10px] text-[#9aa29c]">Manage your network</small></span><ArrowRight size={15} className="text-[#a1aaa3]" /></Link>
                <Link className="flex min-h-[57px] items-center gap-2.5 border-t border-[#eff1ed]" to="/activity-logs"><span className="grid size-[30px] shrink-0 place-items-center rounded bg-[#f7eee5] text-[#a66b3d]"><Activity size={16} /></span><span className="flex min-w-0 flex-1 flex-col gap-0.5"><strong className="text-[11px] font-medium text-[#46534a]">Recent activity</strong><small className="text-[10px] text-[#9aa29c]">See what has changed</small></span><ArrowRight size={15} className="text-[#a1aaa3]" /></Link>
              </div>
              <div className="flex items-start gap-[11px] rounded-md border border-[#e9e8dd] bg-[#f1f0e7] p-3.5"><span className="grid size-7 shrink-0 place-items-center rounded bg-[#617766] font-serif text-[17px] text-[#f5f2e9]">S.</span><div><strong className="text-[11px] font-semibold text-[#465346]">Built for better connections.</strong><p className="mb-0 mt-1 text-[10px] leading-relaxed text-[#82897d]">Your company network, organized and ready to grow.</p></div></div>
            </aside>
          </section>

          <footer className="mt-[22px] flex justify-between gap-4 text-[9px] text-[#a1a9a3] sm:text-[10px]"><span>© {new Date().getFullYear()} SBLM</span><span>Company network <span className="px-1 text-[#c0c6c0]">·</span> Workspace overview</span></footer>
    </div>
  )
}