import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { identityAPI } from '../../api';
import { HiOutlinePhotograph, HiOutlineUpload, HiOutlineX } from 'react-icons/hi';
import toast from 'react-hot-toast';

const NewRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ fullName: '', age: '', gender: '', mobile: '', email: '', address: '' });
  const [files, setFiles] = useState({ aadhaarFront: null, aadhaarBack: null, passport: null });
  const [previews, setPreviews] = useState({ aadhaarFront: null, aadhaarBack: null, passport: null });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (field, file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }
    setFiles({ ...files, [field]: file });
    setPreviews({ ...previews, [field]: URL.createObjectURL(file) });
  };

  const removeFile = (field) => {
    setFiles({ ...files, [field]: null });
    if (previews[field]) URL.revokeObjectURL(previews[field]);
    setPreviews({ ...previews, [field]: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files.aadhaarFront) {
      toast.error('Aadhaar front image is required');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      formData.append('aadhaarFront', files.aadhaarFront);
      if (files.aadhaarBack) formData.append('aadhaarBack', files.aadhaarBack);
      if (files.passport) formData.append('passport', files.passport);

      await identityAPI.create(formData);
      toast.success('Request submitted successfully!');
      navigate('/maker/requests');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const FileUploadArea = ({ field, label, required = false }) => (
    <div>
      <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {previews[field] ? (
        <div className="relative group rounded-xl overflow-hidden border-2 border-navy-200 dark:border-navy-700">
          <img src={previews[field]} alt={label} className="w-full h-48 object-cover" />
          <button type="button" onClick={() => removeFile(field)}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
            <HiOutlineX className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-navy-300 dark:border-navy-600 rounded-xl cursor-pointer hover:border-navy-500 dark:hover:border-navy-400 hover:bg-navy-50/50 dark:hover:bg-navy-800/50 transition-all group">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <div className="w-12 h-12 bg-navy-100 dark:bg-navy-700 rounded-xl flex items-center justify-center mb-3 group-hover:bg-navy-200 dark:group-hover:bg-navy-600 transition-colors">
              <HiOutlineUpload className="w-6 h-6 text-navy-500 dark:text-navy-400" />
            </div>
            <p className="text-sm text-navy-600 dark:text-navy-400 font-medium">Click to upload</p>
            <p className="text-xs text-navy-400 dark:text-navy-500 mt-1">PNG, JPG, WEBP up to 5MB</p>
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(field, e.target.files[0])} />
        </label>
      )}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white">New Identity Request</h1>
        <p className="text-navy-500 dark:text-navy-400 text-sm mt-1">Fill in the details and upload required documents</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Details */}
        <div className="bg-white dark:bg-navy-900 rounded-2xl border border-navy-100 dark:border-navy-800 p-6">
          <h2 className="text-lg font-bold text-navy-900 dark:text-white mb-5 flex items-center gap-2">
            <span className="w-7 h-7 bg-navy-600 text-white rounded-lg flex items-center justify-center text-xs font-bold">1</span>
            Personal Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-1.5">Full Name <span className="text-red-500">*</span></label>
              <input type="text" name="fullName" value={form.fullName} onChange={handleChange} required
                className="w-full px-4 py-2.5 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white placeholder-navy-400 focus:ring-2 focus:ring-navy-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter full name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-1.5">Age <span className="text-red-500">*</span></label>
              <input type="number" name="age" value={form.age} onChange={handleChange} required min="1" max="150"
                className="w-full px-4 py-2.5 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white placeholder-navy-400 focus:ring-2 focus:ring-navy-500 focus:border-transparent outline-none transition-all"
                placeholder="Age" />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-1.5">Gender <span className="text-red-500">*</span></label>
              <select name="gender" value={form.gender} onChange={handleChange} required
                className="w-full px-4 py-2.5 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:ring-2 focus:ring-navy-500 focus:border-transparent outline-none transition-all">
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-1.5">Mobile Number <span className="text-red-500">*</span></label>
              <input type="tel" name="mobile" value={form.mobile} onChange={handleChange} required pattern="[0-9]{10}"
                className="w-full px-4 py-2.5 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white placeholder-navy-400 focus:ring-2 focus:ring-navy-500 focus:border-transparent outline-none transition-all"
                placeholder="10-digit mobile number" />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-1.5">Email <span className="text-red-500">*</span></label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required
                className="w-full px-4 py-2.5 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white placeholder-navy-400 focus:ring-2 focus:ring-navy-500 focus:border-transparent outline-none transition-all"
                placeholder="email@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-1.5">Address <span className="text-red-500">*</span></label>
              <input type="text" name="address" value={form.address} onChange={handleChange} required
                className="w-full px-4 py-2.5 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white placeholder-navy-400 focus:ring-2 focus:ring-navy-500 focus:border-transparent outline-none transition-all"
                placeholder="Full address" />
            </div>
          </div>
        </div>

        {/* Aadhaar Card */}
        <div className="bg-white dark:bg-navy-900 rounded-2xl border border-navy-100 dark:border-navy-800 p-6">
          <h2 className="text-lg font-bold text-navy-900 dark:text-white mb-5 flex items-center gap-2">
            <span className="w-7 h-7 bg-navy-600 text-white rounded-lg flex items-center justify-center text-xs font-bold">2</span>
            Aadhaar Card <span className="text-xs font-normal text-red-500">(Required)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FileUploadArea field="aadhaarFront" label="Aadhaar Front" required />
            <FileUploadArea field="aadhaarBack" label="Aadhaar Back (Optional)" />
          </div>
        </div>

        {/* Passport */}
        <div className="bg-white dark:bg-navy-900 rounded-2xl border border-navy-100 dark:border-navy-800 p-6">
          <h2 className="text-lg font-bold text-navy-900 dark:text-white mb-5 flex items-center gap-2">
            <span className="w-7 h-7 bg-navy-600 text-white rounded-lg flex items-center justify-center text-xs font-bold">3</span>
            Passport <span className="text-xs font-normal text-navy-400">(Optional)</span>
          </h2>
          <FileUploadArea field="passport" label="Passport Image" />
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)}
            className="px-6 py-2.5 bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300 font-medium rounded-xl hover:bg-navy-200 dark:hover:bg-navy-700 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="px-8 py-2.5 bg-gradient-to-r from-navy-600 to-navy-700 hover:from-navy-700 hover:to-navy-800 text-white font-semibold rounded-xl shadow-lg shadow-navy-600/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewRequest;
