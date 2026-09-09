"use client";

import { useMemo } from "react";
import type { ElementType } from "react";
import { ArrowDown, Award, Crown, Sprout, TrendingDown, TrendingUp, Users } from "lucide-react";
import { formatFollowerCount } from "@/lib/utils";
import { resolvePlatformIcon } from "@/lib/social-platform-icons";
import {
  influencerDisplayName,
  influencerTier,
  INFLUENCER_TIER_BADGE_CLASS,
  INFLUENCER_TIERS,
  type InfluencerRow,
  type InfluencerTierKey,
} from "./types";

// Kategorisiz influencer'lar (contentCategory === null) bu anahtar altında
// ayrı bir kovada toplanır — bar grafikte görünür ama en çok/en az kategori
// analizine (topCategory/bottomCategory) dahil EDİLMEZ, çünkü gerçek bir
// kategori değil, kategori atanmamışlık durumudur.
const CATEGORY_NONE_KEY = "__none__";

const TIER_ICONS: Record<InfluencerTierKey, ElementType> = { nano: Sprout, mikro: Users, makro: TrendingUp, mega: Crown };

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
  formatValue = formatFollowerCount,
}: {
  title: string;
  rows: { key: string; label: string; value: number }[];
  /** Değer etiketini biçimlendirir — takipçi toplamları için varsayılan (12.5k), sayım için ezilir. */
  formatValue?: (value: number) => string;
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
                <span className="font-bold text-slate-500 dark:text-slate-400">{formatValue(row.value)}</span>
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
 * "En çok / en az" analitik kartı — bir kategori/seviye adı ve influencer
 * sayısını vurgular. `item` null ise (ör. henüz hiç kategori atanmamış)
 * boş durum metni gösterir.
 */
function HighlightCard({
  icon: Icon,
  accent,
  title,
  item,
  emptyText,
}: {
  icon: ElementType;
  accent: string;
  title: string;
  item: { label: string; count: number } | null;
  emptyText: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
      <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        {item ? (
          <>
            <div className="truncate text-base font-extrabold text-slate-900 dark:text-white" title={item.label}>
              {item.label}
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {title} · {item.count} influencer
            </div>
          </>
        ) : (
          <>
            <div className="text-base font-extrabold text-slate-400 dark:text-slate-600">—</div>
            <div className="text-xs font-semibold text-slate-400 dark:text-slate-500">{emptyText}</div>
          </>
        )}
      </div>
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

    // Seviye (Nano/Mikro/Makro/Mega) dağılımı — sadece bu 4 resmi basamak;
    // 1.000 takipçinin altındaki influencer'lar (influencerTier() === null)
    // hiçbirine sayılmaz.
    const tierCounts: Record<InfluencerTierKey, number> = { nano: 0, mikro: 0, makro: 0, mega: 0 };

    // İçerik kategorisi dağılımı — kategorisiz olanlar ayrı "Kategorisiz"
    // kovasında toplanır (bar grafikte görünür, ama en çok/en az analizine
    // dahil edilmez — bkz. CATEGORY_NONE_KEY).
    const categoryCountMap = new Map<string, { name: string; count: number }>();

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

      const tier = influencerTier(inf);
      if (tier) tierCounts[tier.key] += 1;

      const catKey = inf.contentCategory?.id ?? CATEGORY_NONE_KEY;
      const catName = inf.contentCategory?.name ?? "Kategorisiz";
      const existingCat = categoryCountMap.get(catKey);
      if (existingCat) existingCat.count += 1;
      else categoryCountMap.set(catKey, { name: catName, count: 1 });
    }

    const platforms = [...platformMap.values()]
      .map((p) => ({ ...p, influencerCount: p.influencerIds.size }))
      .sort((a, b) => b.totalFollowers - a.totalFollowers);

    const topInfluencers = [...topList].sort((a, b) => b.totalFollowers - a.totalFollowers).slice(0, 8);

    const instagram = platforms.find((p) => p.slug === "instagram");
    const tiktok = platforms.find((p) => p.slug === "tiktok");

    const categoryCounts = [...categoryCountMap.entries()]
      .map(([key, v]) => ({ key, ...v }))
      .sort((a, b) => b.count - a.count);
    // Gerçek kategoriler — "Kategorisiz" kovası en çok/en az analizinden hariç.
    const namedCategoryCounts = categoryCounts.filter((c) => c.key !== CATEGORY_NONE_KEY);
    const topCategory = namedCategoryCounts[0] ?? null;
    const bottomCategory = namedCategoryCounts.length > 0 ? namedCategoryCounts[namedCategoryCounts.length - 1] : null;

    const tierRows = INFLUENCER_TIERS.map((t) => ({ key: t.key, label: t.label, count: tierCounts[t.key] }));
    const populatedTiers = tierRows.filter((t) => t.count > 0);
    const topTier = populatedTiers.length > 0 ? [...populatedTiers].sort((a, b) => b.count - a.count)[0] : null;
    const bottomTier = populatedTiers.length > 0 ? [...populatedTiers].sort((a, b) => a.count - b.count)[0] : null;

    return {
      totalInfluencers: influencers.length,
      totalAccounts,
      instagramCount: instagram?.influencerCount ?? 0,
      tiktokCount: tiktok?.influencerCount ?? 0,
      platforms,
      topInfluencers,
      tierCounts,
      categoryCounts,
      topCategory,
      bottomCategory,
      topTier,
      bottomTier,
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

      {/* Takipçi bazlı seviye dağılımı — bkz. types.ts#influencerTier. */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {INFLUENCER_TIERS.map((tier) => (
          <StatCard
            key={tier.key}
            icon={TIER_ICONS[tier.key]}
            label={tier.label}
            value={stats.tierCounts[tier.key]}
            accent={INFLUENCER_TIER_BADGE_CLASS[tier.key]}
          />
        ))}
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BarReport
          title="İçerik Kategorisine Göre Influencer Sayısı"
          rows={stats.categoryCounts.map((c) => ({ key: c.key, label: c.name, value: c.count }))}
          formatValue={(v) => `${v} influencer`}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <HighlightCard
            icon={Award}
            accent="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
            title="En çok influencer'lı kategori"
            item={stats.topCategory ? { label: stats.topCategory.name, count: stats.topCategory.count } : null}
            emptyText="Henüz kategori atanmamış."
          />
          <HighlightCard
            icon={TrendingDown}
            accent="bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
            title="En az influencer'lı kategori"
            item={stats.bottomCategory ? { label: stats.bottomCategory.name, count: stats.bottomCategory.count } : null}
            emptyText="Henüz kategori atanmamış."
          />
          <HighlightCard
            icon={Crown}
            accent="bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
            title="En kalabalık seviye"
            item={stats.topTier ? { label: stats.topTier.label, count: stats.topTier.count } : null}
            emptyText="Henüz 1.000+ takipçili influencer yok."
          />
          <HighlightCard
            icon={ArrowDown}
            accent="bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            title="En az kalabalık seviye"
            item={stats.bottomTier ? { label: stats.bottomTier.label, count: stats.bottomTier.count } : null}
            emptyText="Henüz 1.000+ takipçili influencer yok."
          />
        </div>
      </div>
    </div>
  );
}
