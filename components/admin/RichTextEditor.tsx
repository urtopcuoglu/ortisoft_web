"use client";

import { useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import {
  Bold, Italic, List, ListOrdered, Link2, Undo, Redo, Heading2, Heading3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const toolbarBtn =
  "flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:hover:bg-transparent";

export default function RichTextEditor({
  name,
  defaultValue = "",
}: {
  name: string;
  defaultValue?: string;
}) {
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: defaultValue,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose-sm max-w-none min-h-[280px] px-4 py-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-bold [&_h3]:mt-3 [&_h3]:mb-1.5 [&_p]:mb-3 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-blue-600 [&_a]:underline",
      },
    },
    onUpdate: ({ editor }) => {
      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = editor.getHTML();
      }
    },
  });

  if (!editor) {
    return <div className="min-h-[320px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50" />;
  }

  return (
    <div className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 dark:border-slate-800 px-2 py-1.5">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(toolbarBtn, editor.isActive("bold") && "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white")}>
          <Bold className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(toolbarBtn, editor.isActive("italic") && "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white")}>
          <Italic className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn(toolbarBtn, editor.isActive("heading", { level: 2 }) && "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white")}>
          <Heading2 className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn(toolbarBtn, editor.isActive("heading", { level: 3 }) && "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white")}>
          <Heading3 className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(toolbarBtn, editor.isActive("bulletList") && "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white")}>
          <List className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(toolbarBtn, editor.isActive("orderedList") && "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white")}>
          <ListOrdered className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            const url = window.prompt("Bağlantı URL'si:");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          className={cn(toolbarBtn, editor.isActive("link") && "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white")}
        >
          <Link2 className="h-4 w-4" />
        </button>
        <div className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700" />
        <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className={toolbarBtn}>
          <Undo className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className={toolbarBtn}>
          <Redo className="h-4 w-4" />
        </button>
      </div>

      <EditorContent editor={editor} />

      <input ref={hiddenInputRef} type="hidden" name={name} defaultValue={defaultValue} />
    </div>
  );
}
