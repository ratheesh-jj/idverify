import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { identityAPI } from '../../api';
import { StatusBadge, LoadingSpinner, EmptyState } from '../../components/common';
import { HiOutlineDocumentAdd, HiOutlineClipboardList, HiOutlineClock, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi';

const MakerDashboard = () => {
  const [stats, setStats] = useState({ total: 0, pending: 0, verified: 0, rejected: 0 });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allRes, pendingRes, verifiedRes, rejectedRes] = await Promise.all([
          identityAPI.getMyRequests({ limit: 5 }),
          identityAPI.getMyRequests({ status: 'pending', limit: 1 }),
          identityAPI.getMyRequests({ status: 'verified', limit: 1 }),
          identityAPI.getMyRequests({ status: 'rejected', limit: 1 }),
        ]);
        setRecentRequests(allRes.data.requests);
        setStats({
          total: allRes.data.pagination.total,
          pending: pendingRes.data.pagination.total,
          verified: verifiedRes.data.pagination.total,
          rejected: rejectedRes.data.pagination.total,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { label: 'Total Requests', value: stats.total, icon: HiOutlineClipboardList, color: 'from-navy-500 to-navy-700', bg: 'bg-navy-50 dark:bg-navy-800/50' },
    { label: 'Pending', value: stats.pending, icon: HiOutlineClock, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Verified', value: stats.verified, icon: HiOutlineCheckCircle, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Rejected', value: stats.rejected, icon: HiOutlineXCircle, color: 'from-red-500 to-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
  ];

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Maker Dashboard</h1>
          <p className="text-navy-500 dark:text-navy-400 text-sm mt-1">Submit and track your identity verification requests</p>
        </div>
        <Link to="/maker/new-request"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-navy-600 to-navy-700 hover:from-navy-700 hover:to-navy-800 text-white font-semibold rounded-xl shadow-lg shadow-navy-600/25 transition-all duration-300 text-sm">
          <HiOutlineDocumentAdd className="w-5 h-5" /> New Request
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-5 border border-navy-100 dark:border-navy-800 transition-transform hover:scale-[1.02] duration-200`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-navy-500 dark:text-navy-400 uppercase tracking-wider">{label}</p>
                <p className="text-3xl font-bold text-navy-900 dark:text-white mt-1">{value}</p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Requests */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-navy-100 dark:border-navy-800 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-100 dark:border-navy-800">
          <h2 className="text-lg font-bold text-navy-900 dark:text-white">Recent Requests</h2>
          <Link to="/maker/requests" className="text-sm text-navy-600 dark:text-navy-400 hover:underline font-medium">View All →</Link>
        </div>
        {recentRequests.length === 0 ? (
          <EmptyState icon={HiOutlineClipboardList} title="No requests yet" description="Submit your first identity verification request to get started."
            action={<Link to="/maker/new-request" className="text-sm text-navy-600 hover:underline font-medium">Create your first request →</Link>} />
        ) : (
          <div className="divide-y divide-navy-100 dark:divide-navy-800">
            {recentRequests.map((req) => (
              <Link key={req._id} to={`/maker/request/${req._id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-navy-50 dark:hover:bg-navy-800/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-navy-900 dark:text-white truncate">{req.fullName}</p>
                  <p className="text-xs text-navy-500 dark:text-navy-400 mt-0.5">
                    Age: {req.age} • {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={req.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MakerDashboard;
