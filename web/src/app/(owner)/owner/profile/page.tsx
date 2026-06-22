"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  getOwnerProfile,
  updateOwnerProfile,
  type OwnerProfile,
} from "@/lib/api/owner";

type OwnerProfileForm = {
  fullName: string;
  phoneNumber?: string | null;
  avatar?: string | null;
  brandName?: string | null;
};

const emptyForm: OwnerProfileForm = {
  fullName: "",
  phoneNumber: "",
  avatar: "",
  brandName: "",
};

export default function OwnerProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState<string>("");
  const [form, setForm] = useState<OwnerProfileForm>(emptyForm);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await getOwnerProfile();
      const data = (res as any)?.data as OwnerProfile | undefined;

      if (!data) {
        setError((res as any)?.message ?? "Failed to load profile");
        return;
      }

      setEmail(data.email ?? "");
      setForm({
        fullName: data.fullName ?? "",
        phoneNumber: data.phoneNumber ?? "",
        avatar: data.avatar ?? "",
        brandName: data.brandName ?? "",
      });
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const res = await updateOwnerProfile({
        fullName: form.fullName.trim() || undefined,
        phoneNumber: form.phoneNumber?.trim() ? form.phoneNumber.trim() : null,
        avatar: form.avatar?.trim() ? form.avatar.trim() : null,
        brandName: form.brandName?.trim() ? form.brandName.trim() : null,
      });

      if (!(res as any)?.success) {
        setError((res as any)?.message ?? "Failed to update profile");
        return;
      }

      await fetchProfile();
      // eslint-disable-next-line no-alert
      alert("Profile updated successfully");
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="container max-w-2xl py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Owner Profile</h1>
        <p className="mt-2 text-slate-600">Manage your account and business info.</p>
      </div>

      {loading ? (
        <p className="text-slate-500 text-sm">Loading...</p>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full rounded border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Full name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fullName: e.target.value }))
                }
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="e.g. Dev Owner"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Phone number
              </label>
              <input
                type="text"
                value={form.phoneNumber ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phoneNumber: e.target.value }))
                }
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="+84..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Avatar URL
              </label>
              <input
                type="text"
                value={form.avatar ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, avatar: e.target.value }))
                }
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="https://..."
              />
              {form.avatar ? (
                <img
                  src={form.avatar}
                  alt="Avatar preview"
                  className="mt-3 h-20 w-20 rounded-xl object-cover border border-slate-200"
                />
              ) : null}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Brand name
              </label>
              <input
                type="text"
                value={form.brandName ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, brandName: e.target.value }))
                }
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="e.g. Phượng Street Food"
              />
            </div>

            {error ? (
              <p className="rounded bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
            ) : null}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !form.fullName.trim()}
                className="rounded bg-orange-500 px-5 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>

              <button
                type="button"
                onClick={fetchProfile}
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
