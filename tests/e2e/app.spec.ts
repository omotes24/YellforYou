import { expect, test } from "@playwright/test";

test("manual question flow with mock OpenAI", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());

  await page.goto("/profile");
  await page.getByLabel("現在の職種").fill("プロダクトマネージャー");
  await page
    .getByLabel("強み")
    .fill("顧客課題を構造化してチームを前進させる力");
  await page.getByLabel("実績").fill("オンボーディング改善で解約率を下げた");
  await page.getByRole("button", { name: "保存" }).click();
  await expect(page.getByText("メインプロフィール")).toBeVisible();

  await page.goto("/company");
  await page.getByRole("button", { name: "自分のことを反映" }).click();
  await page
    .getByLabel("企業Webサイト")
    .fill("https://sample.example.com/recruit");
  await page.getByLabel("志望コース").fill("プロダクト職 現場課題解決コース");
  await page.getByLabel("その他").fill("SatoFCの経験を中心に話したい");
  await page.getByRole("button", { name: "面接準備スロットを作成" }).click();
  await expect(page.getByText("SLOT 1")).toBeVisible();

  await page.goto("/support");
  await page
    .getByLabel("参加者へAI支援利用を明示し、必要な同意を得ています。")
    .check();
  await page.getByRole("button", { name: "面接前に学習" }).click();
  await expect(page.getByText("理解済み")).toBeVisible();
  await page
    .getByLabel("手動質問入力")
    .fill("これまでの経験について教えてください。");
  await page.getByRole("button", { name: "回答案を作成" }).click();

  await expect(page.getByText("話すポイント3点")).toBeVisible();
  await expect(page.getByText("使用した根拠情報")).toBeVisible();

  await page.getByRole("button", { name: "履歴に保存" }).click();
  await page.goto("/history");
  await expect(
    page.getByText("これまでの経験について教えてください。"),
  ).toBeVisible();

  await page.goto("/privacy");
  await page.getByRole("button", { name: "すべてのデータを削除" }).click();
  await expect(page.getByText("プロフィール: 0件")).toBeVisible();
});
