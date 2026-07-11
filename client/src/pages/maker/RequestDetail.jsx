import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { identityAPI } from '../../api';
import { StatusBadge, LoadingSpinner, ImagePreviewModal } from '../../components/common';
import { HiOutlineArrowLeft, HiOutlineUser, HiOutlineDocumentText, HiOutlinePhotograph } from 'react-icons/hi';
import jsPDF from 'jspdf';

const RequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const { data } = await identityAPI.getById(id);
        setRequest(data.request);
      } catch (error) {
        console.error('Failed to fetch request:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [id]);

  const downloadPDF = () => {
    if (!request) return;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Identity Verification Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Name: ${request.fullName}`, 20, 40);
    doc.text(`Age: ${request.age}`, 20, 50);
    doc.text(`Gender: ${request.gender ? request.gender.charAt(0).toUpperCase() + request.gender.slice(1) : 'N/A'}`, 20, 60);
    doc.text(`Mobile: ${request.mobile}`, 20, 70);
    doc.text(`Email: ${request.email}`, 20, 80);
    doc.text(`Address: ${request.address}`, 20, 90);
    doc.text(`Status: ${request.status.toUpperCase()}`, 20, 110);
    doc.text(`Submitted: ${new Date(request.createdAt).toLocaleDateString()}`, 20, 120);
    if (request.verifiedAt) {
      doc.text(`Verified: ${new Date(request.verifiedAt).toLocaleDateString()}`, 20, 130);
    }
    if (request.remarks) {
      doc.text(`Remarks: ${request.remarks}`, 20, 140);
    }
    doc.save(`verification-report-${request._id}.pdf`);
  };

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;
  if (!request) return <div className="text-center py-20 text-navy-500">Request not found</div>;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-navy-600 dark:text-navy-400 hover:text-navy-800 dark:hover:text-navy-200 mb-6 text-sm font-medium transition-colors">
        <HiOutlineArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">{request.fullName}</h1>
          <p className="text-navy-500 dark:text-navy-400 text-sm mt-1">Request ID: {request._id}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={request.status} />
          <button onClick={downloadPDF}
            className="px-4 py-2 bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300 rounded-xl text-sm font-medium hover:bg-navy-200 dark:hover:bg-navy-700 transition-colors">
            Download PDF
          </button>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-navy-100 dark:border-navy-800 p-6 mb-6">
        <h2 className="text-lg font-bold text-navy-900 dark:text-white mb-4 flex items-center gap-2">
          <HiOutlineUser className="w-5 h-5 text-navy-500" /> Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            ['Full Name', request.fullName],
            ['Age', request.age],
            ['Gender', request.gender ? request.gender.charAt(0).toUpperCase() + request.gender.slice(1) : 'N/A'],
            ['Mobile', request.mobile],
            ['Email', request.email],
            ['Address', request.address],
            ['Submitted', new Date(request.createdAt).toLocaleString()],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-xs font-medium text-navy-500 dark:text-navy-400 uppercase tracking-wider">{label}</p>
              <p className="text-sm font-semibold text-navy-900 dark:text-white mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Documents */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-navy-100 dark:border-navy-800 p-6 mb-6">
        <h2 className="text-lg font-bold text-navy-900 dark:text-white mb-4 flex items-center gap-2">
          <HiOutlinePhotograph className="w-5 h-5 text-navy-500" /> Documents
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
                  className="w-full h-40 object-cover rounded-xl border border-navy-200 dark:border-navy-700 cursor-pointer hover:opacity-80 transition-opacity" />
              ) : (
                <div className="w-full h-40 bg-navy-50 dark:bg-navy-800 rounded-xl border border-navy-200 dark:border-navy-700 flex items-center justify-center">
                  <span className="text-sm text-navy-400">Not uploaded</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Verification Details */}
      {(request.status !== 'pending') && (
        <div className="bg-white dark:bg-navy-900 rounded-2xl border border-navy-100 dark:border-navy-800 p-6">
          <h2 className="text-lg font-bold text-navy-900 dark:text-white mb-4 flex items-center gap-2">
            <HiOutlineDocumentText className="w-5 h-5 text-navy-500" /> Verification Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-navy-500 dark:text-navy-400 uppercase tracking-wider">Verified By</p>
              <p className="text-sm font-semibold text-navy-900 dark:text-white mt-0.5">{request.verifiedBy?.name || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-navy-500 dark:text-navy-400 uppercase tracking-wider">Verified At</p>
              <p className="text-sm font-semibold text-navy-900 dark:text-white mt-0.5">{request.verifiedAt ? new Date(request.verifiedAt).toLocaleString() : '—'}</p>
            </div>
            {request.remarks && (
              <div className="md:col-span-2">
                <p className="text-xs font-medium text-navy-500 dark:text-navy-400 uppercase tracking-wider">Remarks</p>
                <p className="text-sm text-navy-700 dark:text-navy-300 mt-0.5 bg-navy-50 dark:bg-navy-800 p-3 rounded-lg">{request.remarks}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {previewImage && (
        <ImagePreviewModal isOpen={!!previewImage} onClose={() => setPreviewImage(null)} imageUrl={previewImage.url} title={previewImage.title} />
      )}
    </div>
  );
};

export default RequestDetail;
