import { apiFetch } from "./api";

export interface MarketArea {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMarketAreaDto {
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateMarketAreaDto extends Partial<CreateMarketAreaDto> {}

export async function getMarketAreas(): Promise<MarketArea[]> {
  return apiFetch<MarketArea[]>("/market-areas");
}

export async function createMarketArea(data: CreateMarketAreaDto): Promise<MarketArea> {
  return apiFetch<MarketArea>("/market-areas", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateMarketArea(id: string, data: UpdateMarketAreaDto): Promise<MarketArea> {
  return apiFetch<MarketArea>(`/market-areas/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteMarketArea(id: string): Promise<void> {
  return apiFetch<void>(`/market-areas/${id}`, {
    method: "DELETE",
  });
}
