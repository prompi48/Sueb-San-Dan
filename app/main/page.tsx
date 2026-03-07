'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Toast } from '@/components/Toast';

export default function MainPage() {
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showPending, setShowPending] = useState(false);
  const [undoData, setUndoData] = useState<{ id: number; type: string; timeoutId: NodeJS.Timeout } | null>(null);
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'all' | 'admin' | 'mine'>('all');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // State สำหรับ Toast Notification
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // --- States สำหรับ Search ---
  const [searchQuery, setSearchQuery] = useState({
    title: '',
    subject_name: '',
    subject_id: '',
    author: ''
  });

  const postsPerPage = 20;

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, is_admin')
        .eq('id', session.user.id)
        .single();
      
      if (profile?.is_admin) setIsAdmin(true);

      const { data: posts } = await supabase
        .from('posts')
        .select('*, profiles(username)')
        .order('created_at', { ascending: false });
      
      setAllPosts(posts || []);
    };
    checkUser();
  }, [router]);

  // --- Logic การ Action แบบหน่วงเวลา ---
  const triggerAction = (id: number, type: string) => {
    if (undoData) executeAction(undoData.id, undoData.type);
    const timeoutId = setTimeout(() => {
      executeAction(id, type);
      setUndoData(null);
    }, 5000);
    setUndoData({ id, type, timeoutId });
  };

  const executeAction = async (id: number, type: string) => {
    if (type === 'delete') {
      await supabase.from('posts').delete().eq('id', id);
    } else {
      const status = type === 'accept' ? 'accepted' : 'rejected';
      await supabase.from('posts').update({ status }).eq('id', id);
    }
    setAllPosts(prev => prev.filter(p => p.id !== id));
  };

  const undoAction = () => {
    if (undoData) {
      clearTimeout(undoData.timeoutId);
      setUndoData(null);
    }
  };

  // --- Account Logic ---
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = confirm("⚠️ คำเตือน: ข้อมูลโพสต์ทั้งหมดของคุณจะถูกลบและไม่สามารถกู้คืนได้ ยืนยันหรือไม่?");
    if (confirmDelete) {
      try {
        // ลบข้อมูลที่เกี่ยวข้องกับ User ID นี้ทั้งหมด
        await supabase.from('posts').delete().eq('author_id', user.id);
        await supabase.from('profiles').delete().eq('id', user.id);
        
        setToast({ msg: "ลบบัญชีเรียบร้อยแล้ว", type: 'success' });
        
        setTimeout(async () => {
          await supabase.auth.signOut();
          router.push('/login');
        }, 2000);
      } catch (error) {
        setToast({ msg: "เกิดข้อผิดพลาด", type: 'error' });
      }
    }
  };

  // --- Filter Logic ---
  const filteredPosts = allPosts.filter(post => {
    const matchesTitle = post.title?.toLowerCase().includes(searchQuery.title.toLowerCase());
    const matchesSubjID = post.subject_id?.toLowerCase().includes(searchQuery.subject_id.toLowerCase());
    const matchesSubjName = (post.subject_name || "").toLowerCase().includes(searchQuery.subject_name.toLowerCase());
    const matchesAuthor = (post.profiles?.username || "").toLowerCase().includes(searchQuery.author.toLowerCase());

    const isMatched = matchesTitle && matchesSubjID && matchesSubjName && matchesAuthor;
    if (!isMatched) return false;

    if (viewMode === 'admin') return post.status === 'pending';
    if (viewMode === 'mine') return post.author_id === user?.id && post.status !== 'accepted';
    
    return post.status === 'accepted' || post.author_id === user?.id;
  });

  const [tempSearch, setTempSearch] = useState({ title: '', subject_name: '', subject_id: '', author: '' });

  const handleSearchSubmit = () => {
    setSearchQuery(tempSearch);
    setCurrentPage(1);
    setIsSearchOpen(false);
  };

  const clearSearch = () => {
    const empty = { title: '', subject_name: '', subject_id: '', author: '' };
    setTempSearch(empty);
    setSearchQuery(empty);
    setIsSearchOpen(false);
  };

  const displayPosts = filteredPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <h1 
          className="text-4xl font-bold text-heritage-logo font-jersey cursor-pointer" 
          onClick={() => { setViewMode('all'); setShowPending(false); router.push('/main'); }}
        >
          INHERITANCE {viewMode !== 'all' && <span className="text-sm ml-2">({viewMode.toUpperCase()})</span>}
        </h1>

        <div className="flex items-center space-x-4">
          {isAdmin && (
            <button 
              onClick={() => { setShowPending(!showPending); setViewMode(showPending ? 'all' : 'admin'); }}
              className={`w-12 h-6 rounded-full transition-colors relative ${showPending ? 'bg-red-500' : 'bg-gray-400'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${showPending ? 'left-7' : 'left-1'}`} />
            </button>
          )}
          <button onClick={() => setIsSearchOpen(true)} className="btn-search">🔍 SEARCH</button>
          <button onClick={() => router.push('/create')} className="btn-post">POST</button>
          
          <div className="relative">
            <span 
              className="font-semibold text-sm cursor-pointer hover:underline font-vt323" 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            >
              {user?.email}
            </span>
            
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border-4 border-heritage-frame rounded-xl shadow-xl z-[60] py-2 font-vt323 text-lg">
                <button 
                  onClick={() => { setViewMode('mine'); setIsUserMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 uppercase"
                >
                  My Post Status
                </button>
                <button 
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 uppercase"
                >
                  Logout
                </button>
                <div className="border-t border-gray-200 mt-2">
                  <button 
                    onClick={handleDeleteAccount}
                    className="w-full text-left px-4 py-2 text-xs text-red-400 hover:text-red-700 uppercase"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Grid Container */}
      <div className="main-frame">
        <div className="posts-grid">
          {displayPosts.map((post) => (
            <div 
              key={post.id} 
              className={`post-card group cursor-pointer ${
                viewMode === 'mine' && post.status === 'rejected' ? 'bg-[#F39C12] text-white' : 'bg-[#D9D9D9]'
              }`}
              onClick={() => router.push(`/post/${post.id}`)}
            >
              {viewMode === 'mine' && (
                <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 inline-block border border-black ${
                  post.status === 'pending' ? 'bg-yellow-400 text-black' : 'bg-red-600 text-white'
                }`}>
                  {post.status.toUpperCase()}
                </div>
              )}
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold">{post.title}</h3>
                <div className="flex flex-col items-end">
                  <span className="text-sm text-gray-600 font-vt323">{post.subject_id}</span>
                  {viewMode === 'mine' && post.status === 'rejected' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); router.push(`/edit/${post.id}`); }}
                      className="mt-2 text-xs bg-white text-black px-3 py-1 rounded-full border border-black hover:bg-gray-200 font-prompt"
                    >
                      EDIT & RESUBMIT
                    </button>
                  )}
                  {isAdmin && showPending && (
                    <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => triggerAction(post.id, 'delete')} title="Delete">🗑️</button>
                      <button onClick={() => triggerAction(post.id, 'reject')} title="Reject">❌</button>
                      <button onClick={() => triggerAction(post.id, 'accept')} title="Accept">✔️</button>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-sm mb-6 line-clamp-3 font-prompt opacity-90">{post.description}</p>
              <div className="flex justify-between items-end text-xs font-prompt">
                <div className="flex flex-col">
                  <span className="text-heritage-frame mb-1 truncate max-w-[150px]">{post.media_link || "No link"}</span>
                  <span className="font-semibold text-black">{post.profiles?.username}</span>
                </div>
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="pagination-wrapper mt-8 flex justify-center items-center gap-4">
          <button className="pagination-btn" onClick={() => setCurrentPage(1)}>{"<<"}</button>
          <button className="pagination-btn" onClick={() => setCurrentPage(p => Math.max(1, p-1))}>{"<"}</button>
          <span className="font-jersey text-2xl">{currentPage} / {totalPages || 1}</span>
          <button className="pagination-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))}>{">"}</button>
          <button className="pagination-btn" onClick={() => setCurrentPage(totalPages)}>{">>"}</button>
        </div>
      </div>

      {/* Modals & Toasts */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="search-modal relative bg-[#d44c24] p-8 rounded-3xl border-4 border-white">
            <button onClick={() => setIsSearchOpen(false)} className="absolute top-4 right-6 text-white text-2xl font-bold">X</button>
            <h2 className="text-white font-prompt text-center mb-6 text-lg">ค้นหาแนวข้อสอบ / สรุปวิชา</h2>
            <div className="space-y-4 font-prompt">
              <input type="text" placeholder="ชื่อโพสต์" className="search-input w-full p-3 rounded-xl" value={tempSearch.title} onChange={(e) => setTempSearch({...tempSearch, title: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="รหัสวิชา" className="search-input p-3 rounded-xl" value={tempSearch.subject_id} onChange={(e) => setTempSearch({...tempSearch, subject_id: e.target.value})} />
                <input type="text" placeholder="ชื่อวิชา" className="search-input p-3 rounded-xl" value={tempSearch.subject_name} onChange={(e) => setTempSearch({...tempSearch, subject_name: e.target.value})} />
              </div>
              <input type="text" placeholder="ชื่อผู้เขียน" className="search-input w-full p-3 rounded-xl" value={tempSearch.author} onChange={(e) => setTempSearch({...tempSearch, author: e.target.value})} />
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={clearSearch} className="flex-1 py-3 bg-gray-500 text-white rounded-full font-bold">CLEAR</button>
              <button onClick={handleSearchSubmit} className="flex-[2] py-3 bg-[#6CAFA5] text-white rounded-full font-bold shadow-lg">SEARCH NOW</button>
            </div>
          </div>
        </div>
      )}

      {/* Undo Snackbar */}
      {undoData && (
        <div className={`undo-snackbar fixed bottom-10 right-10 flex items-center gap-4 p-4 rounded-xl text-white shadow-2xl z-50 ${
          undoData.type === 'delete' ? 'bg-[#E63946]' : 'bg-[#276F50]'
        }`}>
          <span className="font-prompt">ทำรายการสำเร็จ (5 วินาทีเพื่อกู้คืน)</span>
          <button onClick={undoAction} className="border-2 border-white px-4 py-1 rounded-full text-sm font-bold hover:bg-white/20">UNDO</button>
        </div>
      )}

      {/* Success Toast */}
      {toast && (
        <Toast 
          message={toast.msg} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
}