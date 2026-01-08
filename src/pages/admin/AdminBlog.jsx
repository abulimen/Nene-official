import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/api';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { getUploadUrl } from '../../utils/config';

const AdminBlog = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await adminService.getBlogPosts();
            setPosts(response.data.data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await adminService.deleteBlogPost(id);
                fetchPosts();
            } catch (error) {
                console.error('Error deleting post:', error);
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8" data-tour="blog-header">
                <h1 className="text-3xl font-serif font-bold text-stone-900">Blog Posts</h1>
                <button
                    onClick={() => navigate('/admin/blog/new')}
                    className="bg-stone-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-stone-800 transition-colors"
                    data-tour="add-post-btn"
                >
                    <Plus size={20} />
                    Add Post
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden" data-tour="blog-posts">
                <div className="overflow-x-auto">
                    <table className="w-full whitespace-nowrap">
                        <thead className="bg-stone-50">
                            <tr className="text-left">
                                <th className="px-6 py-4 text-stone-500 font-medium">Post</th>
                                <th className="px-6 py-4 text-stone-500 font-medium">Category</th>
                                <th className="px-6 py-4 text-stone-500 font-medium">Date</th>
                                <th className="px-6 py-4 text-stone-500 font-medium">Status</th>
                                <th className="px-6 py-4 text-stone-500 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {loading ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center">Loading...</td></tr>
                            ) : posts.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center">No posts found</td></tr>
                            ) : (
                                posts.map((post) => (
                                    <tr key={post.id} className="hover:bg-stone-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={getUploadUrl(post.image_url) || '/api/placeholder/40/40'}
                                                    alt={post.title}
                                                    className="w-10 h-10 rounded-lg object-cover bg-stone-100"
                                                />
                                                <span className="font-medium text-stone-900">{post.title}</span>
                                            </div >
                                        </td >
                                        <td className="px-6 py-4 text-stone-600">{post.category}</td>
                                        <td className="px-6 py-4 text-stone-500">{new Date(post.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${post.is_published ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-700'
                                                }`}>
                                                {post.is_published ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/admin/blog/edit/${post.id}`)}
                                                    className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(post.id)}
                                                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr >
                                ))
                            )}
                        </tbody >
                    </table >
                </div>
            </div>
        </div>
    );
};

export default AdminBlog;
