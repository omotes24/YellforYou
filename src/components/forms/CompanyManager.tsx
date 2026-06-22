"use client";

import { useMemo, useState } from "react";
import { Loader2, Search, Trash2 } from "lucide-react";

import { FormField, textareaClassName } from "@/components/forms/FormField";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  companyProfileSchema,
  createEmptyCompanyProfile,
  type CompanyProfile,
  type UserProfile,
} from "@/lib/schemas/interview";
import { useAppStorage } from "@/lib/storage/use-app-storage";
import { cn } from "@/lib/utils";

function profileToSelfInfo(profile: UserProfile | null): string {
  if (!profile) {
    return "";
  }
  return [
    profile.careerSummary,
    profile.strengths ? `強み: ${profile.strengths}` : "",
    profile.achievements ? `実績: ${profile.achievements}` : "",
    profile.successStories ? `成功経験: ${profile.successStories}` : "",
    profile.failureStories ? `苦労・失敗経験: ${profile.failureStories}` : "",
    profile.motivationMaterials
      ? `志望動機の素材: ${profile.motivationMaterials}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function CompanyManager() {
  const { storage, actions } = useAppStorage();
  const activeProfile = storage.profiles[0] ?? null;
  const suggestedSelfInfo = useMemo(
    () => profileToSelfInfo(activeProfile),
    [activeProfile],
  );
  const [selfInfo, setSelfInfo] = useState(suggestedSelfInfo);
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [desiredCourse, setDesiredCourse] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [draft, setDraft] = useState<CompanyProfile>(
    storage.companies[0] ?? createEmptyCompanyProfile(),
  );
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function researchAndSave() {
    if (!selfInfo.trim() || !companyWebsite.trim() || !desiredCourse.trim()) {
      setStatus("自分のこと、企業Webサイト、志望コースを入力してください。");
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const response = await fetch("/api/research-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selfInfo,
          companyWebsite,
          desiredCourse,
          additionalNotes,
        }),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "企業調査に失敗しました");
      }
      const researched = companyProfileSchema.parse(await response.json());
      setDraft(researched);
      actions.saveCompany(researched);
      setStatus("調査結果を会社スロットに保存しました。");
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "企業調査に失敗しました",
      );
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setCompanyWebsite("");
    setDesiredCourse("");
    setAdditionalNotes("");
    setDraft(createEmptyCompanyProfile());
    setStatus(null);
  }

  function selectCompany(company: CompanyProfile) {
    setDraft(company);
    setCompanyWebsite(company.researchSources[0] ?? "");
    setDesiredCourse(company.researchInstruction || company.targetRole);
    setAdditionalNotes(company.interviewFocus);
  }

  return (
    <section>
      <PageHeader
        title="企業・求人リサーチ"
        description="入力は4つだけです。自分のこと、企業Webサイト、志望コース、その他メモから、会社ごとの面接準備スロットを作ります。"
      />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <form className="grid gap-4 rounded-md border border-slate-200 bg-white p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="自分のこと">
              <textarea
                className={textareaClassName}
                value={selfInfo}
                onChange={(event) => setSelfInfo(event.target.value)}
                placeholder="SatoFC、研究、塾運営、強み、弱みなど。プロフィール登録済みなら下のボタンで反映できます。"
              />
            </FormField>
            <FormField label="企業Webサイト">
              <textarea
                className={textareaClassName}
                value={companyWebsite}
                onChange={(event) => setCompanyWebsite(event.target.value)}
                placeholder="企業サイト、採用ページ、募集要項URLを貼り付け"
              />
            </FormField>
            <FormField label="志望コース">
              <textarea
                className="min-h-20 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-950 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
                value={desiredCourse}
                onChange={(event) => setDesiredCourse(event.target.value)}
                placeholder="例: A職のBコース"
              />
            </FormField>
            <FormField label="その他">
              <textarea
                className="min-h-20 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-950 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
                value={additionalNotes}
                onChange={(event) => setAdditionalNotes(event.target.value)}
                placeholder="質問の特徴、言いたいこと、避けたい話題、面接形式など"
              />
            </FormField>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelfInfo(suggestedSelfInfo)}
              className="h-10 rounded-md border border-slate-300 px-4 text-sm font-medium"
            >
              自分のことを反映
            </button>
            <button
              type="button"
              onClick={researchAndSave}
              disabled={loading}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Search className="h-4 w-4" aria-hidden />
              )}
              面接準備スロットを作成
            </button>
            <button
              type="button"
              onClick={reset}
              className="h-10 rounded-md border border-slate-300 px-4 text-sm font-medium"
            >
              新規
            </button>
          </div>
          {status ? (
            <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              {status}
            </p>
          ) : null}

          <section className="rounded-md border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">選択中の会社スロット</h2>
              <span className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-600">
                {draft.companyName || "未作成"}
              </span>
            </div>
            <div className="mt-3 grid gap-3 text-sm leading-6 text-slate-700">
              <p>{draft.researchSummary || "まだ調査結果はありません。"}</p>
              {draft.fitHypotheses.length > 0 ? (
                <div>
                  <p className="font-medium text-slate-900">自己情報との接続</p>
                  <ul className="mt-1 grid gap-1">
                    {draft.fitHypotheses.map((item) => (
                      <li key={item}>・{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {draft.interviewAngles.length > 0 ? (
                <div>
                  <p className="font-medium text-slate-900">面接で使う切り口</p>
                  <ul className="mt-1 grid gap-1">
                    {draft.interviewAngles.map((item) => (
                      <li key={item}>・{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </section>
        </form>
        <aside className="rounded-md border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold">会社スロット</h2>
          <div className="mt-3 grid gap-2">
            {storage.companies.length === 0 ? (
              <p className="text-sm text-slate-500">
                まだスロットがありません。
              </p>
            ) : (
              storage.companies.map((company, index) => (
                <div
                  key={company.id}
                  className={cn(
                    "rounded-md border p-3 transition",
                    draft.id === company.id
                      ? "border-slate-950 bg-slate-50"
                      : "border-slate-200 bg-white",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => selectCompany(company)}
                    className="block w-full text-left"
                  >
                    <span className="rounded bg-slate-950 px-2 py-1 text-xs font-medium text-white">
                      SLOT {index + 1}
                    </span>
                    <span className="mt-2 block text-sm font-semibold">
                      {company.label}
                    </span>
                    <span className="mt-1 line-clamp-3 block text-xs leading-5 text-slate-500">
                      {company.researchSummary || company.business}
                    </span>
                  </button>
                  <div className="mt-2 flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span>
                      {new Date(company.updatedAt).toLocaleString("ja-JP")}
                    </span>
                    <button
                      type="button"
                      aria-label={`${company.label}を削除`}
                      onClick={() => actions.deleteCompany(company.id)}
                      className="rounded p-1 text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
