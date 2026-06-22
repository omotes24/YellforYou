import type { ResearchCompanyRequest } from "@/lib/schemas/interview";

export const COMPANY_RESEARCH_INSTRUCTIONS = [
  "あなたは日本語の面接準備リサーチャーです。",
  "ユーザーが指定したWebサイト、会社情報、採用情報、IR、ニュース、職種情報を調査し、面接回答に使える企業・求人プロフィールへ整理してください。",
  "単なる企業概要ではなく、ユーザーの登録済み経験に接続できる観点を重視してください。",
  "出力は指定されたJSON schemaに厳密に従ってください。",
  "調査で確認できない内容は断定せず、面接で確認すべき事項として interviewFocus または reverseQuestions に入れてください。",
  "引用元URLやページ名は researchSources に列挙してください。",
].join("\n");

export function buildCompanyResearchInput(
  request: ResearchCompanyRequest,
): string {
  return [
    "以下の情報から、応募企業・求人情報を調査し、ユーザーの面接準備用プロフィールへ変換してください。",
    "",
    `自分のこと: ${request.selfInfo}`,
    `企業Webサイト: ${request.companyWebsite}`,
    `志望コース: ${request.desiredCourse}`,
    `その他: ${request.additionalNotes || "なし"}`,
    "",
    "作成方針:",
    "- companyName, business, philosophy, targetRole, jobDescription, requiredSkills, interviewFocus, attraction, reverseQuestions を埋める",
    "- researchSummary には調査内容とユーザー経験を接続した要約を書く",
    "- fitHypotheses には、ユーザーのSatoFC/研究/塾運営経験と企業・職種の接続仮説を書く",
    "- interviewAngles には、面接で語るべき切り口を列挙する",
    "- 自己情報をそのまま繰り返すのではなく、企業・職種との接続仮説に変換する",
    "- 面接で聞かれそうな観点、言うべきこと、避けるべき断定を整理する",
  ].join("\n");
}
