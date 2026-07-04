"use client";

import { useCallback, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import YoutubeExtension from "@tiptap/extension-youtube";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading2,
  Heading3,
  LinkIcon,
  ImageIcon,
  Youtube as YoutubeIcon,
  Undo2,
  Redo2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { uploadBlogContentImage, ACCEPTED_BLOG_IMAGE_TYPES } from "@/lib/blog-upload";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  draftId: string;
  placeholder?: string;
}

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={isActive}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md text-nomad-fog transition-colors hover:bg-nomad-steel disabled:pointer-events-none disabled:opacity-40",
        isActive && "bg-nomad-red/20 text-nomad-red"
      )}
    >
      {children}
    </button>
  );
}

function LinkDialog({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");

  function handleOpen() {
    const existing = editor.getAttributes("link").href as string | undefined;
    setUrl(existing ?? "");
    setOpen(true);
  }

  function handleInsert() {
    if (!url) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
    setOpen(false);
    setUrl("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <ToolbarButton onClick={handleOpen} isActive={editor.isActive("link")} label="Insert link">
        <LinkIcon className="h-4 w-4" />
      </ToolbarButton>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert Link</DialogTitle>
        </DialogHeader>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          autoFocus
        />
        <DialogFooter>
          <Button type="button" onClick={handleInsert}>
            {url ? "Insert Link" : "Remove Link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function VideoDialog({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");

  function handleInsert() {
    if (!url) return;
    editor.commands.setYoutubeVideo({ src: url, width: 640, height: 360 });
    setOpen(false);
    setUrl("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <ToolbarButton onClick={() => setOpen(true)} label="Embed YouTube video">
        <YoutubeIcon className="h-4 w-4" />
      </ToolbarButton>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Embed YouTube Video</DialogTitle>
        </DialogHeader>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          autoFocus
        />
        <DialogFooter>
          <Button type="button" onClick={handleInsert} disabled={!url}>
            Embed Video
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RichTextEditor({ value, onChange, draftId, placeholder }: RichTextEditorProps) {
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      ImageExtension.configure({ HTMLAttributes: { class: "rounded-lg" } }),
      LinkExtension.configure({ openOnClick: false, autolink: true }),
      YoutubeExtension.configure({ nocookie: true, HTMLAttributes: { class: "rounded-lg w-full aspect-video" } }),
      Placeholder.configure({ placeholder: placeholder ?? "Tell the story of the ride..." }),
      CharacterCount,
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose prose-invert prose-nomad max-w-none min-h-[320px] px-4 py-3 focus:outline-none prose-headings:font-display prose-img:rounded-lg",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file || !editor) return;

      if (!ACCEPTED_BLOG_IMAGE_TYPES.includes(file.type)) {
        toast.error("Unsupported image type.");
        return;
      }

      setIsUploadingImage(true);
      try {
        const url = await uploadBlogContentImage(file, draftId);
        editor.chain().focus().setImage({ src: url, alt: "" }).run();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Image upload failed.");
      } finally {
        setIsUploadingImage(false);
      }
    },
    [editor, draftId]
  );

  if (!editor) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-md border border-nomad-steel bg-nomad-charcoal">
        <Loader2 className="h-6 w-6 animate-spin text-nomad-red" />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-nomad-steel bg-nomad-charcoal">
      <div className="flex flex-wrap items-center gap-1 border-b border-nomad-steel bg-nomad-black/40 p-2">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")} label="Bold">
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")} label="Italic">
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive("strike")} label="Strikethrough">
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive("code")} label="Inline code">
          <Code className="h-4 w-4" />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-nomad-steel" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          label="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive("heading", { level: 3 })}
          label="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-nomad-steel" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")} label="Bullet list">
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")} label="Numbered list">
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive("blockquote")} label="Quote">
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive("codeBlock")} label="Code block">
          <Code className="h-4 w-4 rotate-90" />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-nomad-steel" />

        <LinkDialog editor={editor} />

        <label className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-nomad-fog transition-colors hover:bg-nomad-steel">
          {isUploadingImage ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImageIcon className="h-4 w-4" />
          )}
          <input
            type="file"
            accept={ACCEPTED_BLOG_IMAGE_TYPES.join(",")}
            onChange={handleImageUpload}
            className="hidden"
            disabled={isUploadingImage}
          />
        </label>

        <VideoDialog editor={editor} />

        <span className="mx-1 h-5 w-px bg-nomad-steel" />

        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} label="Undo">
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} label="Redo">
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} />

      <div className="border-t border-nomad-steel px-4 py-2 text-right text-xs text-nomad-ash">
        {editor.storage.characterCount.words()} words
      </div>
    </div>
  );
}
