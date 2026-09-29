import {
  Activity,
  Building2,
  CalendarDays,
  LayoutDashboard,
  LogOut,
} from 'lucide-react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'

function navigationClass(isActive: boolean) {
  return `flex min-h-9 shrink-0 items-center gap-2.5 rounded-md px-2.5 text-xs transition-colors hover:bg-[#2c4d40] hover:text-white lg:shrink ${isActive ? 'bg-[#35624f] text-white shadow-[inset_2px_0_#bdd99e]' : 'text-[#bdcbc1]'}`
}

export function WorkspaceLayout() {
  const { profile, signOut } = useAuth()
  const { pathname } = useLocation()
  const canReadActivity = profile?.role === 'admin' || profile?.role === 'manager'
  const pageTitle = pathname.startsWith('/activity-logs')
    ? 'Activity logs'
    : pathname.startsWith('/contacts/')
      ? 'Contact details'
      : pathname.startsWith('/companies/')
        ? 'Company details'
        : pathname === '/companies'
          ? 'Companies'
          : 'Dashboard'

  return (
    <div className="flex min-h-svh flex-col bg-[#f7f8f5] font-sans text-sm leading-[1.45] text-[#202b28] lg:h-svh lg:min-h-0 lg:flex-row lg:overflow-hidden">
      <aside className="flex w-full shrink-0 flex-col bg-[#203d35] px-5 py-4 text-[#e5ebe4] lg:sticky lg:top-0 lg:h-svh lg:min-h-0 lg:w-[248px] lg:overflow-y-auto lg:px-4 lg:py-[25px]">
        <Link className="flex items-center gap-2.5 px-0.5 pb-3 lg:px-2 lg:pb-0" to="/dashboard" aria-label="SBLM dashboard">
          <span className="grid size-[31px] place-items-center rounded-[9px] bg-[#d4e7ce] font-serif text-2xl leading-none text-[#244538]">s.</span>
          <span className="text-lg font-semibold text-[#fbfcf8]">sblm</span>
        </Link>
        <div className="mb-2.5 ml-2.5 mt-[38px] hidden text-[10px] font-semibold tracking-widest text-[#9db0a5] lg:block">WORKSPACE</div>
        <div className="hidden min-w-0 items-center gap-2.5 rounded-md border border-[#40594f] bg-[#29463c] p-2.5 lg:flex">
          <span className="grid size-[31px] shrink-0 place-items-center rounded-md bg-[#d1dfbd] text-[13px] font-bold text-[#244538]">S</span>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5"><strong className="truncate text-xs font-medium text-[#f1f4ee]">{profile?.organization_name || 'Company workspace'}</strong><span className="text-[11px] text-[#a6b5ab]">Business workspace</span></span>
        </div>
        <div className="mb-2.5 ml-2.5 mt-[31px] hidden text-[10px] font-semibold tracking-widest text-[#9db0a5] lg:block">OVERVIEW</div>
        <nav className="-mx-1 flex gap-1 overflow-x-auto pt-0.5 [scrollbar-width:none] lg:mx-0 lg:grid lg:overflow-visible lg:pt-0" aria-label="Main navigation">
          <NavLink to="/dashboard" className={({ isActive }) => navigationClass(isActive)}><LayoutDashboard size={17} strokeWidth={1.8} /><span>Dashboard</span></NavLink>
          <NavLink to="/companies" className={({ isActive }) => navigationClass(isActive)}><Building2 size={17} strokeWidth={1.8} /><span>Companies</span></NavLink>
          {canReadActivity && <NavLink to="/activity-logs" className={({ isActive }) => navigationClass(isActive)}><Activity size={17} strokeWidth={1.8} /><span>Activity logs</span></NavLink>}
        </nav>
        <div className="mt-auto hidden border-t border-[#40594f] pt-3.5 lg:block">
          <div className="flex items-center gap-2.5">
            <span className="grid size-[33px] shrink-0 place-items-center rounded-full border border-[#587064] bg-[#365748] text-[11px] font-semibold text-[#e4eddd]">S</span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5"><strong className="truncate text-xs font-medium text-[#f1f4ee]">Your account</strong><span className="text-[11px] text-[#a6b5ab]">Signed in</span></span>
            <button className="grid size-8 shrink-0 place-items-center rounded text-[#adbbb2] hover:bg-[#2c4d40] hover:text-white" type="button" onClick={signOut} aria-label="Sign out" title="Sign out"><LogOut size={16} /></button>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1 lg:h-svh lg:min-h-0 lg:overflow-y-auto">
        <header className="sticky top-0 z-20 flex h-[61px] items-center justify-between border-b border-[#e8ece8] bg-white px-5 sm:px-7 lg:px-[clamp(22px,4vw,56px)]">
          <div className="flex items-center gap-2 text-[11px] text-[#939b96] sm:gap-[11px] sm:text-xs"><span>Workspace</span><span>/</span><strong className="font-medium text-[#45534c]">{pageTitle}</strong></div>
          <div className="flex items-center gap-2.5 sm:gap-[15px]"><span className="flex items-center gap-2 text-[0px] text-[#65746b] sm:text-[11px]"><span className="size-2 rounded-full bg-[#55a477] shadow-[0_0_0_3px_#e7f3e9]" /> Workspace online</span><span className="h-[18px] w-px bg-[#e8ece8]" /><span className="flex items-center gap-[7px] text-[11px] text-[#737e77] sm:text-xs"><CalendarDays size={15} className="hidden sm:block" />{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span><button className="grid size-8 place-items-center rounded text-[#68776d] hover:bg-[#f2f5f0]" type="button" onClick={signOut} aria-label="Sign out" title="Sign out"><LogOut size={16} /></button></div>
        </header>
        <main className="min-w-0"><Outlet /></main>
      </div>
    </div>
  )
}