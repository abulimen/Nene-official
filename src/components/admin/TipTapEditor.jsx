import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import {
    Bold, Italic, Strikethrough, Code, List, ListOrdered,
    Quote, Minus, Undo2, Redo2, AlignLeft, AlignCenter,
    AlignRight, AlignJustify, Link2, Image as ImageIcon,
    Table as TableIcon, Heading1, Heading2, Heading3
} from 'lucide-react';
import { adminService } from '../../services/api';
import { getUploadUrl } from '../../utils/config';

const MenuBar = ({ editor }) => {
    if (!editor) return null;

    const addImage = async () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('image', file);

            try {
                const response = await adminService.uploadImage(formData);
                const imageUrl = getUploadUrl(response.data.data.filename);
                editor.chain().focus().setImage({ src: imageUrl }).run();
            } catch (error) {
                console.error('Error uploading image:', error);
                alert('Failed to upload image');
            }
        };
    };

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const addTable = () => {
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    };

    return (
        <div className="bg-white sticky top-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 border-b border-stone-100">
            <div className="flex flex-wrap gap-1 p-2">
                {/* Text Formatting */}
                <div className="flex gap-0.5 border-r border-stone-200 pr-2">
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={`p-2 rounded hover:bg-stone-100 ${editor.isActive('heading', { level: 1 }) ? 'bg-stone-200' : ''}`}
                        title="Heading 1"
                    >
                        <Heading1 size={18} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={`p-2 rounded hover:bg-stone-100 ${editor.isActive('heading', { level: 2 }) ? 'bg-stone-200' : ''}`}
                        title="Heading 2"
                    >
                        <Heading2 size={18} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        className={`p-2 rounded hover:bg-stone-100 ${editor.isActive('heading', { level: 3 }) ? 'bg-stone-200' : ''}`}
                        title="Heading 3"
                    >
                        <Heading3 size={18} />
                    </button>
                </div>

                {/* Basic Formatting */}
                <div className="flex gap-0.5 border-r border-stone-200 pr-2">
                    <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`p-2 rounded hover:bg-stone-100 ${editor.isActive('bold') ? 'bg-stone-200' : ''}`}
                        title="Bold"
                    >
                        <Bold size={18} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`p-2 rounded hover:bg-stone-100 ${editor.isActive('italic') ? 'bg-stone-200' : ''}`}
                        title="Italic"
                    >
                        <Italic size={18} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        className={`p-2 rounded hover:bg-stone-100 ${editor.isActive('strike') ? 'bg-stone-200' : ''}`}
                        title="Strikethrough"
                    >
                        <Strikethrough size={18} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        className={`p-2 rounded hover:bg-stone-100 ${editor.isActive('code') ? 'bg-stone-200' : ''}`}
                        title="Code"
                    >
                        <Code size={18} />
                    </button>
                </div>

                {/* Alignment */}
                <div className="flex gap-0.5 border-r border-stone-200 pr-2">
                    <button
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        className={`p-2 rounded hover:bg-stone-100 ${editor.isActive({ textAlign: 'left' }) ? 'bg-stone-200' : ''}`}
                        title="Align Left"
                    >
                        <AlignLeft size={18} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        className={`p-2 rounded hover:bg-stone-100 ${editor.isActive({ textAlign: 'center' }) ? 'bg-stone-200' : ''}`}
                        title="Align Center"
                    >
                        <AlignCenter size={18} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        className={`p-2 rounded hover:bg-stone-100 ${editor.isActive({ textAlign: 'right' }) ? 'bg-stone-200' : ''}`}
                        title="Align Right"
                    >
                        <AlignRight size={18} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                        className={`p-2 rounded hover:bg-stone-100 ${editor.isActive({ textAlign: 'justify' }) ? 'bg-stone-200' : ''}`}
                        title="Justify"
                    >
                        <AlignJustify size={18} />
                    </button>
                </div>

                {/* Lists */}
                <div className="flex gap-0.5 border-r border-stone-200 pr-2">
                    <button
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={`p-2 rounded hover:bg-stone-100 ${editor.isActive('bulletList') ? 'bg-stone-200' : ''}`}
                        title="Bullet List"
                    >
                        <List size={18} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={`p-2 rounded hover:bg-stone-100 ${editor.isActive('orderedList') ? 'bg-stone-200' : ''}`}
                        title="Numbered List"
                    >
                        <ListOrdered size={18} />
                    </button>
                </div>

                {/* Insert */}
                <div className="flex gap-0.5 border-r border-stone-200 pr-2">
                    <button
                        onClick={setLink}
                        className={`p-2 rounded hover:bg-stone-100 ${editor.isActive('link') ? 'bg-stone-200' : ''}`}
                        title="Add Link"
                    >
                        <Link2 size={18} />
                    </button>
                    <button
                        onClick={addImage}
                        className="p-2 rounded hover:bg-stone-100"
                        title="Insert Image"
                    >
                        <ImageIcon size={18} />
                    </button>
                    <button
                        onClick={addTable}
                        className="p-2 rounded hover:bg-stone-100"
                        title="Insert Table"
                    >
                        <TableIcon size={18} />
                    </button>
                </div>

                {/* Blocks */}
                <div className="flex gap-0.5 border-r border-stone-200 pr-2">
                    <button
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={`p-2 rounded hover:bg-stone-100 ${editor.isActive('blockquote') ? 'bg-stone-200' : ''}`}
                        title="Quote"
                    >
                        <Quote size={18} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                        className="p-2 rounded hover:bg-stone-100"
                        title="Horizontal Line"
                    >
                        <Minus size={18} />
                    </button>
                </div>

                {/* History */}
                <div className="flex gap-0.5">
                    <button
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        className="p-2 rounded hover:bg-stone-100 disabled:opacity-30"
                        title="Undo"
                    >
                        <Undo2 size={18} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        className="p-2 rounded hover:bg-stone-100 disabled:opacity-30"
                        title="Redo"
                    >
                        <Redo2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

const TipTapEditor = ({ content, onChange, placeholder = "Start writing..." }) => {
    const [showImageToolbar, setShowImageToolbar] = useState(false);
    const [imageToolbarPos, setImageToolbarPos] = useState({ top: 0, left: 0 });
    const [showTextToolbar, setShowTextToolbar] = useState(false);
    const [textToolbarPos, setTextToolbarPos] = useState({ top: 0, left: 0 });

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Image.configure({
                inline: true,
                allowBase64: true,
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full h-auto cursor-pointer',
                },
            }).extend({
                addAttributes() {
                    return {
                        ...this.parent?.(),
                        align: {
                            default: 'left',
                            parseHTML: element => element.getAttribute('data-align'),
                            renderHTML: attributes => {
                                return {
                                    'data-align': attributes.align,
                                    style: `display: block; margin-left: ${attributes.align === 'left' ? '0' : attributes.align === 'center' ? 'auto' : 'auto'}; margin-right: ${attributes.align === 'right' ? '0' : attributes.align === 'center' ? 'auto' : 'auto'};`
                                };
                            },
                        },
                    };
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-500 underline',
                },
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            Placeholder.configure({
                placeholder,
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        onSelectionUpdate: ({ editor }) => {
            const { selection } = editor.state;

            // Hide text toolbar if selection is empty or it's an image selection
            if (selection.empty || editor.isActive('image')) {
                setShowTextToolbar(false);
                return;
            }

            // Get selection coordinates
            const { from, to } = selection;
            const start = editor.view.coordsAtPos(from);
            const end = editor.view.coordsAtPos(to);

            // Calculate center position above selection
            // We use the 'end' coordinate mostly but averaging or using getBoundingClientRect of range is better
            // Let's try to get the DOM range rect
            try {
                const domRange = editor.view.dom.ownerDocument.getSelection().getRangeAt(0);
                const rect = domRange.getBoundingClientRect();

                setTextToolbarPos({
                    top: rect.top - 50, // Position above
                    left: rect.left + (rect.width / 2) - 200, // Center horizontally (assuming toolbar width ~400px)
                });
                setShowTextToolbar(true);
            } catch (e) {
                setShowTextToolbar(false);
            }
        },
        editorProps: {
            attributes: {
                class: 'prose prose-stone prose-lg max-w-none focus:outline-none min-h-[500px] px-4 py-2',
            },
        },
    });

    // Handle image clicks to show alignment toolbar
    useEffect(() => {
        if (!editor) return;

        const handleClick = (event) => {
            const target = event.target;
            if (target.tagName === 'IMG') {
                const rect = target.getBoundingClientRect();
                setImageToolbarPos({
                    top: rect.top - 50,
                    left: rect.left + rect.width / 2 - 75,
                });
                setShowImageToolbar(true);

                // Select the image
                const pos = editor.view.posAtDOM(target, 0);
                editor.commands.setNodeSelection(pos);
                setShowTextToolbar(false); // Hide text toolbar when image is clicked
            } else {
                setShowImageToolbar(false);
            }
        };

        const editorElement = editor.view.dom;
        editorElement.addEventListener('click', handleClick);

        return () => {
            editorElement.removeEventListener('click', handleClick);
        };
    }, [editor]);

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    return (
        <div className="relative group">
            <MenuBar editor={editor} />

            {/* Custom Image Alignment Toolbar */}
            {showImageToolbar && editor && (
                <div
                    className="fixed bg-stone-900 text-white rounded-lg shadow-xl p-1.5 flex gap-1 z-50 animate-in fade-in zoom-in-95 duration-200"
                    style={{ top: `${imageToolbarPos.top}px`, left: `${imageToolbarPos.left}px` }}
                >
                    <button
                        onClick={() => {
                            editor.chain().focus().updateAttributes('image', { align: 'left' }).run();
                            setShowImageToolbar(false);
                        }}
                        className="p-2 rounded hover:bg-stone-700 transition-colors"
                        title="Align Left"
                    >
                        <AlignLeft size={18} />
                    </button>
                    <button
                        onClick={() => {
                            editor.chain().focus().updateAttributes('image', { align: 'center' }).run();
                            setShowImageToolbar(false);
                        }}
                        className="p-2 rounded hover:bg-stone-700 transition-colors"
                        title="Align Center"
                    >
                        <AlignCenter size={18} />
                    </button>
                    <button
                        onClick={() => {
                            editor.chain().focus().updateAttributes('image', { align: 'right' }).run();
                            setShowImageToolbar(false);
                        }}
                        className="p-2 rounded hover:bg-stone-700 transition-colors"
                        title="Align Right"
                    >
                        <AlignRight size={18} />
                    </button>
                </div>
            )}

            {/* Custom Text Formatting Toolbar */}
            {showTextToolbar && editor && (
                <div
                    className="fixed bg-stone-900 text-white rounded-lg shadow-xl p-1.5 flex flex-wrap gap-1 z-50 max-w-[90vw] md:max-w-[450px] animate-in fade-in zoom-in-95 duration-200"
                    style={{ top: `${textToolbarPos.top}px`, left: `${textToolbarPos.left}px` }}
                >
                    {/* Headings */}
                    <div className="flex gap-0.5 border-r border-stone-700 pr-1 mr-1">
                        <button
                            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                            className={`p-1.5 rounded hover:bg-stone-700 transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-stone-700 text-amber-400' : ''}`}
                            title="Heading 1"
                        >
                            <Heading1 size={18} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                            className={`p-1.5 rounded hover:bg-stone-700 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-stone-700 text-amber-400' : ''}`}
                            title="Heading 2"
                        >
                            <Heading2 size={18} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().setParagraph().run()}
                            className={`p-1.5 rounded hover:bg-stone-700 transition-colors ${editor.isActive('paragraph') ? 'bg-stone-700 text-amber-400' : ''}`}
                            title="Normal Text"
                        >
                            <span className="text-xs font-bold px-1">P</span>
                        </button>
                    </div>

                    {/* Formatting */}
                    <div className="flex gap-0.5 border-r border-stone-700 pr-1 mr-1">
                        <button
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            className={`p-1.5 rounded hover:bg-stone-700 transition-colors ${editor.isActive('bold') ? 'bg-stone-700 text-amber-400' : ''}`}
                            title="Bold"
                        >
                            <Bold size={18} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            className={`p-1.5 rounded hover:bg-stone-700 transition-colors ${editor.isActive('italic') ? 'bg-stone-700 text-amber-400' : ''}`}
                            title="Italic"
                        >
                            <Italic size={18} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                            className={`p-1.5 rounded hover:bg-stone-700 transition-colors ${editor.isActive('underline') ? 'bg-stone-700 text-amber-400' : ''}`}
                            title="Underline"
                        >
                            <span className="font-bold underline px-1">U</span>
                        </button>
                    </div>

                    {/* Alignment */}
                    <div className="flex gap-0.5 border-r border-stone-700 pr-1 mr-1">
                        <button
                            onClick={() => editor.chain().focus().setTextAlign('left').run()}
                            className={`p-1.5 rounded hover:bg-stone-700 transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'bg-stone-700 text-amber-400' : ''}`}
                            title="Align Left"
                        >
                            <AlignLeft size={18} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().setTextAlign('center').run()}
                            className={`p-1.5 rounded hover:bg-stone-700 transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'bg-stone-700 text-amber-400' : ''}`}
                            title="Align Center"
                        >
                            <AlignCenter size={18} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().setTextAlign('right').run()}
                            className={`p-1.5 rounded hover:bg-stone-700 transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'bg-stone-700 text-amber-400' : ''}`}
                            title="Align Right"
                        >
                            <AlignRight size={18} />
                        </button>
                    </div>

                    {/* Link */}
                    <button
                        onClick={setLink}
                        className={`p-1.5 rounded hover:bg-stone-700 transition-colors ${editor.isActive('link') ? 'bg-stone-700 text-amber-400' : ''}`}
                        title="Link"
                    >
                        <Link2 size={18} />
                    </button>
                </div>
            )}

            <EditorContent editor={editor} />
        </div>
    );
};

export default TipTapEditor;
