"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

export default function RichTextEditor({ value, onChange, placeholder = "Type here..." }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div style={{ border: "1px solid var(--rule)", borderRadius: "var(--radius)", overflow: "hidden", background: "#fff" }}>
      <div style={{ background: "var(--parchment)", borderBottom: "1px solid var(--rule)", padding: ".5rem", display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`btn btn-sm ${editor.isActive('bold') ? 'btn-primary' : 'btn-secondary'}`}>
          <strong>B</strong>
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`btn btn-sm ${editor.isActive('italic') ? 'btn-primary' : 'btn-secondary'}`}>
          <em>I</em>
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`btn btn-sm ${editor.isActive('heading', { level: 2 }) ? 'btn-primary' : 'btn-secondary'}`}>
          H2
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`btn btn-sm ${editor.isActive('heading', { level: 3 }) ? 'btn-primary' : 'btn-secondary'}`}>
          H3
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`btn btn-sm ${editor.isActive('bulletList') ? 'btn-primary' : 'btn-secondary'}`}>
          • List
        </button>
      </div>
      <div style={{ padding: "1rem", minHeight: "150px" }} className="tiptap-content">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
