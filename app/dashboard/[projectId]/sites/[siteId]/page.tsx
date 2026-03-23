"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, History, Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  getSiteProfile,
  getSiteHistory,
  SiteHistory,
  saveSiteProfile,
  SiteProfileFieldValueItem,
  SiteProfileResponse,
} from "@/lib/api-site-profile"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function normalizeSelectOptions(optionsJson: any): { label: string; value: string }[] {
  if (!Array.isArray(optionsJson)) return []

  return optionsJson
    .map((item) => {
      if (typeof item === "string") {
        return { label: item, value: item }
      }
      if (typeof item === "object" && item !== null && item.value != null) {
        return {
          label: String(item.label ?? item.value),
          value: String(item.value),
        }
      }
      return null
    })
    .filter(Boolean) as { label: string; value: string }[]
}

function formatHistoryPayload(payload: any): string {
  if (payload === null || payload === undefined) return "-"
  try {
    return JSON.stringify(payload, null, 2)
  } catch {
    return String(payload)
  }
}

export default function SiteProfileDetailPage() {
  const params = useParams()
  const projectId = useMemo(() => String(params?.projectId || ""), [params])
  const siteId = useMemo(() => String(params?.siteId || ""), [params])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<SiteProfileResponse | null>(null)
  const [histories, setHistories] = useState<SiteHistory[]>([])
  const [values, setValues] = useState<Record<string, any>>({})

  const fetchProfile = async () => {
    if (!projectId || !siteId) return

    try {
      setLoading(true)
      const [response, historyItems] = await Promise.all([
        getSiteProfile(projectId, siteId),
        getSiteHistory(projectId, siteId),
      ])
      setProfile(response)
      setHistories(historyItems)

      const initial: Record<string, any> = {}
      response.fields.forEach((field) => {
        initial[field.fieldKey] = field.valueJson ?? ""
      })
      setValues(initial)
    } catch (error: any) {
      toast.error(error.message || "Failed to load site profile")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [projectId, siteId])

  const setFieldValue = (fieldKey: string, value: any) => {
    setValues((prev) => ({ ...prev, [fieldKey]: value }))
  }

  const renderInput = (field: SiteProfileFieldValueItem) => {
    const currentValue = values[field.fieldKey]

    if (field.inputType === "textarea") {
      return (
        <Textarea
          value={currentValue ?? ""}
          onChange={(e) => setFieldValue(field.fieldKey, e.target.value)}
          rows={4}
        />
      )
    }

    if (field.inputType === "number") {
      return (
        <Input
          type="number"
          value={currentValue ?? ""}
          onChange={(e) => setFieldValue(field.fieldKey, e.target.value === "" ? null : Number(e.target.value))}
        />
      )
    }

    if (field.inputType === "date") {
      return (
        <Input
          type="date"
          value={currentValue ?? ""}
          onChange={(e) => setFieldValue(field.fieldKey, e.target.value)}
        />
      )
    }

    if (field.inputType === "boolean") {
      return (
        <div className="h-10 flex items-center">
          <Checkbox
            checked={Boolean(currentValue)}
            onCheckedChange={(checked) => setFieldValue(field.fieldKey, Boolean(checked))}
          />
        </div>
      )
    }

    if (field.inputType === "select") {
      const options = normalizeSelectOptions(field.optionsJson)
      return (
        <Select
          value={currentValue == null ? "" : String(currentValue)}
          onValueChange={(value) => setFieldValue(field.fieldKey, value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    return (
      <Input
        type="text"
        value={currentValue ?? ""}
        onChange={(e) => setFieldValue(field.fieldKey, e.target.value)}
      />
    )
  }

  const handleSave = async () => {
    if (!profile) return

    try {
      setSaving(true)
      const payload = {
        items: profile.fields.map((field) => ({
          fieldKey: field.fieldKey,
          valueJson: values[field.fieldKey],
        })),
      }

      const updated = await saveSiteProfile(projectId, siteId, payload)
      setProfile(updated)
      const historyItems = await getSiteHistory(projectId, siteId)
      setHistories(historyItems)
      toast.success("Site profile saved")
    } catch (error: any) {
      toast.error(error.message || "Failed to save profile")
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

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <p className="text-muted-foreground">Site profile not available.</p>
        <Button asChild variant="outline">
          <Link href={`/dashboard/${projectId}/sites`}>Back to Sites</Link>
        </Button>
      </div>
    )
  }

  const grouped = profile.fields.reduce<Record<string, SiteProfileFieldValueItem[]>>((acc, field) => {
    const key = field.fieldGroup || "General"
    if (!acc[key]) acc[key] = []
    acc[key].push(field)
    return acc
  }, {})

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button asChild variant="outline" size="sm" className="mb-3">
            <Link href={`/dashboard/${projectId}/sites`}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Sites
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{profile.site.name}</h1>
          <p className="text-muted-foreground">Fill dynamic profile fields configured at project level.</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full max-w-sm grid-cols-2">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={handleSave} className="bg-brand text-white" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Profile
            </Button>
          </div>

          {Object.keys(grouped).length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No profile fields configured for this project. Configure fields first.
              </CardContent>
            </Card>
          ) : (
            Object.entries(grouped).map(([groupName, fields]) => (
              <Card key={groupName} className="rounded-2xl">
                <CardHeader>
                  <CardTitle>{groupName}</CardTitle>
                  <CardDescription>{fields.length} field(s)</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  {fields
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .filter((field) => field.isActive)
                    .map((field) => (
                      <div key={field.configId} className="space-y-2">
                        <Label htmlFor={field.fieldKey}>
                          {field.label}
                          {field.required ? " *" : ""}
                        </Label>
                        {renderInput(field)}
                      </div>
                    ))}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-4 w-4" /> Site History
              </CardTitle>
              <CardDescription>Track changes for site master and profile values.</CardDescription>
            </CardHeader>
            <CardContent>
              {histories.length === 0 ? (
                <p className="text-sm text-muted-foreground">No history available yet.</p>
              ) : (
                <div className="space-y-3">
                  {histories.map((item) => (
                    <div key={item.id} className="border rounded-lg p-3 text-sm space-y-1">
                      <p>
                        <span className="font-semibold">Action:</span> {item.action}
                      </p>
                      <p>
                        <span className="font-semibold">Changed At:</span> {new Date(item.changedAt).toLocaleString()}
                      </p>
                      <p>
                        <span className="font-semibold">Changed By:</span> {item.changedByUser?.email || item.changedBy || "System"}
                      </p>
                      <div className="mt-2 space-y-2">
                        <div>
                          <p className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Before</p>
                          <pre className="mt-1 rounded-md bg-muted p-2 text-xs overflow-auto whitespace-pre-wrap break-words">
                            {formatHistoryPayload(item.beforeJson)}
                          </pre>
                        </div>
                        <div>
                          <p className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">After</p>
                          <pre className="mt-1 rounded-md bg-muted p-2 text-xs overflow-auto whitespace-pre-wrap break-words">
                            {formatHistoryPayload(item.afterJson)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
