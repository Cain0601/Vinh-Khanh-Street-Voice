"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  getOwnerSettings,
  updateOwnerSettings,
  type OwnerSettings,
} from "@/lib/api/owner";

type OwnerSettingsForm = {
  notificationsEmail: boolean;
  poiDefaultIsActive: boolean;
};

const emptyForm: OwnerSettingsForm = {
  notificationsEmail: false,
  poiDefaultIsActive: true,
};

export default function OwnerSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<OwnerSettingsForm>(emptyForm);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await getOwnerSettings();
      const data = (res as any)?.data as OwnerSettings | undefined;

      if (!data) {
        setError((res as any)?.message ?? "Failed to load settings");
        return;
      }

      setForm({
        notificationsEmail: Boolean(data.notificationsEmail),
        poiDefaultIsActive: Boolean(data.poiDefaultIsActive),
      });
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const res = await updateOwnerSettings({
        notificationsEmail: form.notificationsEmail,
        poiDefaultIsActive: form.poiDefaultIsActive,
      });

      if (!(res as any)?.success) {
        setError((res as any)?.message ?? "Failed to update settings");
        return;
      }

      await fetchSettings();
      // eslint-disable-next-line no-alert
      alert("Settings updated successfully");
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="container max-w-2xl py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Owner Settings</h1>
        <p className="mt-2 text-slate-600">
          Business settings and preferences.
        </p>
      </div>

      {loading ? (
        <p className="text-slate-500 text-sm">Loading...</p>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-bold text-slate-800">Email notifications</p>
                <p className="text-sm text-slate-600 mt-1">
                  Receive email updates about your POIs and reviews.
                </p>
              </div>

              <label className="inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.notificationsEmail}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notificationsEmail: e.target.checked }))
                  }
                  className="sr-only"
                />
                <span
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    form.notificationsEmail ? "bg-orange-500" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      form.notificationsEmail ? "translate-x-6" : ""
                    }`}
                  />
                </span>
              </label>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-bold text-slate-800">Default POI status</p>
                <p className="text-sm text-slate-600 mt-1">
                  New POIs will be active by default.
                </p>
              </div>

              <label className="inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.poiDefaultIsActive}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, poiDefaultIsActive: e.target.checked }))
                  }
                  className="sr-only"
                />
                <span
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    form.poiDefaultIsActive ? "bg-orange-500" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      form.poiDefaultIsActive ? "translate-x-6" : ""
                    }`}
                  />
                </span>
              </label>
            </div>

            {error ? (
              <p className="rounded bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </p>
            ) : null}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded bg-orange-500 px-5 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>

              <button
                type="button"
                onClick={fetchSettings}
                disabled={saving}
                className="rounded border border-slate-300 px-5 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
