import { apiFetch } from './api';

export interface Site {
  id: string;
  projectId: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSiteDto {
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateSiteDto extends Partial<CreateSiteDto> {}

export interface MasterSiteProfileField {
  id: string;
  code: string;
  name: string;
  inputType: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'boolean';
  defaultConfigJson?: Record<string, any> | null;
  isActive: boolean;
}

export interface ProjectSiteProfileConfigItem {
  id: string;
  projectId: string;
  fieldId: string;
  fieldKey: string;
  label: string;
  fieldGroup?: string | null;
  required: boolean;
  sortOrder: number;
  defaultValueJson?: any;
  optionsJson?: any;
  validationJson?: any;
  isActive: boolean;
  field?: MasterSiteProfileField;
  createdAt: string;
  updatedAt: string;
}

export interface SiteProfileHistory {
  id: string;
  action: string;
  beforeJson: any[];
  afterJson: any[];
  changedBy?: string | null;
  changedAt: string;
  changedByUser?: {
    id: string;
    email: string;
    name: string;
  };
}

export interface SiteHistory {
  id: string;
  projectId: string;
  siteId?: string | null;
  action: string;
  beforeJson: any;
  afterJson: any;
  changedBy?: string | null;
  changedAt: string;
  changedByUser?: {
    id: string;
    email: string;
    name: string;
  };
}

export interface SiteProfileFieldValueItem {
  configId: string;
  fieldId: string;
  fieldCode: string;
  inputType: MasterSiteProfileField['inputType'];
  fieldKey: string;
  label: string;
  fieldGroup?: string | null;
  required: boolean;
  sortOrder: number;
  optionsJson?: any;
  validationJson?: any;
  defaultValueJson?: any;
  valueJson?: any;
  hasCustomValue: boolean;
  isActive: boolean;
}

export interface SiteProfileResponse {
  site: Site;
  fields: SiteProfileFieldValueItem[];
}

export interface UpsertProjectSiteProfileConfigDto {
  items: {
    fieldCode: string;
    fieldKey: string;
    label: string;
    fieldGroup?: string;
    required?: boolean;
    sortOrder?: number;
    defaultValueJson?: any;
    optionsJson?: any;
    validationJson?: any;
    isActive?: boolean;
  }[];
}

export interface SaveSiteProfileValuesDto {
  items: {
    fieldKey: string;
    valueJson?: any;
  }[];
}

function projectHeaders(projectId: string): HeadersInit {
  return { 'X-Project-Id': projectId };
}

export async function getSites(projectId: string): Promise<Site[]> {
  return apiFetch<Site[]>(`/projects/${projectId}/sites`, {
    headers: projectHeaders(projectId),
  });
}

export async function createSite(
  projectId: string,
  data: CreateSiteDto,
): Promise<Site> {
  return apiFetch<Site>(`/projects/${projectId}/sites`, {
    method: 'POST',
    headers: projectHeaders(projectId),
    body: JSON.stringify(data),
  });
}

export async function updateSite(
  projectId: string,
  siteId: string,
  data: UpdateSiteDto,
): Promise<Site> {
  return apiFetch<Site>(`/projects/${projectId}/sites/${siteId}`, {
    method: 'PATCH',
    headers: projectHeaders(projectId),
    body: JSON.stringify(data),
  });
}

export async function deleteSite(projectId: string, siteId: string): Promise<void> {
  return apiFetch<void>(`/projects/${projectId}/sites/${siteId}`, {
    method: 'DELETE',
    headers: projectHeaders(projectId),
  });
}

export async function getMasterSiteProfileFields(
  projectId: string,
): Promise<MasterSiteProfileField[]> {
  return apiFetch<MasterSiteProfileField[]>(`/projects/${projectId}/site-profile/fields`, {
    headers: projectHeaders(projectId),
  });
}

export async function getProjectSiteProfileConfig(
  projectId: string,
): Promise<ProjectSiteProfileConfigItem[]> {
  return apiFetch<ProjectSiteProfileConfigItem[]>(
    `/projects/${projectId}/site-profile/config`,
    {
      headers: projectHeaders(projectId),
    },
  );
}

export async function upsertProjectSiteProfileConfig(
  projectId: string,
  data: UpsertProjectSiteProfileConfigDto,
): Promise<ProjectSiteProfileConfigItem[]> {
  return apiFetch<ProjectSiteProfileConfigItem[]>(
    `/projects/${projectId}/site-profile/config`,
    {
      method: 'PUT',
      headers: projectHeaders(projectId),
      body: JSON.stringify(data),
    },
  );
}

export async function getSiteProfileConfigHistory(
  projectId: string,
): Promise<SiteProfileHistory[]> {
  return apiFetch<SiteProfileHistory[]>(
    `/projects/${projectId}/site-profile/config/history`,
    {
      headers: projectHeaders(projectId),
    },
  );
}

export async function getSiteProfile(
  projectId: string,
  siteId: string,
): Promise<SiteProfileResponse> {
  return apiFetch<SiteProfileResponse>(`/projects/${projectId}/sites/${siteId}/profile`, {
    headers: projectHeaders(projectId),
  });
}

export async function saveSiteProfile(
  projectId: string,
  siteId: string,
  data: SaveSiteProfileValuesDto,
): Promise<SiteProfileResponse> {
  return apiFetch<SiteProfileResponse>(`/projects/${projectId}/sites/${siteId}/profile`, {
    method: 'PUT',
    headers: projectHeaders(projectId),
    body: JSON.stringify(data),
  });
}

export async function getSiteHistory(
  projectId: string,
  siteId: string,
): Promise<SiteHistory[]> {
  return apiFetch<SiteHistory[]>(`/projects/${projectId}/sites/${siteId}/history`, {
    headers: projectHeaders(projectId),
  });
}
