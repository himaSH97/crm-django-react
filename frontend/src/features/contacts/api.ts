import { apiRequest } from '@/lib/api'

export type Contact = {
  id: string
  company: string
  full_name: string
  email: string
  phone: string
  role: string
  created_at: string
}

export type NewContact = {
  full_name: string
  email: string
  phone?: string
  role: string
}

export type ContactPage = {
  count: number
  next: string | null
  previous: string | null
  results: Contact[]
}

const CONTACTS_ENDPOINT = '/api/v1/contacts/'

export function getCompanyContacts(
  companyId: string,
  query: { page: number; page_size: number; ordering: string; search?: string },
) {
  const params = new URLSearchParams({
    company: companyId,
    page: String(query.page),
    page_size: String(query.page_size),
    ordering: query.ordering,
  })
  if (query.search) params.set('search', query.search)
  return apiRequest<ContactPage>(`${CONTACTS_ENDPOINT}?${params.toString()}`)
}

export function createContact(companyId: string, contact: NewContact) {
  return apiRequest<Contact>(CONTACTS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...contact, company: companyId }),
  })
}

export function getContact(contactId: string) {
  return apiRequest<Contact>(`${CONTACTS_ENDPOINT}${encodeURIComponent(contactId)}/`)
}

export function updateContact(contactId: string, contact: NewContact) {
  return apiRequest<Contact>(`${CONTACTS_ENDPOINT}${encodeURIComponent(contactId)}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contact),
  })
}

export function deleteContact(contactId: string) {
  return apiRequest<null>(`${CONTACTS_ENDPOINT}${encodeURIComponent(contactId)}/`, {
    method: 'DELETE',
  })
}