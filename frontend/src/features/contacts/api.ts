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

const CONTACTS_ENDPOINT = '/api/v1/contacts/'

export async function getCompanyContacts(companyId: string) {
  const contacts = await apiRequest<Contact[]>(CONTACTS_ENDPOINT)
  return contacts.filter((contact) => contact.company === companyId)
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