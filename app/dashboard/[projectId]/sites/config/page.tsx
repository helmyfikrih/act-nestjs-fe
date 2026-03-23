"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, History, Loader2, Plus, Save, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  getMasterSiteProfileFields,
  getProjectSiteProfileConfig,
  getSiteProfileConfigHistory,
  MasterSiteProfileField,
  SiteProfileHistory,
  upsertProjectSiteProfileConfig,
} from "@/lib/api-site-profile"

type ConfigRow = {
  id: string
  fieldCode: string
  fieldKey: string
  label: string
  fieldGroup: string
  required: boolean
  sortOrder: number
  defaultValueRaw: string
  optionsRaw: string
  validationRaw: string
  isActive: boolean
}

function safeStringify(value: any): string {
  if (value === undefined || value === null) return ""
  try {
    return JSON.stringify(value)
  } catch {
    return ""
  }
}

function parseOptionalJson(raw: string, label: string): any {
  const trimmed = raw.trim()
  if (!trimmed) return null
  try {
    return JSON.parse(trimmed)
  } catch {
    throw new Error(`Invalid JSON in ${label}`)
  }
}

export default function SiteProfileConfigPage() {
  const params = useParams()
  const projectId = useMemo(() => String(params?.projectId || ""), [params])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [fields, setFields] = useState<MasterSiteProfileField[]>([])
  const [rows, setRows] = useState<ConfigRow[]>([])
  const [histories, setHistories] = useState<SiteProfileHistory[]>([])

  const fieldByCode = useMemo(() => new Map(fields.map((field) => [field.code, field])), [fields])

  const fetchData = async () => {
    if (!projectId) return

    try {
      setLoading(true)
      const [masterFields, configs, history] = await Promise.all([
        getMasterSiteProfileFields(projectId),
        getProjectSiteProfileConfig(projectId),
        getSiteProfileConfigHistory(projectId),
      ])

      setFields(masterFields)
      setHistories(history)
      setRows(
        configs.map((config) => ({
          id: config.id,
          fieldCode: config.field?.code || "",
          fieldKey: config.fieldKey,
          label: config.label,
          fieldGroup: config.fieldGroup || "",
          required: config.required,
          sortOrder: config.sortOrder,
          defaultValueRaw: safeStringify(config.defaultValueJson),
          optionsRaw: safeStringify(config.optionsJson),
          validationRaw: safeStringify(config.validationJson),
          isActive: config.isActive,
        })),
      )
    } catch (error: any) {
      toast.error(error.message || "Failed to load config")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [projectId])

  const addRow = () => {
    const firstFieldCode = fields[0]?.code || ""
    setRows((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        fieldCode: firstFieldCode,
        fieldKey: "",
        label: "",
        fieldGroup: "General",
        required: false,
        sortOrder: prev.length,
        defaultValueRaw: "",
        optionsRaw: "",
        validationRaw: "",
        isActive: true,
      },
    ])
  }

  const updateRow = (id: string, patch: Partial<ConfigRow>) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  const removeRow = (id: string) => {
    setRows((prev) => prev.filter((row) => row.id !== id))
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      const items = rows.map((row, index) => {
        if (!row.fieldCode) throw new Error(`Row ${index + 1}: field type is required`)
        if (!row.fieldKey.trim()) throw new Error(`Row ${index + 1}: field key is required`)
        if (!row.label.trim()) throw new Error(`Row ${index + 1}: label is required`)

        const fieldMeta = fieldByCode.get(row.fieldCode)
        if (!fieldMeta) {
          throw new Error(`Row ${index + 1}: invalid field code`) 
        }

        const optionsJson = parseOptionalJson(row.optionsRaw, `options row ${index + 1}`)

        if (fieldMeta.inputType === "select" && optionsJson && !Array.isArray(optionsJson)) {
          throw new Error(`Row ${index + 1}: select options must be array`) 
        }

        return {
          fieldCode: row.fieldCode,
          fieldKey: row.fieldKey.trim(),
          label: row.label.trim(),
          fieldGroup: row.fieldGroup.trim() || "General",
          required: row.required,
          sortOrder: row.sortOrder,
          defaultValueJson: parseOptionalJson(row.defaultValueRaw, `default value row ${index + 1}`),
          optionsJson,
          validationJson: parseOptionalJson(row.validationRaw, `validation row ${index + 1}`),
          isActive: row.isActive,
        }
      })

      await upsertProjectSiteProfileConfig(projectId, { items })
      toast.success("Configuration saved")
      await fetchData()
    } catch (error: any) {
      toast.error(error.message || "Failed to save config")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button asChild variant="outline" size="sm" className="mb-3">
            <Link href={`/dashboard/${projectId}/sites`}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Sites
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Site Profile Config</h1>
          <p className="text-muted-foreground">Build dynamic fields per project and track all updates in history.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={addRow}>
            <Plus className="h-4 w-4 mr-2" /> Add Field
          </Button>
          <Button className="bg-brand text-white" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Config
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Field Builder</CardTitle>
          <CardDescription>JSON fields can be left blank if not needed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {rows.length === 0 ? (
            <div className="text-sm text-muted-foreground border border-dashed rounded-xl p-5">
              No config yet. Add the first field for this project.
            </div>
          ) : (
            rows.map((row, idx) => (
              <div key={row.id} className="border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Field #{idx + 1}</p>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => removeRow(row.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>

                <div className="grid md:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Field Type</Label>
                    <Select
                      value={row.fieldCode}
                      onValueChange={(value) => updateRow(row.id, { fieldCode: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {fields.map((field) => (
                          <SelectItem key={field.code} value={field.code}>
                            {field.name} ({field.inputType})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Field Key</Label>
                    <Input
                      value={row.fieldKey}
                      onChange={(e) => updateRow(row.id, { fieldKey: e.target.value })}
                      placeholder="e.g. site_name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Label</Label>
                    <Input
                      value={row.label}
                      onChange={(e) => updateRow(row.id, { label: e.target.value })}
                      placeholder="e.g. Site Name"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Group</Label>
                    <Input
                      value={row.fieldGroup}
                      onChange={(e) => updateRow(row.id, { fieldGroup: e.target.value })}
                      placeholder="General"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Sort Order</Label>
                    <Input
                      type="number"
                      value={row.sortOrder}
                      onChange={(e) => updateRow(row.id, { sortOrder: Number(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="flex items-end gap-6 pb-1">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={row.required}
                        onCheckedChange={(checked) => updateRow(row.id, { required: Boolean(checked) })}
                      />
                      <Label>Required</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={row.isActive}
                        onCheckedChange={(checked) => updateRow(row.id, { isActive: Boolean(checked) })}
                      />
                      <Label>Active</Label>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Default Value (JSON)</Label>
                    <Input
                      value={row.defaultValueRaw}
                      onChange={(e) => updateRow(row.id, { defaultValueRaw: e.target.value })}
                      placeholder='e.g. "Jakarta" or 0 or true'
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Options (JSON)</Label>
                    <Input
                      value={row.optionsRaw}
                      onChange={(e) => updateRow(row.id, { optionsRaw: e.target.value })}
                      placeholder='e.g. [{"label":"A","value":"A"}]'
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Validation (JSON)</Label>
                    <Input
                      value={row.validationRaw}
                      onChange={(e) => updateRow(row.id, { validationRaw: e.target.value })}
                      placeholder='e.g. {"min":1,"max":10}'
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-4 w-4" /> Config History
          </CardTitle>
          <CardDescription>Latest 50 changes with before/after snapshots.</CardDescription>
        </CardHeader>
        <CardContent>
          {histories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No history available.</p>
          ) : (
            <div className="space-y-3">
              {histories.map((history) => (
                <div key={history.id} className="border rounded-lg p-3 text-sm space-y-1">
                  <p>
                    <span className="font-semibold">Action:</span> {history.action}
                  </p>
                  <p>
                    <span className="font-semibold">Changed At:</span> {new Date(history.changedAt).toLocaleString()}
                  </p>
                  <p>
                    <span className="font-semibold">Changed By:</span> {history.changedByUser?.email || history.changedBy || "System"}
                  </p>
                  <p className="text-muted-foreground">
                    {Array.isArray(history.beforeJson) ? history.beforeJson.length : 0} item(s) before {Array.isArray(history.afterJson) ? history.afterJson.length : 0} item(s) after
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
