
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Edit3, Image as ImageIcon, X, Loader2, Save, Clock, Film, Calendar, Upload, AlertCircle, CheckCircle, DollarSign, Link, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Project } from '../../types';

const MAX_IMAGE_SIZE_MB = 5;
const MAX_VIDEO_SIZE_MB = 50;
const MAX_PDF_SIZE_MB = 10;
const UPLOAD_TIMEOUT_MS = 300000; // 5 minutes per file

const formatFileSize = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const AdminProjects: React.FC = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Helper to get local datetime string for input
  const getCurrentLocalDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  // Form State
  const [projectTitle, setProjectTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectDate, setProjectDate] = useState('');
  const [projectPrice, setProjectPrice] = useState<string>('');
  const [videoTimestamp, setVideoTimestamp] = useState('');
  const [imageFiles, setImageFiles] = useState<(File | null)[]>(Array(6).fill(null));
  const [imagePreviews, setImagePreviews] = useState<string[]>(Array(6).fill(''));
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [projectUrl, setProjectUrl] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setProjectTitle('');
    setDescription('');
    setProjectDate('');
    setProjectPrice('');
    setVideoTimestamp('');
    setImageFiles(Array(6).fill(null));
    setImagePreviews(Array(6).fill(''));
    setVideoFile(null);
    setVideoPreview(null);
    setProjectUrl('');
    setPdfFile(null);
    setPdfPreview(null);
    setIsEditing(null);
    setError(null);
    setSuccess(null);
  };

  // Auto-fill date when adding starts
  useEffect(() => {
    if (isAdding && !isEditing) {
      setProjectDate(getCurrentLocalDateTime());
    }
    if (!isAdding) {
      resetForm();
    }
  }, [isAdding]);

  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        setError(`Image too large (${formatFileSize(file.size)}). Maximum allowed is ${MAX_IMAGE_SIZE_MB}MB.`);
        e.target.value = '';
        return;
      }
      const newFiles = [...imageFiles];
      newFiles[index] = file;
      setImageFiles(newFiles);

      const newPreviews = [...imagePreviews];
      newPreviews[index] = URL.createObjectURL(file);
      setImagePreviews(newPreviews);
    }
  };

  const removeImage = (index: number) => {
    const newFiles = [...imageFiles];
    newFiles[index] = null;
    setImageFiles(newFiles);

    const newPreviews = [...imagePreviews];
    if (newPreviews[index] && newPreviews[index].startsWith('blob:')) {
      URL.revokeObjectURL(newPreviews[index]);
    }
    newPreviews[index] = '';
    setImagePreviews(newPreviews);

    if (imageInputRefs.current[index]) {
      imageInputRefs.current[index]!.value = '';
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
        setError(`Video too large (${formatFileSize(file.size)}). Maximum allowed is ${MAX_VIDEO_SIZE_MB}MB. Compress your video before uploading.`);
        e.target.value = '';
        return;
      }
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    }
  };

  const removeVideo = () => {
    if (videoPreview && videoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoFile(null);
    setVideoPreview(null);
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_PDF_SIZE_MB * 1024 * 1024) {
        setError(`PDF too large (${formatFileSize(file.size)}). Maximum allowed is ${MAX_PDF_SIZE_MB}MB.`);
        e.target.value = '';
        return;
      }
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are allowed.');
        e.target.value = '';
        return;
      }
      setPdfFile(file);
      setPdfPreview(file.name);
    }
  };

  const removePdf = () => {
    setPdfFile(null);
    setPdfPreview(null);
    if (pdfInputRef.current) pdfInputRef.current.value = '';
  };

  // Upload file to Supabase Storage with timeout
  const uploadFile = async (file: File, path: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      // Check auth session before uploading
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Your login session has expired. Please log out and log back in.');
      }

      const uploadPromise = supabase.storage
        .from('projects')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false,
        });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Upload timed out after ${UPLOAD_TIMEOUT_MS / 1000}s for "${file.name}" (${formatFileSize(file.size)}). Please log out, log back in, and try again.`)), UPLOAD_TIMEOUT_MS)
      );

      const { error: uploadError } = await Promise.race([uploadPromise, timeoutPromise]);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('projects')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (err: any) {
      console.error('Upload error:', err);
      throw err;
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!projectTitle.trim()) {
      setError('Project title is required');
      return false;
    }
    if (!description.trim()) {
      setError('Description is required');
      return false;
    }

    // Check minimum 4 images (for new projects without existing previews)
    const filledImages = imageFiles.filter(f => f !== null).length +
                         imagePreviews.filter(p => p && !p.startsWith('blob:')).length;
    if (filledImages < 4) {
      setError('Please upload at least 4 images');
      return false;
    }

    // Check video for new projects
    if (!isEditing && !videoFile && !videoPreview) {
      setError('Please upload a project video');
      return false;
    }

    return true;
  };

  // Save project
  const handleSaveProject = async () => {
    setError(null);
    if (!validateForm()) return;

    try {
      setSaving(true);
      const mediaUrls: string[] = [];

      // Upload new images
      const newImageCount = imageFiles.filter(f => f !== null).length;
      let uploadedCount = 0;
      for (let i = 0; i < imageFiles.length; i++) {
        if (imageFiles[i]) {
          uploadedCount++;
          setUploadProgress(`Uploading image ${uploadedCount}/${newImageCount} (${formatFileSize(imageFiles[i]!.size)})...`);
          const url = await uploadFile(imageFiles[i]!, 'images');
          if (url) mediaUrls.push(url);
        } else if (imagePreviews[i] && !imagePreviews[i].startsWith('blob:')) {
          // Keep existing URLs
          mediaUrls.push(imagePreviews[i]);
        }
      }

      // Upload video
      let videoUrl = videoPreview && !videoPreview.startsWith('blob:') ? videoPreview : null;
      if (videoFile) {
        setUploadProgress(`Uploading video (${formatFileSize(videoFile.size)})...`);
        videoUrl = await uploadFile(videoFile, 'videos');
      }

      // Upload PDF
      let pdfUrl = pdfPreview && !pdfFile ? pdfPreview : null;
      if (pdfFile) {
        setUploadProgress(`Uploading PDF (${formatFileSize(pdfFile.size)})...`);
        pdfUrl = await uploadFile(pdfFile, 'pdfs');
      }

      setUploadProgress('Saving project...');

      const projectData = {
        title: projectTitle.trim(),
        description: description.trim(),
        media: mediaUrls,
        video_url: videoUrl,
        project_url: projectUrl.trim() || null,
        pdf_url: pdfUrl,
        price: projectPrice ? parseFloat(projectPrice) : null,
        updated_at: new Date().toISOString(),
      };

      if (isEditing) {
        // Update existing project
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', isEditing);

        if (error) throw error;
        setSuccess('Project updated successfully!');
      } else {
        // Create new project
        const { error } = await supabase
          .from('projects')
          .insert([{ ...projectData, created_at: new Date().toISOString() }]);

        if (error) throw error;
        setSuccess('Project published successfully!');
      }

      // Refresh projects list
      await fetchProjects();
      setIsAdding(false);
      resetForm();

    } catch (err: any) {
      console.error('Error saving project:', err);
      setError(err.message || 'Failed to save project');
    } finally {
      setSaving(false);
      setUploadProgress('');
    }
  };

  // Delete project
  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSuccess('Project deleted successfully!');
      await fetchProjects();
    } catch (err: any) {
      console.error('Error deleting project:', err);
      setError(err.message || 'Failed to delete project');
    }
  };

  // Edit project
  const handleEditProject = (project: Project) => {
    setIsEditing(project.id);
    setProjectTitle(project.title);
    setDescription(project.description);
    setProjectDate(project.created_at ? project.created_at.slice(0, 16) : getCurrentLocalDateTime());
    setProjectPrice(project.price ? project.price.toString() : '');

    setProjectUrl(project.project_url || '');

    // Set existing image previews
    const previews = Array(6).fill('');
    project.media?.forEach((url, idx) => {
      if (idx < 6) previews[idx] = url;
    });
    setImagePreviews(previews);
    setImageFiles(Array(6).fill(null));

    // Set video preview if exists
    if (project.video_url) {
      setVideoPreview(project.video_url);
    }

    // Set PDF preview if exists
    if (project.pdf_url) {
      setPdfPreview(project.pdf_url);
    }

    setIsAdding(true);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-black dark:text-white uppercase tracking-tighter">PROJECT MANAGER</h1>
          <p className="text-gray-500 font-medium">Control your public showcase and media</p>
        </div>
        <button
          onClick={() => {
            if (isAdding) resetForm();
            setIsAdding(!isAdding);
          }}
          className={`px-6 py-3 ${isAdding ? 'bg-red-600' : 'bg-orange-600'} hover:opacity-90 text-white text-sm font-black rounded-xl flex items-center justify-center transition-all shadow-xl shadow-orange-600/20`}
        >
          {isAdding ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {isAdding ? 'CANCEL' : 'ADD NEW WORK'}
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl text-red-600">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-2xl text-green-600">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">{success}</span>
          <button onClick={() => setSuccess(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {isAdding && (
        <div className="bg-white dark:bg-black border-2 border-orange-500/20 dark:border-orange-500/10 p-6 md:p-10 rounded-[3rem] shadow-2xl animate-in slide-in-from-top-4 duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-24 bg-orange-600/5 blur-[100px] rounded-full -z-10"></div>

          {isEditing && (
            <div className="mb-6 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl inline-flex items-center text-blue-600 text-sm font-bold">
              <Edit3 className="w-4 h-4 mr-2" /> Editing Project
            </div>
          )}

          <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Left Column: Text Info */}
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-xs font-black text-orange-600 uppercase tracking-widest ml-1">Project Brand Name *</label>
                  <input
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-950 border-2 border-gray-200 dark:border-gray-900 rounded-2xl p-4 text-black dark:text-white focus:border-orange-500 outline-none transition-all font-bold"
                    placeholder="Enter project name..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-orange-600 uppercase tracking-widest ml-1">Date & Time (Auto-captured)</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-600" />
                      <input
                        type="datetime-local"
                        value={projectDate}
                        onChange={(e) => setProjectDate(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-950 border-2 border-gray-200 dark:border-gray-900 rounded-2xl py-4 pl-12 pr-4 text-black dark:text-white focus:border-orange-500 outline-none transition-all font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-orange-600 uppercase tracking-widest ml-1">Project Price (USD)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={projectPrice}
                        onChange={(e) => setProjectPrice(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-950 border-2 border-gray-200 dark:border-gray-900 rounded-2xl py-4 pl-12 pr-4 text-black dark:text-white focus:border-green-500 outline-none transition-all font-bold"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-orange-600 uppercase tracking-widest ml-1">Project URL</label>
                  <div className="relative">
                    <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600" />
                    <input
                      type="url"
                      value={projectUrl}
                      onChange={(e) => setProjectUrl(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-950 border-2 border-gray-200 dark:border-gray-900 rounded-2xl py-4 pl-12 pr-4 text-black dark:text-white focus:border-blue-500 outline-none transition-all font-bold"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-orange-600 uppercase tracking-widest ml-1">Work Description *</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full bg-gray-50 dark:bg-gray-950 border-2 border-gray-200 dark:border-gray-900 rounded-2xl p-4 text-black dark:text-white focus:border-orange-500 outline-none transition-all font-medium"
                    placeholder="Describe your innovation..."
                  />
                </div>

                {/* PDF Section */}
                <div className="bg-blue-600/5 border-2 border-blue-500/20 p-6 rounded-3xl space-y-4">
                  <div className="flex items-center space-x-2 text-blue-600">
                    <FileText className="w-5 h-5" />
                    <h3 className="font-black uppercase tracking-widest text-sm">Project PDF (Optional)</h3>
                  </div>

                  <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-blue-500/30 rounded-3xl bg-white dark:bg-black/50 hover:bg-blue-500/5 transition-all relative group overflow-hidden">
                    {pdfPreview ? (
                      <div className="w-full space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-xl">
                          <FileText className="w-6 h-6 text-blue-600 flex-shrink-0" />
                          <span className="text-sm font-bold text-black dark:text-white truncate">
                            {pdfFile ? pdfFile.name : 'Uploaded PDF'}
                          </span>
                          {pdfFile && (
                            <span className="text-[10px] font-bold text-gray-500 ml-auto flex-shrink-0">
                              {formatFileSize(pdfFile.size)}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={removePdf}
                          className="w-full py-2 bg-red-600 text-white font-black rounded-xl text-[10px] flex items-center justify-center uppercase tracking-widest"
                        >
                          <Trash2 className="w-3 h-3 mr-2" /> Remove PDF
                        </button>
                      </div>
                    ) : (
                      <>
                        <input
                          type="file"
                          accept="application/pdf"
                          ref={pdfInputRef}
                          onChange={handlePdfUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <Upload className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                        <p className="text-xs font-black text-gray-500 uppercase tracking-tight">Click to upload PDF</p>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">Max {MAX_PDF_SIZE_MB}MB</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Video Section */}
                <div className="bg-red-600/5 border-2 border-red-500/20 p-6 rounded-3xl space-y-6">
                  <div className="flex items-center space-x-2 text-red-600">
                    <Film className="w-5 h-5" />
                    <h3 className="font-black uppercase tracking-widest text-sm">Project Video (Required) *</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-red-500/30 rounded-3xl bg-white dark:bg-black/50 hover:bg-red-500/5 transition-all relative group overflow-hidden">
                      {videoPreview ? (
                        <div className="w-full space-y-4">
                          <video src={videoPreview} className="w-full aspect-video rounded-xl bg-black" controls />
                          <button
                            type="button"
                            onClick={removeVideo}
                            className="w-full py-2 bg-red-600 text-white font-black rounded-xl text-[10px] flex items-center justify-center uppercase tracking-widest"
                          >
                            <Trash2 className="w-3 h-3 mr-2" /> Delete Video
                          </button>
                        </div>
                      ) : (
                        <>
                          <input
                            type="file"
                            accept="video/*"
                            ref={videoInputRef}
                            onChange={handleVideoUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          <Upload className="w-8 h-8 text-red-600 mb-2 group-hover:scale-110 transition-transform" />
                          <p className="text-xs font-black text-gray-500 uppercase tracking-tight">Click to select from gallery</p>
                          <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">MP4 recommended — Max {MAX_VIDEO_SIZE_MB}MB</p>
                        </>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Video Timestamp / Highlight</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          value={videoTimestamp}
                          onChange={(e) => setVideoTimestamp(e.target.value)}
                          className="w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl py-3 pl-10 pr-3 text-sm text-black dark:text-white focus:border-red-500 outline-none transition-all"
                          placeholder="e.g. Highlight at 02:40"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Image Grid (4-6 Images) */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-orange-600 uppercase tracking-widest ml-1">Gallery (4-6 Images) *</label>
                  <span className="text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded-md uppercase">
                    Selected: {imagePreviews.filter(p => p).length}/6
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {imagePreviews.map((preview, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className={`aspect-square rounded-2xl border-2 border-dashed transition-all group relative overflow-hidden flex flex-col items-center justify-center ${preview ? 'border-green-500/50 bg-green-500/5' : 'border-gray-200 dark:border-gray-800 hover:border-orange-500/50'}`}>
                        {preview ? (
                          <>
                            <img src={preview} className="w-full h-full object-cover" alt={`Preview ${idx + 1}`} />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="p-2 bg-red-600 text-white rounded-lg shadow-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-green-500 text-[8px] font-black text-white rounded uppercase tracking-tighter">Ready</div>
                          </>
                        ) : (
                          <>
                            <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded-xl text-gray-400 group-hover:text-orange-500 transition-colors">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 mt-2 uppercase">Slot {idx + 1}</span>
                            {idx < 4 && <span className="absolute top-2 left-2 text-[8px] font-black text-orange-600 bg-orange-600/10 px-1 rounded">REQ</span>}
                            <input
                              type="file"
                              accept="image/*"
                              ref={el => { imageInputRefs.current[idx] = el; }}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={(e) => handleImageChange(idx, e)}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl text-center">
                  <p className="text-[10px] text-gray-500 uppercase font-black tracking-tight leading-relaxed">
                    Note: Upload 4 or more images (max {MAX_IMAGE_SIZE_MB}MB each) to unlock the <span className="text-orange-600">Dual-Image Frame</span> hover effect.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-8 border-t border-gray-100 dark:border-gray-900">
              <button
                type="button"
                onClick={handleSaveProject}
                disabled={saving}
                className="px-12 py-5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-black rounded-[2rem] flex items-center shadow-2xl shadow-red-600/20 transform hover:-translate-y-1 transition-all active:scale-95 uppercase tracking-[0.2em] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    {uploadProgress || 'SAVING...'}
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-3" />
                    {isEditing ? 'UPDATE PROJECT' : 'PUBLISH PROJECT'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Existing Projects Table */}
      <div className="bg-white dark:bg-black border-2 border-gray-100 dark:border-gray-950 rounded-[3rem] overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-orange-600 animate-spin mb-4" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 font-bold uppercase tracking-widest">No projects yet. Add your first project!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-950/50">
                <tr>
                  <th className="px-8 py-6 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Project Title</th>
                  <th className="px-8 py-6 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Media</th>
                  <th className="px-8 py-6 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Price</th>
                  <th className="px-8 py-6 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Date</th>
                  <th className="px-8 py-6 text-right text-xs font-black text-gray-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
                {projects.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-orange-600/10 text-orange-600 rounded-2xl flex items-center justify-center mr-4 shadow-inner group-hover:bg-orange-600 group-hover:text-white transition-all overflow-hidden">
                          {p.media?.[0] ? (
                            <img src={p.media[0]} alt={p.title} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <span className="font-black text-black dark:text-white block uppercase tracking-tighter">{p.title}</span>
                          <span className="text-[10px] text-orange-600 font-bold uppercase tracking-tighter">
                            {p.likes_count || 0} likes • {p.rating || 0} rating
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-600 text-[10px] font-black rounded-full border border-blue-500/20 uppercase">
                          {p.media?.length || 0} Images
                        </span>
                        {p.video_url && (
                          <span className="px-3 py-1 bg-red-500/10 text-red-600 text-[10px] font-black rounded-full border border-red-500/20 uppercase">
                            1 Video
                          </span>
                        )}
                        {p.pdf_url && (
                          <span className="px-3 py-1 bg-blue-500/10 text-blue-600 text-[10px] font-black rounded-full border border-blue-500/20 uppercase">
                            PDF
                          </span>
                        )}
                        {p.project_url && (
                          <span className="px-3 py-1 bg-green-500/10 text-green-600 text-[10px] font-black rounded-full border border-green-500/20 uppercase">
                            URL
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {p.price ? (
                        <span className="px-3 py-1.5 bg-green-500/10 text-green-600 text-sm font-black rounded-xl border border-green-500/20">
                          ${p.price.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm font-medium">-</span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEditProject(p)}
                          className="p-3 text-gray-500 hover:text-orange-500 hover:bg-orange-500/10 rounded-xl transition-all"
                        >
                          <Edit3 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(p.id)}
                          className="p-3 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProjects;
