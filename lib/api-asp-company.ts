import { apiFetch } from "./api";
import { CountryUnit } from "./api-country-unit";

export interface AspCompany {
  id: string;
  code: string;
  name: string;
  countryUnitId: string;
  countryUnit?: CountryUnit;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAspCompanyDto {
  code: string;
  name: string;
  countryUnitId: string;
  isActive?: boolean;
}

export interface UpdateAspCompanyDto extends Partial<CreateAspCompanyDto> {}

export async function getAspCompanies(): Promise<AspCompany[]> {
  return apiFetch<AspCompany[]>("/asp-companies");
}

export async function createAspCompany(data: CreateAspCompanyDto): Promise<AspCompany> {
  return apiFetch<AspCompany>("/asp-companies", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAspCompany(id: string, data: UpdateAspCompanyDto): Promise<AspCompany> {
  return apiFetch<AspCompany>(`/asp-companies/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteAspCompany(id: string): Promise<void> {
  return apiFetch<void>(`/asp-companies/${id}`, {
    method: "DELETE",
  });
}
