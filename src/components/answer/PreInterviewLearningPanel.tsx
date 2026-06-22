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
    <section className="rounded-[28px] border border-neutral-950/10 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-600">
            Pre Interview
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            面接前に学習
          </h2>
          <p className="mt-2 text-sm font-medium leading-6 text-neutral-600">
            自分のことと会社スロットを読み込み、回答案の前提を作ります。
          </p>
        </div>
        {storage.learning ? (
          <span className="inline-flex h-10 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-4 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
            理解済み
          </span>
        ) : null}
      </div>
      <div className="mt-5 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <button
          type="button"
          onClick={learn}
          disabled={loading}
          className="inline-flex min-h-16 items-center justify-center gap-3 rounded-3xl bg-neutral-950 px-6 text-base font-semibold text-white shadow-sm transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-neutral-400"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          ) : (
            <Brain className="h-5 w-5" aria-hidden />
          )}
          {loading ? "学習中" : storage.learning ? "再学習" : "学習開始"}
        </button>
        {storage.learning ? (
          <button
            type="button"
            onClick={actions.clearLearning}
            className="inline-flex min-h-16 items-center justify-center gap-2 rounded-3xl border border-neutral-950/15 bg-white px-5 text-sm font-semibold text-neutral-900 transition hover:border-neutral-950"
          >
            <X className="h-4 w-4" aria-hidden />
            解除
          </button>
        ) : null}
      </div>
      {status ? (
        <p className="mt-4 rounded-2xl border border-neutral-950/10 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-700">
          {status}
        </p>
      ) : null}
      {storage.learning ? (
        <div className="mt-4 rounded-2xl bg-neutral-50 p-4 text-sm font-medium leading-7 text-neutral-700">
          <p>{storage.learning.brief}</p>
        </div>
      ) : null}
    </section>
  );
}
