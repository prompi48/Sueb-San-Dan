'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Toast } from '@/components/Toast';
import { Icon } from '@iconify/react';

import { validateUsername, validatePassword } from '@/lib/validation';

// --- แยก Logic หลักออกมาเป็น Component ย่อย ---
export default function MainContent() {
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
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [currentUsername, setCurrentUsername] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

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
    
    
    // 1. ตรวจสอบ Session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return router.push('/');
    setUser(session.user);

    // 2. เช็คสิทธิ์ Admin จากตาราง Profiles (เพื่อความแม่นยำกว่า Metadata)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role,username')
      .eq('id', session.user.id)
      .single();

    setCurrentUsername(profile?.username || '');
    setIsAdmin(profile?.role === 'admin');

    const from = (currentPage - 1) * POSTS_PER_PAGE;
    const to = from + POSTS_PER_PAGE - 1;

    // 3. สร้าง Query ดึงโพสต์ที่ผ่านการอนุมัติแล้ว (is_pending: false)
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
    if (searchQuery.author) {
      const { data: matchedProfiles } = await supabase
        .from('profiles')
        .select('id')
        .ilike('username', `%${searchQuery.author}%`);
      
      const ids = matchedProfiles?.map(p => p.id) || [];
      if (ids.length > 0) {
        query = query.in('author_id', ids);
      } else {
        // No matches — return empty
        setPosts([]);
        setTotalCount(0);
        setLoading(false);
        return;
      }
    }

    const { data, count, error } = await query;
    if (error) {
      setToast({ msg: "Database Error: " + error.message, type: 'error' });
    } else {
      setPosts(data || []);
      setTotalCount(count || 0);
    }
    setLoading(false);
  }, [currentPage, searchQuery, router]);

  useEffect(() => {
    fetchPosts();
    setInputPage(currentPage.toString());
  }, [fetchPosts]);

  useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.relative')) setIsUserMenuOpen(false);
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);

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

  const handleDeleteAccount = async () => {
    const confirmed = confirm("Are you sure? This will delete your profile permanently. Your posts will remain as 'Deleted User'.");
    if (!confirmed) return;

    setLoading(true);
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

  const handleUpdateUsername = async () => {
    const trimmed = newUsername.trim().toLowerCase();

    const usernameValidation = validateUsername(trimmed);
    if (usernameValidation) { setToast({ msg: usernameValidation, type: 'error' }); return; }

    const { error } = await supabase
      .from('profiles')
      .update({ username: trimmed })
      .eq('id', user?.id);

    if (error) {
      // Unique constraint violation
      if (error.code === '23505') {
        setToast({ msg: "Username already taken.", type: 'error' });
      } else {
        setToast({ msg: "Failed to update: " + error.message, type: 'error' });
      }
    } else {
      setCurrentUsername(trimmed);
      setToast({ msg: "Username updated successfully!", type: 'success' });
      setIsEditingUsername(false);
      setNewUsername('');
    }
  };

  const handleUpdatePassword = async () => {
    const passValidationError = validatePassword(newPassword, confirmNewPassword);
    if (passValidationError) return alert(passValidationError);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setToast({ msg: "Failed to update password: " + error.message, type: 'error' });
    } else {
      setToast({ msg: "Password updated successfully!", type: 'success' });
      setIsChangingPassword(false);
      setNewPassword('');
      setConfirmNewPassword('');
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center font-jersey text-3xl animate-pulse text-dark-green">
        ACCESSING ARCHIVES
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-heritage-bg font-prompt">
      <header className="flex justify-between items-center mb-6">
        <h1 
          className="text-4xl font-bold text-dark-green font-jersey cursor-pointer select-none"
          onClick={() => { updateURL(1, {title:'', subject_id:'', subject_name:'', author:''}); }}
        >
          INHERITANCE
        </h1>

        <div className="flex items-center gap-6">
          {isAdmin && (
            <button 
              onClick={() => router.push('/admin')} 
              className="btn btn-admin relative"
            >
              <Icon icon="solar:crown-linear" width="20" />
              ADMIN
            </button>
          )}
          <button onClick={() => setIsSearchOpen(true)} className="btn btn-search relative">
            <Icon icon="pixelarticons:search" width="18" /> SEARCH
          </button>
          <button onClick={() => router.push('/create')} className="btn btn-post">POST</button>

          <div className="relative">
            <span 
              className="font-vt323 text-sm cursor-pointer px-4 py-1.5 bg-dark-green text-[#E8E8C8] border-2 border-black rounded-full shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:brightness-110 transition-all flex items-center gap-1.5 select-none" 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            >
              {currentUsername || user?.email} <span className="opacity-60 text-xs">▾</span>
            </span>
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-96 bg-white border-4 border-black rounded-sm shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] z-50 py-3 font-vt323 text-2xl">
                <div className="px-6 py-2 text-sm text-gray-400 border-b mb-2 uppercase font-bold tracking-widest">User Settings</div>
                
                {/* Username display + edit toggle */}
                <div className="px-6 py-3 border-b border-dashed">
                  <p className="text-sm text-gray-400 uppercase font-bold mb-2">Username</p>
                  {isEditingUsername ? (
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value.toLowerCase())}
                        placeholder={currentUsername}
                        maxLength={16}
                        className="w-full px-2 py-1 border-2 border-black text-sm font-prompt focus:outline-none focus:ring-2 ring-dark-green/30"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleUpdateUsername();
                          if (e.key === 'Escape') { setIsEditingUsername(false); setNewUsername(''); }
                        }}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleUpdateUsername}
                          className="flex-1 py-2 bg-[#6CAFA5] text-white text-base border-2 border-black hover:brightness-110 transition-all"
                        >
                          SAVE
                        </button>
                        <button
                          onClick={() => { setIsEditingUsername(false); setNewUsername(''); }}
                          className="flex-1 py-2 bg-gray-100 text-black text-base border-2 border-black hover:bg-gray-200 transition-all"
                        >
                          CANCEL
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-dark-green text-2xl">{currentUsername || '—'}</span>
                      <button
                        onClick={() => { setIsEditingUsername(true); setNewUsername(currentUsername); }}
                        className="text-sm uppercase opacity-40 hover:opacity-100 transition-opacity font-bold"
                      >
                        EDIT
                      </button>
                    </div>
                  )}
                </div>
                {/* Password change section */}
                <div className="px-6 py-3 border-b border-dashed">
                  <p className="text-sm text-gray-400 uppercase font-bold mb-2">Password</p>
                  {isChangingPassword ? (
                    <div className="flex flex-col gap-2">
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New password"
                        className="w-full px-2 py-1 border-2 border-black text-sm font-prompt focus:outline-none focus:ring-2 ring-dark-green/30"
                        autoFocus
                      />
                      <input
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full px-2 py-1 border-2 border-black text-sm font-prompt focus:outline-none focus:ring-2 ring-dark-green/30"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleUpdatePassword();
                          if (e.key === 'Escape') {
                            setIsChangingPassword(false);
                            setNewPassword('');
                            setConfirmNewPassword('');
                          }
                        }}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleUpdatePassword}
                          className="flex-1 py-2 bg-[#6CAFA5] text-white text-base border-2 border-black hover:brightness-110 transition-all"
                        >
                          SAVE
                        </button>
                        <button
                          onClick={() => {
                            setIsChangingPassword(false);
                            setNewPassword('');
                            setConfirmNewPassword('');
                          }}
                          className="flex-1 py-2 bg-gray-100 text-black text-base border-2 border-black hover:bg-gray-200 transition-all"
                        >
                          CANCEL
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-dark-green text-2xl">•••• TOP SECRET ••••</span>
                      <button
                        onClick={() => setIsChangingPassword(true)}
                        className="text-sm uppercase opacity-40 hover:opacity-100 transition-opacity font-bold"
                      >
                        CHANGE
                      </button>
                    </div>
                  )}
                </div>
                <button onClick={handleSignOut} className="w-full text-left px-6 py-3 hover:bg-gray-100 uppercase">
                  Logout
                </button>
                <button onClick={handleDeleteAccount} className="w-full text-left px-6 py-3 hover:bg-red-50 text-red-600 border-t border-dashed mt-1 uppercase">
                  Delete Account
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="main-frame bg-[#D9D9D9] p-8 rounded-sm border-4 border-heritage-frame min-h-[70vh] flex flex-col relative shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)]">
        {posts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center opacity-30 font-jersey">
            <Icon icon="pixelarticons:close-box" width="64" />
            <p className="text-3xl mt-4 tracking-widest uppercase">No matches in current archive</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {posts.map((post) => (
              <div 
                key={post.id} 
                className="post-card p-5 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col h-full active:translate-y-0 active:shadow-none"
                onClick={() => router.push(`/post/${post.id}`)}
              >
                {/*
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-vt323 font-bold uppercase bg-black text-white px-2 py-0.5">
                    {post.subject_id}
                  </span>
                </div>
                */}
                  <h3 className="text-xl font-black mb-2 line-clamp-1 text-dark-green uppercase break-all drop-shadow-[2px_2px_0px_rgba(0,0,0,0.2)]">{post.title}</h3>
                  <p className="text-xs font-prompt text-black/50 mb-2">{post.subject_name} | {post.subject_id}</p>
                  <p className="text-sm font-prompt line-clamp-3 opacity-80 mb-4 flex-grow italic leading-relaxed break-all">
                  {post.description}
                  </p>
                
                <div className="flex justify-between items-end text-xs font-vt323 mt-auto border-t-2 border-dashed pt-2 border-black/5">
                  <span className="font-bold text-black/70">
                    BY: {post.profiles?.username || "Deleted User"}
                  </span>
                  <span className="opacity-50">{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Control */}
        {totalPages > 1 && (
          <div className="mt-auto pt-8 flex justify-center items-center gap-6 font-jersey text-2xl">
            <button disabled={currentPage <= 1} onClick={() => updateURL(1)} className="disabled:opacity-20 hover:text-dark-green transition-colors font-bold">{"<<"}</button>
            <button disabled={currentPage <= 1} onClick={() => updateURL(currentPage - 1)} className="disabled:opacity-20 hover:text-dark-green transition-colors font-bold">{"<"}</button>
            
            <div className="flex items-center gap-3 bg-white border-2 border-black px-4 py-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <input
                type="text"
                value={inputPage}
                onChange={(e) => setInputPage(e.target.value)}
                onKeyDown={handleJumpPage}
                onBlur={() => setInputPage(currentPage.toString())}
                className="w-10 text-center bg-transparent border-b-2 border-dark-green focus:outline-none font-bold text-dark-green"
              />
              <span className="text-gray-300 font-prompt text-sm font-bold">/</span>
              <span>{totalPages}</span>
            </div>

            <button disabled={currentPage >= totalPages} onClick={() => updateURL(currentPage + 1)} className="disabled:opacity-20 hover:text-dark-green transition-colors font-bold">{">"}</button>
            <button disabled={currentPage >= totalPages} onClick={() => updateURL(totalPages)} className="disabled:opacity-20 hover:text-dark-green transition-colors font-bold">{">>"}</button>
          </div>
        )}
      </div>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-[#679F9F] p-8 rounded-sm border-4 border-white w-full max-w-md shadow-[10px_10px_0px_0px_rgba(0,0,0,0.5)] relative">
            
            <button onClick={() => setIsSearchOpen(false)} className="absolute top-2 right-4 text-white text-3xl font-bold hover:rotate-90 transition-transform">×</button>
            
            <h2 className="text-white font-jersey text-center mb-6 text-3xl tracking-widest uppercase">Archive Search</h2>
            
            <div className="space-y-4 font-prompt text-sm">
              {/* Input Boxes: BG White, Text #939393 */}
              <div className="space-y-1">
                <label className="text-white/70 text-[10px] font-bold ml-2">TITLE</label>
                <input 
                  type="text" 
                  placeholder="ชื่อโพสต์"
                  className="w-full p-3 border-2 border-black rounded-sm outline-none focus:ring-4 ring-white/30 bg-white text-gray placeholder:text-gray/60" 
                  value={tempSearch.title} 
                  onChange={(e) => setTempSearch({ ...tempSearch, title: e.target.value })} 
                />
              </div>

              <div className="space-y-1">
                <label className="text-white/70 text-[10px] font-bold ml-2">SUBJECT NAME</label>
                <input 
                  type="text" 
                  placeholder="ชื่อวิชา" 
                  className="w-full p-3 border-2 border-black rounded-sm outline-none focus:ring-4 ring-white/30 bg-white text-gray placeholder:text-gray/60"  
                  value={tempSearch.subject_name} 
                  onChange={(e) => setTempSearch({ ...tempSearch, subject_name: e.target.value })} 
                />
              </div>

              <div className="space-y-1">
                <label className="text-white/70 text-[10px] font-bold ml-2">SUBJECT ID</label>
                <input 
                  type="text" 
                  placeholder="รหัสวิชา" 
                  className="w-full p-3 border-2 border-black rounded-sm outline-none focus:ring-4 ring-white/30 bg-white text-gray placeholder:text-gray/60"  
                  value={tempSearch.subject_id} 
                  onChange={(e) => setTempSearch({ ...tempSearch, subject_id: e.target.value })} 
                />
              </div>

              <div className="space-y-1">
                <label className="text-white/70 text-[10px] font-bold ml-2">AUTHOR</label>
                <input 
                  type="text" 
                  placeholder="เจ้าของโพสต์" 
                  className="w-full p-3 border-2 border-black rounded-sm outline-none focus:ring-4 ring-white/30 bg-white text-gray placeholder:text-gray/60"  
                  value={tempSearch.author} 
                  onChange={(e) => setTempSearch({ ...tempSearch, author: e.target.value })} 
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8 font-jersey text-2xl">
              <button 
                onClick={() => setTempSearch({title:'', subject_id:'', subject_name:'', author:''})} 
                className="flex-1 py-3 bg-white/20 text-white border-2 border-white hover:bg-white/30 transition-all"
              >
                CLEAR
              </button>

              {/* EXECUTE Button: Text changed to #679F9F to match theme */}
              <button 
                onClick={handleSearchSubmit} 
                className="flex-[2] py-3 bg-white text-[#679F9F] border-2 border-black hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
              >
                EXECUTE
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}