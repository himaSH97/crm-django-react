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
  industry?: string
  country?: string
}

const COMPANIES_ENDPOINT = '/api/v1/companies/'

type PresignedLogoUpload = {
  url: string
  fields: Record<string, string>
  key: string
}

async function uploadCompanyLogo(file: File): Promise<string> {
  const upload = await apiRequest<PresignedLogoUpload>(
    `${COMPANIES_ENDPOINT}logo-upload/`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content_type: file.type, size: file.size }),
    },
  )

  const form = new FormData()
  for (const [field, value] of Object.entries(upload.fields)) {
    form.append(field, value)
  }
  form.append('file', file)

  const response = await fetch(upload.url, { method: 'POST', body: form })
  if (!response.ok) {
    throw new Error('The logo could not be uploaded to storage. Try again.')
  }

  return upload.key
}

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

export async function createCompany(company: NewCompany) {
  const logo_key = await uploadCompanyLogo(company.logo)
  return apiRequest<Company>(COMPANIES_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: company.name,
      industry: company.industry,
      country: company.country,
      logo_key,
    }),
  })
}

export async function updateCompany(companyId: string, company: CompanyFormValues) {
  const logo_key = company.logo
    ? await uploadCompanyLogo(company.logo)
    : undefined

  return apiRequest<Company>(`${COMPANIES_ENDPOINT}${encodeURIComponent(companyId)}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: company.name,
      industry: company.industry,
      country: company.country,
      ...(logo_key ? { logo_key } : {}),
    }),
  })
}

export function deleteCompany(companyId: string) {
  return apiRequest<null>(`${COMPANIES_ENDPOINT}${encodeURIComponent(companyId)}/`, {
    method: 'DELETE',
  })
}