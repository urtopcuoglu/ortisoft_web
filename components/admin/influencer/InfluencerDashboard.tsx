"use client";

import { useMemo } from "react";
import type { ElementType } from "react";
import { Users, TrendingUp } from "lucide-react";
import { formatFollowerCount } from "@/lib/utils";
import { resolvePlatformIcon } from "@/lib/social-platform-icons";
import { influencerDisplayName, type InfluencerRow } from "./types";

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: ElementType;
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
      <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{value}</div>
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</div>
      </div>
    </div>
  );
}

function BarReport({
  title,
  rows,
}: {
  title: string;
  rows: { key: string; label: string; value: number }[];
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
      <h3 className="mb-4 text-sm font-bold text-slate-800 dark:text-slate-200">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-400 dark:text-slate-500">Henüz veri yok.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((row) => (
            <div key={row.key}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-300">{row.label}</span>
                <span className="font-bold text-slate-500 dark:text-slate-400">{formatFollowerCount(row.value)}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-2 rounded-full bg-pink-500 dark:bg-pink-400"
                  style={{ width: `${(row.value / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Influencer sekmesinin "report grafik dashboard"u — ayrı bir DB sorgusu
 * yapmaz, tabloya gelen tam listeden (bkz. InfluencerTable) türetir; böylece
 * sayılar tabloyla her zaman birebir aynı kalır. Platform listesi dinamik
 * olduğu için "toplam diğer hangi platform varsa" karşılaştırması burada
 * data'dan otomatik çıkarılır (sabit bir platform enum'u YOK).
 */
export default function InfluencerDashboard({ influencers }: { influencers: InfluencerRow[] }) {
  const stats = useMemo(() => {
    const platformMap = new Map<
      string,
      { name: string; slug: string; influencerIds: Set<string>; accountCount: number; totalFollowers: number }
    >();

    let totalAccounts = 0;
    const topList: { id: string; name: string; totalFollowers: number }[] = [];

    for (const inf of influencers) {
      let personTotal = 0;
      for (const acc of inf.accounts) {
        totalAccounts += 1;
        personTotal += acc.followerCount;

        const key = acc.platform.id;
        if (!platformMap.has(key)) {
          platformMap.set(key, {
            name: acc.platform.name,
            slug: acc.platform.slug,
            influencerIds: new Set(),
            accountCount: 0,
            totalFollowers: 0,
          });
        }
        const p = platformMap.get(key)!;
        p.influencerIds.add(inf.id);
        p.accountCount += 1;
        p.totalFollowers += acc.followerCount;
      }
      topList.push({ id: inf.id, name: influencerDisplayName(inf), totalFollowers: personTotal });
    }

    const platforms = [...platformMap.values()]
      .map((p) => ({ ...p, influencerCount: p.influencerIds.size }))
      .sort((a, b) => b.totalFollowers - a.totalFollowers);

    const topInfluencers = [...topList].sort((a, b) => b.totalFollowers - a.totalFollowers).slice(0, 8);

    const instagram = platforms.find((p) => p.slug === "instagram");
    const tiktok = platforms.find((p) => p.slug === "tiktok");

    return {
      totalInfluencers: influencers.length,
      totalAccounts,
      instagramCount: instagram?.influencerCount ?? 0,
      tiktokCount: tiktok?.influencerCount ?? 0,
      platforms,
      topInfluencers,
    };
  }, [influencers]);

  return (
    <div className="mb-6 flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          icon={Users}
          label="Toplam Influencer"
          value={stats.totalInfluencers}
          accent="bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
        />
        <StatCard
          icon={resolvePlatformIcon("instagram")}
          label="Instagram'da Kayıtlı"
          value={stats.instagramCount}
          accent="bg-pink-100 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400"
        />
        <StatCard
          icon={resolvePlatformIcon("tiktok")}
          label="TikTok'ta Kayıtlı"
          value={stats.tiktokCount}
          accent="bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
        />
        <StatCard
          icon={TrendingUp}
          label="Toplam Sosyal Hesap"
          value={stats.totalAccounts}
          accent="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BarReport
          title="Platforma Göre Toplam Takipçi"
          rows={stats.platforms.map((p) => ({
            key: p.slug,
            label: `${p.name} (${p.influencerCount})`,
            value: p.totalFollowers,
          }))}
        />
        <BarReport
          title="En Yüksek Takipçili Influencer'lar"
          rows={stats.topInfluencers.map((t) => ({ key: t.id, label: t.name, value: t.totalFollowers }))}
        />
      </div>
    </div>
  );
}
