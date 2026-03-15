'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Toast } from '@/components/Toast';
import { Icon } from '@iconify/react';

export default function MainPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- States สำหรับ Data ---
  const [posts, setPosts] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // --- States สำหรับ Pagination & URL ---
  const POSTS_PER_PAGE = 30;
  const currentPage = Number(searchParams.get('page')) || 1;
  const [inputPage, setInputPage] = useState(currentPage.toString());

  // --- States สำหรับ Search ---
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState({
    title: searchParams.get('title') || '',
    subject_id: searchParams.get('subject_id') || '',
    subject_name: searchParams.get('subject_name') || '',
    author: searchParams.get('author') || '',
  });
  const [tempSearch, setTempSearch] = useState(searchQuery);

  // --- Fetch Data Logic ---
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    
    // 1. ตรวจสอบ Session (เปลี่ยนจาก /login เป็น / เพราะคุณย้ายฟอร์มมาไว้หน้าแรก)
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return router.push('/');
    setUser(session.user);

    // 2. เช็คสิทธิ์ Admin จาก JWT
    const userRole = session.user.app_metadata?.role;
    if (userRole === 'admin') setIsAdmin(true);

    const from = (currentPage - 1) * POSTS_PER_PAGE;
    const to = from + POSTS_PER_PAGE - 1;

    // 3. สร้าง Query
    let query = supabase
      .from('posts')
      .select('*, profiles(username)', { count: 'exact' })
      .eq('is_pending', false)
      .order('created_at', { ascending: false })
      .range(from, to);

    // Apply Search Filters
    if (searchQuery.title) query = query.ilike('title', `%${searchQuery.title}%`);
    if (searchQuery.subject_id) query = query.ilike('subject_id', `%${searchQuery.subject_id}%`);
    if (searchQuery.subject_name) query = query.ilike('subject_name', `%${searchQuery.subject_name}%`);
    
    // ค้นหาชื่อผู้เขียนผ่านการ Filter ตาราง Profiles (Join)
    if (searchQuery.author) {
      query = query.filter('profiles.username', 'ilike', `%${searchQuery.author}%`);
    }

    const { data, count, error } = await query;
    if (!error) {
      setPosts(data || []);
      setTotalCount(count || 0);
    }
    setLoading(false);
  }, [currentPage, searchQuery, router]);

  useEffect(() => {
    fetchPosts();
    setInputPage(currentPage.toString());
  }, [fetchPosts, currentPage]);

  // --- Helpers ---
  const updateURL = (newPage: number, newSearch = searchQuery) => {
    const params = new URLSearchParams();
    params.set('page', newPage.toString());
    if (newSearch.title) params.set('title', newSearch.title);
    if (newSearch.subject_id) params.set('subject_id', newSearch.subject_id);
    if (newSearch.subject_name) params.set('subject_name', newSearch.subject_name);
    if (newSearch.author) params.set('author', newSearch.author);
    router.push(`?${params.toString()}`);
  };

  const handleJumpPage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const pageNum = parseInt(inputPage);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
        updateURL(pageNum);
      } else {
        setInputPage(currentPage.toString());
      }
    }
  };

  const handleSearchSubmit = () => {
    setSearchQuery(tempSearch);
    updateURL(1, tempSearch);
    setIsSearchOpen(false);
  };

  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // --- Delete Account Logic ---
  const handleDeleteAccount = async () => {
    const confirmed = confirm("Are you sure? This will delete your profile and account permanently. Your posts will remain as 'Deleted User'.");
    if (!confirmed) return;

    setLoading(true);
    // ลบที่ profiles แล้ว trigger ใน DB จะลบ auth.users ให้เอง
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user?.id);

    if (error) {
      setToast({ msg: "Failed to delete account: " + error.message, type: 'error' });
      setLoading(false);
    } else {
      await supabase.auth.signOut();
      router.push('/');
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center font-jersey text-3xl animate-pulse text-heritage-logo">
        RECOVERING DATA...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-heritage-bg font-prompt">
      <header className="flex justify-between items-center mb-6">
        <h1 
          className="text-4xl font-bold text-heritage-logo font-jersey cursor-pointer select-none"
          onClick={() => { updateURL(1, {title:'', subject_id:'', subject_name:'', author:''}); }}
        >
          INHERITANCE
        </h1>

        <div className="flex items-center gap-6">
          {isAdmin && (
            <button onClick={() => router.push('/admin')} className="btn-post bg-black text-white px-4 py-2 font-jersey">ADMIN AREA</button>
          )}
          <button onClick={() => setIsSearchOpen(true)} className="btn-search flex items-center gap-2">
            <Icon icon="pixelarticons:search" width="18" /> SEARCH
          </button>
          <button onClick={() => router.push('/create')} className="btn-post">POST</button>

          <div className="relative">
            <span className="font-semibold text-sm cursor-pointer hover:underline font-vt323 px-2 py-1 bg-white/50 rounded" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
              {user?.email} ▾
            </span>
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white border-4 border-black rounded-sm shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] z-50 py-2 font-vt323 text-lg">
                <div className="px-4 py-1 text-xs text-gray-400 border-b mb-1 uppercase tracking-tighter">Account Management</div>
                <button onClick={handleSignOut} className="w-full text-left px-4 py-2 hover:bg-gray-100 uppercase">Logout</button>
                <button 
                  onClick={handleDeleteAccount} 
                  className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 border-t border-dashed mt-1 uppercase"
                >
                  Delete Account
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="main-frame bg-[#D9D9D9] p-8 rounded-sm border-4 border-heritage-frame min-h-[70vh] flex flex-col relative shadow-inner">
        {posts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center opacity-30 font-jersey">
            <Icon icon="pixelarticons:close-box" width="64" />
            <p className="text-3xl mt-4 tracking-widest">NO ARCHIVES FOUND</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {posts.map((post) => (
              <div 
                key={post.id} 
                className="post-card p-5 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col h-full"
                onClick={() => router.push(`/post/${post.id}`)}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-vt323 opacity-70 uppercase bg-gray-100 px-2 py-0.5 border border-black/10">
                    {post.subject_id}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2 line-clamp-1 text-heritage-logo">{post.title}</h3>
                <p className="text-sm font-prompt line-clamp-3 opacity-80 mb-4 flex-grow">{post.description}</p>
                
                <div className="flex justify-between items-end text-xs font-vt323 mt-auto border-t pt-2">
                  <span className="font-bold text-black/70">
                    {/* แก้จุด By Deleted User ที่นี่ */}
                    {post.profiles?.username || "Deleted User"}
                  </span>
                  <span className="opacity-50">{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Control */}
        {totalPages > 1 && (
          <div className="mt-auto pt-8 flex justify-center items-center gap-4 font-jersey text-2xl">
            <button disabled={currentPage <= 1} onClick={() => updateURL(1)} className="disabled:opacity-20 hover:text-heritage-logo transition-colors">{"<<"}</button>
            <button disabled={currentPage <= 1} onClick={() => updateURL(currentPage - 1)} className="disabled:opacity-20 hover:text-heritage-logo transition-colors">{"<"}</button>
            
            <div className="flex items-center gap-2 bg-white border-2 border-black px-4 py-1 rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <input
                type="text"
                value={inputPage}
                onChange={(e) => setInputPage(e.target.value)}
                onKeyDown={handleJumpPage}
                onBlur={() => setInputPage(currentPage.toString())}
                className="w-12 text-center bg-transparent border-b-2 border-heritage-logo focus:outline-none font-bold text-heritage-logo"
              />
              <span className="text-gray-400 font-prompt text-sm">/</span>
              <span>{totalPages}</span>
            </div>

            <button disabled={currentPage >= totalPages} onClick={() => updateURL(currentPage + 1)} className="disabled:opacity-20 hover:text-heritage-logo transition-colors">{">"}</button>
            <button disabled={currentPage >= totalPages} onClick={() => updateURL(totalPages)} className="disabled:opacity-20 hover:text-heritage-logo transition-colors">{">>"}</button>
          </div>
        )}
      </div>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
          <div className="bg-[#d44c24] p-8 rounded-sm border-4 border-white w-full max-w-md shadow-[10px_10px_0px_0px_rgba(0,0,0,0.5)] relative">
            <button onClick={() => setIsSearchOpen(false)} className="absolute top-2 right-4 text-white text-2xl font-bold hover:scale-110 transition-transform">×</button>
            <h2 className="text-white font-jersey text-center mb-6 text-3xl tracking-widest uppercase">Archive Search</h2>
            <div className="space-y-4 font-prompt text-sm">
              <div className="space-y-1">
                <label className="text-white/70 text-[10px] font-bold ml-2">TITLE</label>
                <input type="text" placeholder="ชื่อโพสต์..." className="w-full p-3 border-2 border-black rounded-sm outline-none focus:ring-4 ring-white/20" value={tempSearch.title} onChange={(e) => setTempSearch({ ...tempSearch, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-white/70 text-[10px] font-bold ml-2">SUBJECT ID</label>
                  <input type="text" placeholder="รหัสวิชา" className="w-full p-3 border-2 border-black rounded-sm outline-none focus:ring-4 ring-white/20" value={tempSearch.subject_id} onChange={(e) => setTempSearch({ ...tempSearch, subject_id: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-white/70 text-[10px] font-bold ml-2">SUBJECT NAME</label>
                  <input type="text" placeholder="ชื่อวิชา" className="w-full p-3 border-2 border-black rounded-sm outline-none focus:ring-4 ring-white/20" value={tempSearch.subject_name} onChange={(e) => setTempSearch({ ...tempSearch, subject_name: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-white/70 text-[10px] font-bold ml-2">AUTHOR</label>
                <input type="text" placeholder="เจ้าของโพสต์..." className="w-full p-3 border-2 border-black rounded-sm outline-none focus:ring-4 ring-white/20" value={tempSearch.author} onChange={(e) => setTempSearch({ ...tempSearch, author: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 mt-8 font-jersey text-xl">
              <button onClick={() => setTempSearch({title:'', subject_id:'', subject_name:'', author:''})} className="flex-1 py-3 bg-gray-500 text-white border-2 border-black hover:brightness-110 transition-all">CLEAR</button>
              <button onClick={handleSearchSubmit} className="flex-[2] py-3 bg-[#6CAFA5] text-white border-2 border-black hover:brightness-110 transition-all">SEARCH</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}