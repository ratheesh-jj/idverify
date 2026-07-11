import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { checkerAPI } from '../../api';
import { StatusBadge, LoadingSpinner, ImagePreviewModal, ConfirmDialog } from '../../components/common';
import { HiOutlineArrowLeft, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineUser, HiOutlinePhotograph } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const VerifyRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // 'approve' | 'reject'

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const { data } = await checkerAPI.getRequest(id);
        setRequest(data.request);
      } catch (error) {
        console.error('Failed to fetch request:', error);
        toast.error('Failed to load request');
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [id]);

  const handleAction = async () => {
    if (confirmAction === 'reject' && !remarks.trim()) {
      toast.error('Remarks are required when rejecting a request');
      return;
    }
    setSubmitting(true);
    try {
      if (confirmAction === 'approve') {
        await checkerAPI.approve(id, { remarks });
        toast.success('Request approved successfully');
      } else {
        await checkerAPI.reject(id, { remarks });
        toast.success('Request rejected');
      }
      navigate('/checker');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setSubmitting(false);
      setConfirmAction(null);
    }
  };

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;
  if (!request) return <div className="text-center py-20 text-navy-500">Request not found</div>;

  const isPending = request.status === 'pending';
  const showActions = isPending || user?.role === 'admin';

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-navy-600 dark:text-navy-400 hover:text-navy-800 dark:hover:text-navy-200 mb-6 text-sm font-medium transition-colors">
        <HiOutlineArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Verification Review</h1>
          <p className="text-navy-500 dark:text-navy-400 text-sm mt-1">Request ID: {request._id}</p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Personal Information */}
        <div className="bg-white dark:bg-navy-900 rounded-2xl border border-navy-100 dark:border-navy-800 p-6">
          <h2 className="text-lg font-bold text-navy-900 dark:text-white mb-4 flex items-center gap-2">
            <HiOutlineUser className="w-5 h-5 text-navy-500" /> Personal Information
          </h2>
          <div className="space-y-4">
            {[
              ['Full Name', request.fullName],
              ['Age', request.age],
              ['Gender', request.gender ? request.gender.charAt(0).toUpperCase() + request.gender.slice(1) : 'N/A'],
              ['Mobile', request.mobile],
              ['Email', request.email],
              ['Address', request.address],
              ['Submitted By', request.makerId?.name],
              ['Submitted On', new Date(request.createdAt).toLocaleString()],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-start">
                <p className="text-xs font-medium text-navy-500 dark:text-navy-400 uppercase tracking-wider">{label}</p>
                <p className="text-sm font-semibold text-navy-900 dark:text-white text-right max-w-[60%]">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        {showActions ? (
          <div className="bg-white dark:bg-navy-900 rounded-2xl border border-navy-100 dark:border-navy-800 p-6">
            <h2 className="text-lg font-bold text-navy-900 dark:text-white mb-4">Verification Action</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-2">Remarks</label>
                <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={4}
                  className="w-full px-4 py-3 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white placeholder-navy-400 focus:ring-2 focus:ring-navy-500 focus:border-transparent outline-none transition-all text-sm resize-none"
                  placeholder="Add verification remarks (required for rejection)..." />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setConfirmAction('approve')} disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50">
                  <HiOutlineCheckCircle className="w-5 h-5" /> Approve
                </button>
                <button onClick={() => setConfirmAction('reject')} disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg shadow-red-600/25 transition-all disabled:opacity-50">
                  <HiOutlineXCircle className="w-5 h-5" /> Reject
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-navy-900 rounded-2xl border border-navy-100 dark:border-navy-800 p-6">
            <h2 className="text-lg font-bold text-navy-900 dark:text-white mb-4">Verification Result</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <p className="text-xs font-medium text-navy-500 uppercase">Status</p>
                <StatusBadge status={request.status} />
              </div>
              <div className="flex justify-between">
                <p className="text-xs font-medium text-navy-500 uppercase">Verified By</p>
                <p className="text-sm font-semibold text-navy-900 dark:text-white">{request.verifiedBy?.name || '—'}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-xs font-medium text-navy-500 uppercase">Verified At</p>
                <p className="text-sm font-semibold text-navy-900 dark:text-white">{request.verifiedAt ? new Date(request.verifiedAt).toLocaleString() : '—'}</p>
              </div>
              {request.remarks && (
                <div>
                  <p className="text-xs font-medium text-navy-500 uppercase mb-1">Remarks</p>
                  <p className="text-sm text-navy-700 dark:text-navy-300 bg-navy-50 dark:bg-navy-800 p-3 rounded-lg">{request.remarks}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Documents */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-navy-100 dark:border-navy-800 p-6 mt-6">
        <h2 className="text-lg font-bold text-navy-900 dark:text-white mb-4 flex items-center gap-2">
          <HiOutlinePhotograph className="w-5 h-5 text-navy-500" /> Uploaded Documents
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            ['Aadhaar Front', request.aadhaarFrontUrl],
            ['Aadhaar Back', request.aadhaarBackUrl],
            ['Passport', request.passportUrl],
          ].map(([label, url]) => (
            <div key={label}>
              <p className="text-xs font-medium text-navy-500 dark:text-navy-400 uppercase tracking-wider mb-2">{label}</p>
              {url ? (
                <img src={url} alt={label} onClick={() => setPreviewImage({ url, title: label })}
                  className="w-full h-56 object-cover rounded-xl border border-navy-200 dark:border-navy-700 cursor-pointer hover:opacity-80 hover:shadow-xl transition-all" />
              ) : (
                <div className="w-full h-56 bg-navy-50 dark:bg-navy-800 rounded-xl border border-navy-200 dark:border-navy-700 flex items-center justify-center">
                  <span className="text-sm text-navy-400">Not uploaded</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleAction}
        title={confirmAction === 'approve' ? 'Approve Request' : 'Reject Request'}
        message={confirmAction === 'approve'
          ? 'Are you sure you want to approve this identity verification request?'
          : 'Are you sure you want to reject this request? Remarks are required.'}
        confirmText={confirmAction === 'approve' ? 'Approve' : 'Reject'}
        danger={confirmAction === 'reject'}
      />

      {/* Image Preview */}
      {previewImage && (
        <ImagePreviewModal isOpen={!!previewImage} onClose={() => setPreviewImage(null)} imageUrl={previewImage.url} title={previewImage.title} />
      )}
    </div>
  );
};

export default VerifyRequest;
