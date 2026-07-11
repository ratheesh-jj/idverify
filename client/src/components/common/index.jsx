export const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    verified: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize tracking-wide ${styles[status] || styles.pending}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        status === 'pending' ? 'bg-amber-500 animate-pulse-slow' :
        status === 'verified' ? 'bg-emerald-500' : 'bg-red-500'
      }`} />
      {status}
    </span>
  );
};

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className={`${sizes[size]} border-3 border-navy-200 border-t-navy-600 rounded-full animate-spin dark:border-navy-700 dark:border-t-navy-400`} />
    </div>
  );
};

export const FullPageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-navy-950">
    <div className="text-center">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-navy-600 dark:text-navy-400 font-medium">Loading...</p>
    </div>
  </div>
);

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
    {Icon && <Icon className="w-16 h-16 text-navy-300 dark:text-navy-600 mb-4" />}
    <h3 className="text-lg font-semibold text-navy-800 dark:text-navy-200">{title}</h3>
    {description && <p className="mt-1 text-navy-500 dark:text-navy-400 text-sm max-w-md text-center">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', danger = false }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-navy-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
        <h3 className="text-lg font-bold text-navy-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-sm text-navy-600 dark:text-navy-300">{message}</p>
        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-navy-700 dark:text-navy-300 bg-navy-100 dark:bg-navy-700 hover:bg-navy-200 dark:hover:bg-navy-600 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-navy-600 hover:bg-navy-700'}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ImagePreviewModal = ({ isOpen, onClose, imageUrl, title }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-w-4xl max-h-[90vh] w-full animate-fade-in">
        <button onClick={onClose} className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors text-sm font-medium">
          ✕ Close
        </button>
        {title && <p className="text-white text-center mb-3 font-medium">{title}</p>}
        <img src={imageUrl} alt={title || 'Preview'} className="w-full h-auto max-h-[80vh] object-contain rounded-xl shadow-2xl" />
      </div>
    </div>
  );
};

export const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.pages <= 1) return null;
  const { page, pages } = pagination;

  return (
    <div className="flex items-center justify-between px-1 py-4">
      <p className="text-sm text-navy-500 dark:text-navy-400">
        Page {page} of {pages} ({pagination.total} total)
      </p>
      <div className="flex gap-1">
        <button onClick={() => onPageChange(page - 1)} disabled={page <= 1}
          className="px-3 py-1.5 text-sm rounded-lg bg-navy-100 dark:bg-navy-700 text-navy-700 dark:text-navy-300 hover:bg-navy-200 dark:hover:bg-navy-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          Prev
        </button>
        {Array.from({ length: Math.min(5, pages) }, (_, i) => {
          let pageNum;
          if (pages <= 5) pageNum = i + 1;
          else if (page <= 3) pageNum = i + 1;
          else if (page >= pages - 2) pageNum = pages - 4 + i;
          else pageNum = page - 2 + i;
          return (
            <button key={pageNum} onClick={() => onPageChange(pageNum)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${pageNum === page
                ? 'bg-navy-600 text-white dark:bg-navy-500'
                : 'bg-navy-100 dark:bg-navy-700 text-navy-700 dark:text-navy-300 hover:bg-navy-200 dark:hover:bg-navy-600'
              }`}>
              {pageNum}
            </button>
          );
        })}
        <button onClick={() => onPageChange(page + 1)} disabled={page >= pages}
          className="px-3 py-1.5 text-sm rounded-lg bg-navy-100 dark:bg-navy-700 text-navy-700 dark:text-navy-300 hover:bg-navy-200 dark:hover:bg-navy-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          Next
        </button>
      </div>
    </div>
  );
};
