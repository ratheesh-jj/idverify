import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../api';
import { StatusBadge, LoadingSpinner, EmptyState, Pagination } from '../../components/common';
import { HiOutlineSearch, HiOutlineClipboardList } from 'react-icons/hi';

const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  useEffect(() => { fetchRequests(); }, [page, status, sort]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, sort };
      if (status) params.status = status;
      if (search) params.search = search;
      const { data } = await adminAPI.getRequests(params);
      setRequests(data.requests);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white">All Requests</h1>
        <p className="text-navy-500 dark:text-navy-400 text-sm mt-1">View and manage all identity verification requests</p>
      </div>

      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-navy-100 dark:border-navy-800 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={(e) => { e.preventDefault(); setPage(1); fetchRequests(); }} className="flex-1 relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white placeholder-navy-400 focus:ring-2 focus:ring-navy-500 outline-none text-sm"
              placeholder="Search by name..." />
          </form>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white text-sm outline-none">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
          <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white text-sm outline-none">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-navy-100 dark:border-navy-800 overflow-hidden">
        {loading ? <LoadingSpinner size="lg" className="py-16" /> : requests.length === 0 ? (
          <EmptyState icon={HiOutlineClipboardList} title="No requests found" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-navy-100 dark:border-navy-800">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wider">Name</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wider">Submitted By</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wider">Age</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wider">Date</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100 dark:divide-navy-800">
                  {requests.map((req) => (
                    <tr key={req._id} className="hover:bg-navy-50 dark:hover:bg-navy-800/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-navy-900 dark:text-white">{req.fullName}</td>
                      <td className="px-6 py-4 text-sm text-navy-600 dark:text-navy-300">{req.makerId?.name}</td>
                      <td className="px-6 py-4 text-sm text-navy-600 dark:text-navy-300">{req.age}</td>
                      <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                      <td className="px-6 py-4 text-sm text-navy-500">{new Date(req.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <Link to={`/checker/verify/${req._id}`} className="text-sm font-medium text-navy-600 hover:underline">View →</Link>
                      </td>
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

export default AdminRequests;
