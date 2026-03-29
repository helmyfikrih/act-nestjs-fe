import { apiFetch } from "./api";
import { MarketArea } from "./api-market-area";

export interface CountryUnit {
  id: string;
  code: string;
  name: string;
  marketAreaId: string;
  marketArea?: MarketArea;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCountryUnitDto {
  code: string;
  name: string;
  marketAreaId: string;
  isActive?: boolean;
}

export interface UpdateCountryUnitDto extends Partial<CreateCountryUnitDto> {}

export async function getCountryUnits(): Promise<CountryUnit[]> {
  return apiFetch<CountryUnit[]>("/country-units");
}

export async function createCountryUnit(data: CreateCountryUnitDto): Promise<CountryUnit> {
  return apiFetch<CountryUnit>("/country-units", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCountryUnit(id: string, data: UpdateCountryUnitDto): Promise<CountryUnit> {
  return apiFetch<CountryUnit>(`/country-units/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteCountryUnit(id: string): Promise<void> {
  return apiFetch<void>(`/country-units/${id}`, {
    method: "DELETE",
  });
}
