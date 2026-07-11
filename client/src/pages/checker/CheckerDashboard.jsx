import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { checkerAPI } from '../../api';
import { StatusBadge, LoadingSpinner, EmptyState, Pagination } from '../../components/common';
import { HiOutlineSearch, HiOutlineClock, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineClipboardList } from 'react-icons/hi';

const CheckerDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const activeTab = searchParams.get('status') || 'pending';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const sort = searchParams.get('sort') || 'newest';

  useEffect(() => {
    fetchRequests();
  }, [activeTab, page, sort]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = { status: activeTab, page, limit: 10, sort };
      if (search) params.search = search;
      const { data } = await checkerAPI.getRequests(params);
      setRequests(data.requests);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (status) => {
    setSearchParams({ status, page: '1', sort });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ status: activeTab, page: '1', sort });
    fetchRequests();
  };

  const tabs = [
    { key: 'pending', label: 'Pending', icon: HiOutlineClock, color: 'amber' },
    { key: 'verified', label: 'Verified', icon: HiOutlineCheckCircle, color: 'emerald' },
    { key: 'rejected', label: 'Rejected', icon: HiOutlineXCircle, color: 'red' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Checker Dashboard</h1>
        <p className="text-navy-500 dark:text-navy-400 text-sm mt-1">Review and verify identity requests</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map(({ key, label, icon: Icon, color }) => (
          <button key={key} onClick={() => handleTabChange(key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
              ${activeTab === key
                ? `bg-${color}-100 text-${color}-800 dark:bg-${color}-900/30 dark:text-${color}-400 shadow-sm`
                : 'bg-navy-50 dark:bg-navy-800 text-navy-600 dark:text-navy-400 hover:bg-navy-100 dark:hover:bg-navy-700'
              }`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-navy-100 dark:border-navy-800 p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white placeholder-navy-400 focus:ring-2 focus:ring-navy-500 focus:border-transparent outline-none transition-all text-sm"
              placeholder="Search by name or request ID..." />
          </div>
          <select value={sort} onChange={(e) => setSearchParams({ status: activeTab, page: '1', sort: e.target.value })}
            className="px-4 py-2.5 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white text-sm focus:ring-2 focus:ring-navy-500 outline-none">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </form>
      </div>

      {/* Results */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-navy-100 dark:border-navy-800 overflow-hidden">
        {loading ? (
          <LoadingSpinner size="lg" className="py-16" />
        ) : requests.length === 0 ? (
          <EmptyState icon={HiOutlineClipboardList} title={`No ${activeTab} requests`} description={`There are no ${activeTab} verification requests at this time.`} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-navy-100 dark:border-navy-800">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-navy-500 dark:text-navy-400 uppercase tracking-wider">Applicant</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-navy-500 dark:text-navy-400 uppercase tracking-wider">Age</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-navy-500 dark:text-navy-400 uppercase tracking-wider">Aadhaar</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-navy-500 dark:text-navy-400 uppercase tracking-wider">Passport</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-navy-500 dark:text-navy-400 uppercase tracking-wider">Submitted</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-navy-500 dark:text-navy-400 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-navy-500 dark:text-navy-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100 dark:divide-navy-800">
                  {requests.map((req) => (
                    <tr key={req._id} className="hover:bg-navy-50 dark:hover:bg-navy-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-navy-900 dark:text-white">{req.fullName}</p>
                        <p className="text-xs text-navy-500 dark:text-navy-400">{req.makerId?.email}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-navy-600 dark:text-navy-300">{req.age}</td>
                      <td className="px-6 py-4">
                        {req.aadhaarFrontUrl && <img src={req.aadhaarFrontUrl} alt="Aadhaar" className="w-10 h-10 rounded-lg object-cover border border-navy-200 dark:border-navy-700" />}
                      </td>
                      <td className="px-6 py-4">
                        {req.passportUrl ? (
                          <img src={req.passportUrl} alt="Passport" className="w-10 h-10 rounded-lg object-cover border border-navy-200 dark:border-navy-700" />
                        ) : <span className="text-xs text-navy-400">—</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-navy-500 dark:text-navy-400">{new Date(req.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                      <td className="px-6 py-4">
                        <Link to={`/checker/verify/${req._id}`}
                          className="text-sm font-medium text-navy-600 dark:text-navy-400 hover:text-navy-800 dark:hover:text-navy-200 hover:underline">
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination pagination={pagination} onPageChange={(p) => setSearchParams({ status: activeTab, page: String(p), sort })} />
          </>
        )}
      </div>
    </div>
  );
};

export default CheckerDashboard;
