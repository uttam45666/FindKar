import { useState } from 'react';
import { Upload, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios.js';

const DEFAULT_AVATARS = [
  { id: 1, name: 'Professional M1', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=professional1&scale=80' },
  { id: 2, name: 'Professional M2', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=professional2&scale=80' },
  { id: 3, name: 'Professional M3', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=professional3&scale=80' },
  { id: 4, name: 'Business M1', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=business1&scale=80' },
  { id: 5, name: 'Business M2', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=business2&scale=80' },
  { id: 6, name: 'Creative M1', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=creative1&scale=80' },
  { id: 7, name: 'Creative M2', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=creative2&scale=80' },
  { id: 8, name: 'Modern M1', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=modern1&scale=80' },
];

const SERVICE_IMAGES = [
  { id: 1, name: 'Plumbing', url: 'https://images.unsplash.com/photo-1569163139394-de4798aa62b3?w=400&h=300&fit=crop' },
  { id: 2, name: 'Electrical', url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop' },
  { id: 3, name: 'Carpentry', url: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=400&h=300&fit=crop' },
  { id: 4, name: 'AC Service', url: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=300&fit=crop' },
  { id: 5, name: 'Painting', url: 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=400&h=300&fit=crop' },
  { id: 6, name: 'Cleaning', url: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=300&fit=crop' },
  { id: 7, name: 'Kitchen', url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop' },
  { id: 8, name: 'Workshop', url: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=300&fit=crop' },
];

const AvatarSelector = ({ type = 'profile', currentImage, onSelect }) => {
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || '');

  const defaultImages = type === 'profile' ? DEFAULT_AVATARS : SERVICE_IMAGES;

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview locally
    const reader = new FileReader();
    reader.onload = (evt) => setPreview(evt.target.result);
    reader.readAsDataURL(file);

    // Upload to server
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onSelect(data.imageUrl || preview);
      toast.success('Image uploaded!');
      setShowUpload(false);
    } catch (err) {
      toast.error('Upload failed. You can still use the preview.');
      onSelect(preview);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-sm font-medium text-dark mb-3 flex items-center gap-2">
          <Sparkles size={14} /> {type === 'profile' ? 'Profile Picture' : 'Service Image'}
        </h3>
        
        {preview && (
          <div className="mb-4 flex flex-col items-center">
            <div className={`${type === 'profile' ? 'w-24 h-24' : 'w-40 h-32'} rounded-xl overflow-hidden border-2 border-primary/30 flex-shrink-0 mb-2`}>
              <img src={preview} alt="Selected" className="w-full h-full object-cover" />
            </div>
            <p className="text-xs text-muted">Current selection</p>
          </div>
        )}

        {showUpload ? (
          <div className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-xl p-6 text-center mb-4">
            <input type="file" accept="image/*" onChange={handleFileSelect} disabled={uploading} className="hidden" id={`file-${type}`} />
            <label htmlFor={`file-${type}`} className={`cursor-pointer flex flex-col items-center gap-2 ${uploading ? 'opacity-50' : ''}`}>
              <Upload size={24} className="text-blue-500" />
              <span className="text-sm font-medium text-blue-600">{uploading ? 'Uploading...' : 'Click to upload your image'}</span>
              <span className="text-xs text-blue-500">PNG, JPG up to 5MB</span>
            </label>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowUpload(true)}
            className="btn-secondary w-full text-sm py-2 mb-4 flex items-center justify-center gap-2"
          >
            <Upload size={14} /> Upload Custom Image
          </button>
        )}

        <p className="text-xs text-muted mb-2 font-medium">Or choose a default:</p>
        <div className={`grid ${type === 'profile' ? 'grid-cols-4' : 'grid-cols-2 lg:grid-cols-4'} gap-2`}>
          {defaultImages.map(img => (
            <button
              key={img.id}
              type="button"
              onClick={() => {
                onSelect(img.url);
                setPreview(img.url);
              }}
              className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                preview === img.url ? 'border-primary ring-2 ring-primary' : 'border-border hover:border-primary/50'
              }`}
            >
              <img src={img.url} alt={img.name} className="w-full h-full object-cover aspect-square" />
              {preview === img.url && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <div className="text-white font-bold">✓</div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AvatarSelector;
