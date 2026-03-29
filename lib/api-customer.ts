import { apiFetch } from "./api";
import { CountryUnit } from "./api-country-unit";

export interface Customer {
  id: string;
  code: string;
  name: string;
  logoPath?: string;
  logoUrl?: string;
  countryRegion?: string;
  countryUnitId: string;
  countryUnit?: CountryUnit;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerDto {
  code: string;
  name: string;
  logoPath?: string;
  countryRegion?: string;
  countryUnitId: string;
  isActive?: boolean;
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {}

export async function getCustomers(): Promise<Customer[]> {
  return apiFetch<Customer[]>("/customers");
}

export async function createCustomer(data: CreateCustomerDto): Promise<Customer> {
  return apiFetch<Customer>("/customers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCustomer(id: string, data: UpdateCustomerDto): Promise<Customer> {
  return apiFetch<Customer>(`/customers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteCustomer(id: string): Promise<void> {
  return apiFetch<void>(`/customers/${id}`, {
    method: "DELETE",
  });
}

export async function uploadCustomerLogo(id: string, file: File): Promise<Customer> {
  const formData = new FormData();
  formData.append('file', file);
  
  return apiFetch<Customer>(`/customers/${id}/logo`, {
    method: "POST",
    body: formData,
  });
}
