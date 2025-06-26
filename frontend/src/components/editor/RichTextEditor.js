import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import {
  FiBold,
  FiItalic,
  FiCode,
  FiList,
  FiLink,
  FiImage,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiType
} from 'react-icons/fi';
import { BsListOl, BsBlockquoteLeft, BsCodeSlash } from 'react-icons/bs';
import { useTranslation } from 'react-i18next';

const MenuBar = ({ editor }) => {
  const { t } = useTranslation();

  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt('Enter image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="border-b border-base-300 p-2 flex flex-wrap gap-1">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`btn btn-sm ${editor.isActive('bold') ? 'btn-primary' : 'btn-ghost'}`}
        title="Bold"
      >
        <FiBold />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`btn btn-sm ${editor.isActive('italic') ? 'btn-primary' : 'btn-ghost'}`}
        title="Italic"
      >
        <FiItalic />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={`btn btn-sm ${editor.isActive('code') ? 'btn-primary' : 'btn-ghost'}`}
        title="Inline Code"
      >
        <FiCode />
      </button>

      <div className="divider divider-horizontal mx-1" />

      <select
        value=""
        onChange={(e) => {
          const value = e.target.value;
          if (value === 'paragraph') {
            editor.chain().focus().setParagraph().run();
          } else {
            editor.chain().focus().toggleHeading({ level: parseInt(value) }).run();
          }
        }}
        className="select select-bordered select-sm"
      >
        <option value="">Text Style</option>
        <option value="paragraph">Paragraph</option>
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
        <option value="3">Heading 3</option>
      </select>

      <div className="divider divider-horizontal mx-1" />

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`btn btn-sm ${editor.isActive('bulletList') ? 'btn-primary' : 'btn-ghost'}`}
        title="Bullet List"
      >
        <FiList />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`btn btn-sm ${editor.isActive('orderedList') ? 'btn-primary' : 'btn-ghost'}`}
        title="Numbered List"
      >
        <BsListOl />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`btn btn-sm ${editor.isActive('blockquote') ? 'btn-primary' : 'btn-ghost'}`}
        title="Blockquote"
      >
        <BsBlockquoteLeft />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`btn btn-sm ${editor.isActive('codeBlock') ? 'btn-primary' : 'btn-ghost'}`}
        title="Code Block"
      >
        <BsCodeSlash />
      </button>

      <div className="divider divider-horizontal mx-1" />

      <button
        onClick={setLink}
        className={`btn btn-sm ${editor.isActive('link') ? 'btn-primary' : 'btn-ghost'}`}
        title="Add Link"
      >
        <FiLink />
      </button>
      
      <button
        onClick={addImage}
        className="btn btn-sm btn-ghost"
        title="Add Image"
      >
        <FiImage />
      </button>

      <div className="divider divider-horizontal mx-1" />

      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="btn btn-sm btn-ghost"
        title="Undo"
      >
        ↶
      </button>
      
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="btn btn-sm btn-ghost"
        title="Redo"
      >
        ↷
      </button>
    </div>
  );
};

const RichTextEditor = ({ content, onChange, placeholder = 'Start writing...' }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto mx-auto my-4',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary hover:underline',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      CodeBlockLowlight.configure({
          createLowlight,
        HTMLAttributes: {
          class: 'bg-base-300 rounded-lg p-4 my-4 overflow-x-auto',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="border border-base-300 rounded-lg overflow-hidden">
      <MenuBar editor={editor} />
      <EditorContent 
        editor={editor} 
        className="prose prose-lg max-w-none p-4 min-h-[400px] focus:outline-none"
      />
    </div>
  );
};

export default RichTextEditor;
