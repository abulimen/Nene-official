import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../../services/api';
import { ArrowLeft, Save, X, Image as ImageIcon, Settings, Layout, Menu, Eye, ChevronRight, UploadCloud } from 'lucide-react';
import TipTapEditor from '../../components/admin/TipTapEditor';
import { getUploadUrl } from '../../utils/config';

const BlogEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(!!id);
    const [saving, setSaving] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        category: 'News',
        image_url: '',
        is_published: true,
        stagedImage: null,
        imagePreview: null
    });

    useEffect(() => {
        if (id) {
            fetchPost();
        }
    }, [id]);

    const fetchPost = async () => {
        try {
            const response = await adminService.getBlogPosts();
            const post = response.data.data.find(p => p.id === parseInt(id));
            if (post) {
                setFormData({
                    title: post.title,
                    excerpt: post.excerpt,
                    content: post.content,
                    category: post.category,
                    image_url: post.image_url,
                    is_published: post.is_published,
                    stagedImage: null,
                    imagePreview: null
                });
            }
        } catch (error) {
            console.error('Error fetching post:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFormData(prev => ({ ...prev, stagedImage: file, imagePreview: URL.createObjectURL(file) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            let imageUrl = formData.image_url;

            if (formData.stagedImage) {
                const imageFormData = new FormData();
                imageFormData.append('image', formData.stagedImage);
                const uploadResponse = await adminService.uploadImage(imageFormData);
                imageUrl = uploadResponse.data.data.filename;
            }

            const payload = {
                title: formData.title,
                excerpt: formData.excerpt,
                content: formData.content,
                category: formData.category,
                image_url: imageUrl,
                is_published: formData.is_published
            };

            if (id) {
                await adminService.updateBlogPost(id, payload);
            } else {
                await adminService.createBlogPost(payload);
            }

            navigate('/admin/blog');
        } catch (error) {
            console.error('Error saving post:', error);
            alert('Failed to save post');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#F9F7F2]">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="h-8 w-8 bg-stone-200 rounded-full"></div>
                    <div className="text-stone-400 font-serif">Loading your story...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#F9F7F2] font-sans overflow-hidden">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col relative min-w-0 transition-all duration-300 ease-in-out">

                {/* Top Navigation Bar */}
                <header className="h-16 px-4 md:px-8 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-stone-100 z-20 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin/blog')}
                            className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-500 hover:text-stone-900"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                                {id ? 'Editing Post' : 'New Story'}
                            </span>
                            <span className="text-sm font-medium text-stone-900 flex items-center gap-2">
                                {formData.is_published ? (
                                    <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                                ) : (
                                    <span className="inline-block w-2 h-2 rounded-full bg-amber-400"></span>
                                )}
                                {formData.is_published ? 'Published' : 'Draft'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-stone-100 text-stone-900' : 'text-stone-500 hover:bg-stone-50'}`}
                            title="Settings"
                        >
                            <Settings size={20} />
                        </button>
                        <div className="h-6 w-px bg-stone-200 mx-1"></div>
                        <button
                            onClick={handleSubmit}
                            disabled={saving || !formData.title}
                            className="flex items-center gap-2 bg-[#151515] text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-stone-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-95"
                        >
                            {saving ? (
                                <UploadCloud size={18} className="animate-bounce" />
                            ) : (
                                <Save size={18} />
                            )}
                            <span className="hidden md:inline">{saving ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                    </div>
                </header>

                {/* Editor Canvas */}
                <main className="flex-1 overflow-y-auto scroll-smooth">
                    <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
                        {/* Title Input */}
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full text-4xl md:text-6xl font-serif font-bold text-[#151515] placeholder:text-stone-300 border-none focus:ring-0 p-0 mb-8 bg-transparent leading-tight"
                            placeholder="The Title of Your Story"
                            autoFocus
                        />

                        {/* TipTap Editor */}
                        <div className="min-h-[500px]">
                            <TipTapEditor
                                content={formData.content}
                                onChange={(content) => setFormData({ ...formData, content })}
                                placeholder="Tell your story..."
                            />
                        </div>

                        <div className="h-32"></div> {/* Bottom spacing */}
                    </div>
                </main>
            </div>

            {/* Right Sidebar - Settings Drawer */}
            <div
                className={`fixed inset-y-0 right-0 z-30 w-full md:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${showSettings ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="h-full flex flex-col">
                    <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-white">
                        <h2 className="text-xl font-serif font-bold text-[#151515]">Post Settings</h2>
                        <button
                            onClick={() => setShowSettings(false)}
                            className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-500"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {/* Status Toggle */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Visibility</label>
                            <div className="flex p-1 bg-stone-100 rounded-lg">
                                <button
                                    onClick={() => setFormData({ ...formData, is_published: false })}
                                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!formData.is_published ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}
                                >
                                    Draft
                                </button>
                                <button
                                    onClick={() => setFormData({ ...formData, is_published: true })}
                                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${formData.is_published ? 'bg-white shadow-sm text-green-600' : 'text-stone-500 hover:text-stone-700'}`}
                                >
                                    Published
                                </button>
                            </div>
                        </div>

                        {/* Category */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Category</label>
                            <div className="relative">
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full appearance-none bg-stone-50 border border-stone-200 text-stone-900 text-sm rounded-xl focus:ring-stone-900 focus:border-stone-900 block w-full p-3"
                                >
                                    <option value="News">News & Updates</option>
                                    <option value="Recipes">Recipes & Tips</option>
                                    <option value="Health">Health & Wellness</option>
                                    <option value="Events">Community Events</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-stone-500">
                                    <ChevronRight size={16} className="rotate-90" />
                                </div>
                            </div>
                        </div>

                        {/* Excerpt */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Excerpt</label>
                            <textarea
                                value={formData.excerpt}
                                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                className="w-full bg-stone-50 border border-stone-200 text-stone-900 text-sm rounded-xl focus:ring-stone-900 focus:border-stone-900 block w-full p-3 min-h-[120px] resize-none"
                                placeholder="Write a short summary to hook your readers..."
                            />
                        </div>

                        {/* Featured Image */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Featured Image</label>
                            <div className="group relative w-full aspect-video bg-stone-50 border-2 border-dashed border-stone-200 rounded-xl overflow-hidden hover:border-stone-400 transition-colors">
                                {(formData.imagePreview || formData.image_url) ? (
                                    <>
                                        <img
                                            src={formData.imagePreview || getUploadUrl(formData.image_url)}
                                            alt="Featured"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <label className="p-2 bg-white rounded-full cursor-pointer hover:bg-stone-100 transition-colors">
                                                <ImageIcon size={18} className="text-stone-700" />
                                                <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                                            </label>
                                            <button
                                                onClick={() => setFormData({ ...formData, image_url: '', stagedImage: null, imagePreview: null })}
                                                className="p-2 bg-white rounded-full hover:bg-red-50 text-red-600 transition-colors"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <label className="flex flex-col items-center justify-center h-full cursor-pointer">
                                        <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                            <UploadCloud size={24} className="text-stone-400" />
                                        </div>
                                        <span className="text-sm font-medium text-stone-500">Click to upload image</span>
                                        <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-stone-50 border-t border-stone-100">
                        <button
                            onClick={handleSubmit}
                            disabled={saving || !formData.title}
                            className="w-full bg-[#151515] text-white py-3 rounded-xl font-medium hover:bg-stone-800 transition-colors shadow-lg disabled:opacity-50"
                        >
                            {saving ? 'Saving Changes...' : 'Save & Close'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Overlay for mobile settings */}
            {showSettings && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 md:hidden"
                    onClick={() => setShowSettings(false)}
                />
            )}
        </div>
    );
};

export default BlogEditor;
