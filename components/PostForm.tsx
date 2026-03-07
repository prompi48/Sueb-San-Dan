'use client';

import React, { useState } from 'react';

interface PostFormProps {
  initialData?: {
    title: string;
    subject_name: string;
    subject_id: string;
    description: string;
    media_link: string;
  };
  onSubmit: (data: any) => void;
  submitText: string;
  userEmail?: string;
}

export function PostForm({ initialData, onSubmit, submitText, userEmail }: PostFormProps) {
  const [formData, setFormData] = useState(initialData || {
    title: '',
    subject_name: '',
    subject_id: '',
    description: '',
    media_link: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="main-frame max-w-4xl w-full bg-[#D9D9D9] p-12">
      <form onSubmit={handleSubmit} className="space-y-6 font-prompt">
        <input 
          type="text" 
          placeholder="กรอกชื่อโพสต์" 
          className="w-full p-4 bg-[#BFD6E8] rounded-full border-none focus:ring-2 ring-heritage-frame placeholder:text-gray-500"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input 
            type="text" 
            placeholder="กรอกชื่อวิชา" 
            className="p-4 bg-[#BFD6E8] rounded-full border-none focus:ring-2 ring-heritage-frame"
            value={formData.subject_name}
            onChange={(e) => setFormData({...formData, subject_name: e.target.value})}
          />
          <input 
            type="text" 
            placeholder="กรอกรหัสวิชา" 
            className="p-4 bg-[#BFD6E8] rounded-full border-none focus:ring-2 ring-heritage-frame"
            value={formData.subject_id}
            onChange={(e) => setFormData({...formData, subject_id: e.target.value})}
          />
        </div>

        <textarea 
          placeholder="กรอกรายละเอียดโพสต์" 
          rows={8}
          className="w-full p-6 bg-[#BFD6E8] rounded-2xl border-none focus:ring-2 ring-heritage-frame resize-none"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          required
        />

        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="กรอกลิงก์ (Google Drive / Canva)" 
              className="w-full p-4 bg-[#BFD6E8] rounded-sm border-none pr-12"
              value={formData.media_link}
              onChange={(e) => setFormData({...formData, media_link: e.target.value})}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl">📤</span>
          </div>
          
          <button type="submit" className="btn-post py-4 px-12 text-3xl">
            {submitText}
          </button>
        </div>
      </form>
    </div>
  );
}