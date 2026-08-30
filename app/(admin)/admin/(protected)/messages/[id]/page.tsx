import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { getMessage, deleteMessage } from "@/modules/messages/actions";
import MessageStatusSelect from "@/components/admin/MessageStatusSelect";
import MessageReplyForm from "@/components/admin/MessageReplyForm";
import DeleteForm from "@/components/admin/DeleteForm";
import { MESSAGE_PURPOSE_LABEL } from "@/modules/messages/schema";
import type { MessageStatusValue, MessagePurposeValue } from "@/modules/messages/schema";

export const metadata: Metadata = {
  title: "Mesaj Detayı | Ortisoft Admin",
  robots: { index: false, follow: false },
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function AdminMessageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const msg = await getMessage(id);
  if (!msg) notFound();

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">{msg.name}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {msg.email} {msg.phone && <>· {msg.phone}</>} {msg.company && <>· {msg.company}</>}
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{formatDate(msg.createdAt)}</p>
          <span className="mt-2 inline-block rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-600 dark:text-slate-300">
            {MESSAGE_PURPOSE_LABEL[msg.purpose as MessagePurposeValue]}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MessageStatusSelect messageId={msg.id} status={msg.status as MessageStatusValue} />
          <DeleteForm
            action={deleteMessage.bind(null, msg.id)}
            confirmMessage={`"${msg.name}" mesajı silinsin mi? Bu işlem geri alınamaz.`}
          />
        </div>
      </div>

      {msg.service && (
        <div className="text-sm">
          <span className="font-semibold text-slate-600 dark:text-slate-300">İlgilenilen hizmet: </span>
          <span className="text-slate-500 dark:text-slate-400">{msg.service}</span>
        </div>
      )}

      {msg.cvFilePath && (
        <a
          href={`/admin/career/cvs/${msg.id}/download`}
          className="flex w-fit items-center gap-2 rounded-xl border border-violet-200 dark:border-violet-900 bg-violet-50 dark:bg-violet-500/10 px-4 py-3 text-sm font-semibold text-violet-700 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-500/20"
        >
          <Download className="w-4 h-4" /> CV&apos;yi İndir {msg.cvFileName && `(${msg.cvFileName})`}
        </a>
      )}

      {msg.message && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Mesaj</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-300">{msg.message}</p>
        </div>
      )}

      {msg.replies.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Geçmiş Yanıtlar</h2>
          {msg.replies.map((reply) => (
            <div key={reply.id} className="rounded-xl border border-blue-100 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-500/10 p-5">
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-300">{reply.body}</p>
              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                {reply.sentBy?.name ?? "Admin"} · {formatDate(reply.sentAt)}
              </p>
            </div>
          ))}
        </div>
      )}

      <MessageReplyForm
        messageId={msg.id}
        recipientEmail={msg.email}
        recipientName={msg.name}
        subject={`Re: Ortisoft — Mesajınız Hakkında`}
      />
    </div>
  );
}
