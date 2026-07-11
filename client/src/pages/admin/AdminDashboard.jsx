import { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { LoadingSpinner } from '../../components/common';
import {
  HiOutlineUsers, HiOutlineClipboardList, HiOutlineClock, HiOutlineCheckCircle,
  HiOutlineXCircle, HiOutlineShieldCheck, HiOutlineUserGroup, HiOutlineChartBar,
} from 'react-icons/hi';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await adminAPI.getDashboard();
        setStats(data.stats);
        setActivity(data.recentActivity);
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers, icon: HiOutlineUsers, gradient: 'from-navy-500 to-navy-700' },
    { label: 'Makers', value: stats?.totalMakers, icon: HiOutlineUserGroup, gradient: 'from-blue-500 to-blue-700' },
    { label: 'Checkers', value: stats?.totalCheckers, icon: HiOutlineShieldCheck, gradient: 'from-indigo-500 to-indigo-700' },
    { label: 'Total Requests', value: stats?.totalRequests, icon: HiOutlineClipboardList, gradient: 'from-purple-500 to-purple-700' },
    { label: 'Pending', value: stats?.pendingRequests, icon: HiOutlineClock, gradient: 'from-amber-500 to-amber-600' },
    { label: 'Verified', value: stats?.verifiedRequests, icon: HiOutlineCheckCircle, gradient: 'from-emerald-500 to-emerald-600' },
    { label: 'Rejected', value: stats?.rejectedRequests, icon: HiOutlineXCircle, gradient: 'from-red-500 to-red-600' },
    { label: 'Admins', value: stats?.totalAdmins, icon: HiOutlineChartBar, gradient: 'from-rose-500 to-rose-600' },
  ];

  const actionLabels = {
    USER_CREATED: { label: 'User Created', color: 'text-emerald-600 dark:text-emerald-400' },
    USER_UPDATED: { label: 'User Updated', color: 'text-blue-600 dark:text-blue-400' },
    USER_DELETED: { label: 'User Deleted', color: 'text-red-600 dark:text-red-400' },
    ROLE_CHANGED: { label: 'Role Changed', color: 'text-purple-600 dark:text-purple-400' },
    PASSWORD_RESET: { label: 'Password Reset', color: 'text-amber-600 dark:text-amber-400' },
    REQUEST_CREATED: { label: 'Request Created', color: 'text-navy-600 dark:text-navy-400' },
    REQUEST_APPROVED: { label: 'Request Approved', color: 'text-emerald-600 dark:text-emerald-400' },
    REQUEST_REJECTED: { label: 'Request Rejected', color: 'text-red-600 dark:text-red-400' },
    LOGIN: { label: 'Login', color: 'text-navy-500 dark:text-navy-400' },
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-navy-500 dark:text-navy-400 text-sm mt-1">System overview and analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, gradient }) => (
          <div key={label} className="bg-white dark:bg-navy-900 rounded-2xl border border-navy-100 dark:border-navy-800 p-5 transition-transform hover:scale-[1.02] duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-navy-500 dark:text-navy-400 uppercase tracking-wider">{label}</p>
                <p className="text-3xl font-bold text-navy-900 dark:text-white mt-1">{value || 0}</p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-navy-100 dark:border-navy-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-navy-100 dark:border-navy-800">
          <h2 className="text-lg font-bold text-navy-900 dark:text-white">Recent Activity</h2>
        </div>
        <div className="divide-y divide-navy-100 dark:divide-navy-800 max-h-96 overflow-y-auto">
          {activity.length === 0 ? (
            <p className="text-center py-8 text-navy-500 text-sm">No recent activity</p>
          ) : (
            activity.map((log) => {
              const actionInfo = actionLabels[log.action] || { label: log.action, color: 'text-navy-500' };
              return (
                <div key={log._id} className="px-6 py-3 hover:bg-navy-50 dark:hover:bg-navy-800/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm font-semibold ${actionInfo.color}`}>{actionInfo.label}</span>
                      <p className="text-xs text-navy-500 dark:text-navy-400 mt-0.5 truncate">
                        by {log.performedBy?.name || 'System'}
                        {log.details?.applicantName && ` • ${log.details.applicantName}`}
                        {log.details?.userName && ` • ${log.details.userName}`}
                      </p>
                    </div>
                    <span className="text-xs text-navy-400 dark:text-navy-500 whitespace-nowrap ml-4">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
