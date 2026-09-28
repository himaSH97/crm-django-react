import { apiRequest } from '@/lib/api'

export type Company = {
  id: string
  name: string
  industry: string
  country: string
  logo: string
  created_at: string
}

export type NewCompany = {
  name: string
  industry: string
  country: string
  logo: File
}

export type CompanyFormValues = {
  name: string
  industry: string
  country: string
  logo?: File
}

export type CompanyPage = {
  count: number
  next: string | null
  previous: string | null
  results: Company[]
}

export type CompanyListQuery = {
  page: number
  page_size: number
  search?: string
  ordering?: string
}

const COMPANIES_ENDPOINT = '/api/v1/companies/'

export function getCompanies(query: CompanyListQuery) {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }

  return apiRequest<CompanyPage>(`${COMPANIES_ENDPOINT}?${params.toString()}`)
}

export function getCompany(companyId: string) {
  return apiRequest<Company>(`${COMPANIES_ENDPOINT}${encodeURIComponent(companyId)}/`)
}

export function createCompany(company: NewCompany) {
  const payload = new FormData()
  payload.set('name', company.name)
  payload.set('industry', company.industry)
  payload.set('country', company.country)
  payload.set('logo', company.logo)

  return apiRequest<Company>(COMPANIES_ENDPOINT, {
    method: 'POST',
    body: payload,
  })
}

export function updateCompany(companyId: string, company: CompanyFormValues) {
  const payload = new FormData()
  payload.set('name', company.name)
  payload.set('industry', company.industry)
  payload.set('country', company.country)
  if (company.logo) payload.set('logo', company.logo)

  return apiRequest<Company>(`${COMPANIES_ENDPOINT}${encodeURIComponent(companyId)}/`, {
    method: 'PATCH',
    body: payload,
  })
}

export function deleteCompany(companyId: string) {
  return apiRequest<null>(`${COMPANIES_ENDPOINT}${encodeURIComponent(companyId)}/`, {
    method: 'DELETE',
  })
}