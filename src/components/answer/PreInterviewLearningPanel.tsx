"use client";

import { useState } from "react";
import { Brain, CheckCircle2, Loader2, X } from "lucide-react";

import { useAppStorage } from "@/lib/storage/use-app-storage";

export function PreInterviewLearningPanel() {
  const { storage, actions } = useAppStorage();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function learn() {
    setLoading(true);
    setStatus(null);
    try {
      const profile = storage.profiles[0] ?? null;
      const company = storage.companies[0] ?? null;
      const response = await fetch("/api/learn-interview-context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          company,
          selfInfo: profile?.careerSummary ?? "",
          desiredCourse: company?.targetRole ?? "",
          additionalNotes: company?.interviewFocus ?? "",
        }),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "面接前学習に失敗しました");
      }
      const data = (await response.json()) as {
        brief: string;
        keyPoints: string[];
        caution: string | null;
      };
      actions.saveLearning({
        ...data,
        learnedAt: new Date().toISOString(),
        companyId: company?.id ?? null,
      });
      setStatus("理解しました。以後の回答案にこの理解メモを使います。");
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "面接前学習に失敗しました",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-md border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">面接前に学習</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            自己情報と会社スロットを読み込み、回答生成用の理解メモを作ります。
          </p>
        </div>
        {storage.learning ? (
          <span className="inline-flex items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
            理解済み
          </span>
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={learn}
          disabled={loading}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Brain className="h-4 w-4" aria-hidden />
          )}
          面接前に学習
        </button>
        {storage.learning ? (
          <button
            type="button"
            onClick={actions.clearLearning}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 px-4 text-sm font-medium"
          >
            <X className="h-4 w-4" aria-hidden />
            解除
          </button>
        ) : null}
      </div>
      {status ? <p className="mt-3 text-sm text-slate-700">{status}</p> : null}
      {storage.learning ? (
        <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-700">
          <p>{storage.learning.brief}</p>
        </div>
      ) : null}
    </section>
  );
}
