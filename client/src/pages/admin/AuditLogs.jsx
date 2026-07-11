import { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { LoadingSpinner, Pagination, EmptyState } from '../../components/common';
import { HiOutlineDocumentSearch } from 'react-icons/hi';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { fetchLogs(); }, [page, actionFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (actionFilter) params.action = actionFilter;
      const { data } = await adminAPI.getAuditLogs(params);
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const actionColors = {
    USER_CREATED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    USER_UPDATED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    USER_DELETED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    ROLE_CHANGED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    PASSWORD_RESET: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    REQUEST_CREATED: 'bg-navy-100 text-navy-800 dark:bg-navy-800 dark:text-navy-300',
    REQUEST_APPROVED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    REQUEST_REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    REQUEST_EDITED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    LOGIN: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  };

  const actions = [
    'USER_CREATED', 'USER_UPDATED', 'USER_DELETED', 'ROLE_CHANGED',
    'PASSWORD_RESET', 'REQUEST_CREATED', 'REQUEST_APPROVED', 'REQUEST_REJECTED', 'LOGIN',
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Audit Logs</h1>
        <p className="text-navy-500 dark:text-navy-400 text-sm mt-1">Immutable activity trail — cannot be edited or deleted</p>
      </div>

      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-navy-100 dark:border-navy-800 p-4 mb-6">
        <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white text-sm outline-none">
          <option value="">All Actions</option>
          {actions.map((a) => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-navy-100 dark:border-navy-800 overflow-hidden">
        {loading ? <LoadingSpinner size="lg" className="py-16" /> : logs.length === 0 ? (
          <EmptyState icon={HiOutlineDocumentSearch} title="No audit logs" description="No activity has been recorded yet." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-navy-100 dark:border-navy-800">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wider">Action</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wider">Performed By</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wider">Details</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wider">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100 dark:divide-navy-800">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-navy-50 dark:hover:bg-navy-800/50 transition-colors">
                      <td className="px-6 py-3">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${actionColors[log.action] || 'bg-gray-100 text-gray-800'}`}>
                          {log.action?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <p className="text-sm font-medium text-navy-900 dark:text-white">{log.performedBy?.name || '—'}</p>
                        <p className="text-xs text-navy-500">{log.performedBy?.email}</p>
                      </td>
                      <td className="px-6 py-3 text-sm text-navy-600 dark:text-navy-300 max-w-xs truncate">
                        {log.details?.applicantName || log.details?.userName || log.details?.email || log.details?.name || '—'}
                      </td>
                      <td className="px-6 py-3 text-sm text-navy-500">{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
