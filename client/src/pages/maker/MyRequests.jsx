import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { identityAPI } from '../../api';
import { StatusBadge, LoadingSpinner, EmptyState, Pagination } from '../../components/common';
import { HiOutlineSearch, HiOutlineClipboardList, HiOutlineFilter } from 'react-icons/hi';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchRequests();
  }, [page, status, sort]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, sort };
      if (status) params.status = status;
      if (search) params.search = search;
      const { data } = await identityAPI.getMyRequests(params);
      setRequests(data.requests);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRequests();
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white">My Requests</h1>
        <p className="text-navy-500 dark:text-navy-400 text-sm mt-1">View all your identity verification submissions</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-navy-100 dark:border-navy-800 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white placeholder-navy-400 focus:ring-2 focus:ring-navy-500 focus:border-transparent outline-none transition-all text-sm"
              placeholder="Search by name..." />
          </form>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white text-sm focus:ring-2 focus:ring-navy-500 outline-none">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
          <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white text-sm focus:ring-2 focus:ring-navy-500 outline-none">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-navy-100 dark:border-navy-800 overflow-hidden">
        {loading ? (
          <LoadingSpinner size="lg" className="py-16" />
        ) : requests.length === 0 ? (
          <EmptyState icon={HiOutlineClipboardList} title="No requests found" description="No identity verification requests match your criteria." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-navy-100 dark:border-navy-800">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-navy-500 dark:text-navy-400 uppercase tracking-wider">Name</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-navy-500 dark:text-navy-400 uppercase tracking-wider">Age</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-navy-500 dark:text-navy-400 uppercase tracking-wider">Aadhaar</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-navy-500 dark:text-navy-400 uppercase tracking-wider">Passport</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-navy-500 dark:text-navy-400 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-navy-500 dark:text-navy-400 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100 dark:divide-navy-800">
                  {requests.map((req) => (
                    <tr key={req._id} className="hover:bg-navy-50 dark:hover:bg-navy-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <Link to={`/maker/request/${req._id}`} className="text-sm font-semibold text-navy-900 dark:text-white hover:text-navy-600 dark:hover:text-navy-300">
                          {req.fullName}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-navy-600 dark:text-navy-300">{req.age}</td>
                      <td className="px-6 py-4">
                        {req.aadhaarFrontUrl ? (
                          <img src={req.aadhaarFrontUrl} alt="Aadhaar" className="w-10 h-10 rounded-lg object-cover border border-navy-200 dark:border-navy-700" />
                        ) : <span className="text-xs text-navy-400">—</span>}
                      </td>
                      <td className="px-6 py-4">
                        {req.passportUrl ? (
                          <img src={req.passportUrl} alt="Passport" className="w-10 h-10 rounded-lg object-cover border border-navy-200 dark:border-navy-700" />
                        ) : <span className="text-xs text-navy-400">No</span>}
                      </td>
                      <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                      <td className="px-6 py-4 text-sm text-navy-500 dark:text-navy-400">{new Date(req.createdAt).toLocaleDateString()}</td>
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

export default MyRequests;
