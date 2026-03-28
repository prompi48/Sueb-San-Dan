'use client';

import React, { useState } from 'react';
import { Icon } from '@iconify/react'; // เปลี่ยนมาใช้ Iconify ให้เหมือนหน้าอื่น

interface PostFormProps {
  initialData?: {
    title: string;
    subject_name: string | null;
    subject_id: string | null;
    description: string  | null;
    media_link: string | null;
  };
  onSubmit: (data: any) => void;
  submitText: string;
  disabled?: boolean;
}

export function PostForm({ initialData, onSubmit, submitText, disabled }: PostFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    subject_name: initialData?.subject_name || '',
    subject_id: initialData?.subject_id || '',
    description: initialData?.description || '',
    media_link: initialData?.media_link || '' 
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanedData = {
      title: formData.title.trim(),
      subject_name: formData.subject_name.trim() || null,
      subject_id: formData.subject_id.trim() || null,
      description: formData.description.trim() || null,
      media_link: formData.media_link.trim() || null
    };

    onSubmit(cleanedData);
  };

  return (
    <div className="main-frame max-w-4xl w-full bg-[#D9D9D9] p-10 border-4 border-heritage-frame shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
      <form onSubmit={handleSubmit} className="space-y-6 font-prompt">
        
        <div className="space-y-1">
          <label className="text-[10px] font-bold ml-4 uppercase opacity-50">Post Title</label>
          <input 
            type="text" 
            maxLength={300}
            placeholder="ชื่อโพสต์ เช่น สรุป Logic Design กลางภาค" 
            className="w-full p-4 bg-white border-2 border-black rounded-sm focus:ring-4 ring-dark-green/20 outline-none"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
        </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold ml-4 uppercase opacity-50">Subject Name</label>
            <input 
              type="text" 
              maxLength={100}
              placeholder="ชื่อวิชา" 
              className="w-full p-4 bg-white border-2 border-black rounded-sm outline-none focus:ring-4 ring-dark-green/20"
              value={formData.subject_name}
              onChange={(e) => setFormData({...formData, subject_name: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold ml-4 uppercase opacity-50">Subject ID</label>
            <input 
              type="text" 
              maxLength={20}
              placeholder="รหัสวิชา (เช่น 010113xxx)" 
              className="w-full p-4 bg-white border-2 border-black rounded-sm outline-none focus:ring-4 ring-dark-green/20"
              value={formData.subject_id}
              onChange={(e) => setFormData({...formData, subject_id: e.target.value})}
            />
          </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold ml-4 uppercase opacity-50">Description</label>
          <textarea 
            maxLength={40000}
            placeholder="คำอธิบาย หรือ รายละเอียดเพิ่มเติม" 
            rows={6}
            className="w-full p-4 bg-white border-2 border-black rounded-sm outline-none focus:ring-4 ring-dark-green/20 resize-none"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-end">
          <div className="w-full space-y-1">
            <label className="text-[10px] font-bold ml-4 uppercase opacity-50">Media Link (Google Drive / Canva / Notion)</label>
            <div className="relative">
              <input 
                type="url" 
                placeholder="https://..." 
                className="w-full p-4 bg-[#BFD6E8] border-2 border-black rounded-sm pr-12 outline-none"
                value={formData.media_link}
                onChange={(e) => setFormData({...formData, media_link: e.target.value})}
              />
              <Icon icon="pixelarticons:link" className="absolute right-4 top-1/2 -translate-y-1/2 text-black w-6 h-6" />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={disabled}
            className="w-full md:w-auto bg-[#F7ED92] py-4 px-10 text-2xl font-jersey border-2 border-black 
                       shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all whitespace-nowrap
                       
                       /* คลาส disabled: เพื่อให้ปุ่มดูหงอยเมื่อกดไปแล้ว */
                       disabled:bg-gray-400 disabled:text-gray-600 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0
                       
                       /* คลาส hover: เฉพาะตอนที่ปุ่มไม่โดน disabled */
                       enabled:hover:-translate-y-1 enabled:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] 
                       enabled:active:translate-y-0 enabled:active:shadow-none"
          >
            {submitText}
          </button>
        </div>
      </form>
    </div>
  );
}