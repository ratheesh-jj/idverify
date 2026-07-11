import { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { LoadingSpinner, Pagination, ConfirmDialog } from '../../components/common';
import { HiOutlineSearch, HiOutlineUserAdd, HiOutlinePencil, HiOutlineTrash, HiOutlineX, HiOutlineUsers } from 'react-icons/hi';
import toast from 'react-hot-toast';

const UserModal = ({ isOpen, onClose, onSave, user }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'maker' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name, email: user.email, password: '', role: user.role });
    } else {
      setForm({ name: '', email: '', password: '', role: 'maker' });
    }
  }, [user, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-navy-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-navy-900 dark:text-white">{user ? 'Edit User' : 'Create User'}</h3>
          <button onClick={onClose} className="text-navy-400 hover:text-navy-600 transition-colors">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-1.5">Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
              className="w-full px-4 py-2.5 bg-navy-50 dark:bg-navy-700 border border-navy-200 dark:border-navy-600 rounded-xl text-navy-900 dark:text-white focus:ring-2 focus:ring-navy-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
              className="w-full px-4 py-2.5 bg-navy-50 dark:bg-navy-700 border border-navy-200 dark:border-navy-600 rounded-xl text-navy-900 dark:text-white focus:ring-2 focus:ring-navy-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-1.5">
              Password {user && <span className="text-xs text-navy-400">(leave blank to keep current)</span>}
            </label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              {...(!user && { required: true })} minLength={6}
              className="w-full px-4 py-2.5 bg-navy-50 dark:bg-navy-700 border border-navy-200 dark:border-navy-600 rounded-xl text-navy-900 dark:text-white focus:ring-2 focus:ring-navy-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-1.5">Role</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-4 py-2.5 bg-navy-50 dark:bg-navy-700 border border-navy-200 dark:border-navy-600 rounded-xl text-navy-900 dark:text-white focus:ring-2 focus:ring-navy-500 outline-none">
              <option value="maker">Maker</option>
              <option value="checker">Checker</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 bg-navy-100 dark:bg-navy-700 text-navy-700 dark:text-navy-300 rounded-xl font-medium hover:bg-navy-200 dark:hover:bg-navy-600 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-navy-600 hover:bg-navy-700 text-white rounded-xl font-semibold shadow-lg transition-all disabled:opacity-50">
              {saving ? 'Saving...' : user ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;
      const { data } = await adminAPI.getUsers(params);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (form) => {
    await adminAPI.createUser(form);
    toast.success('User created successfully');
    fetchUsers();
  };

  const handleUpdateUser = async (form) => {
    const updateData = { name: form.name, email: form.email, role: form.role };
    if (form.password) updateData.password = form.password;
    await adminAPI.updateUser(editUser._id, updateData);
    toast.success('User updated successfully');
    setEditUser(null);
    fetchUsers();
  };

  const handleDeleteUser = async () => {
    try {
      await adminAPI.deleteUser(deleteConfirm._id);
      toast.success('User deleted');
      setDeleteConfirm(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const roleColors = {
    maker: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    checker: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">User Management</h1>
          <p className="text-navy-500 dark:text-navy-400 text-sm mt-1">Manage users, roles, and permissions</p>
        </div>
        <button onClick={() => { setEditUser(null); setModalOpen(true); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-navy-600 to-navy-700 hover:from-navy-700 hover:to-navy-800 text-white font-semibold rounded-xl shadow-lg shadow-navy-600/25 transition-all text-sm">
          <HiOutlineUserAdd className="w-5 h-5" /> Add User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-navy-100 dark:border-navy-800 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={(e) => { e.preventDefault(); setPage(1); fetchUsers(); }} className="flex-1 relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white placeholder-navy-400 focus:ring-2 focus:ring-navy-500 outline-none text-sm"
              placeholder="Search users..." />
          </form>
          <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white text-sm outline-none">
            <option value="">All Roles</option>
            <option value="maker">Maker</option>
            <option value="checker">Checker</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-navy-100 dark:border-navy-800 overflow-hidden">
        {loading ? (
          <LoadingSpinner size="lg" className="py-16" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-navy-100 dark:border-navy-800">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-navy-500 dark:text-navy-400 uppercase tracking-wider">User</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-navy-500 dark:text-navy-400 uppercase tracking-wider">Email</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-navy-500 dark:text-navy-400 uppercase tracking-wider">Role</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-navy-500 dark:text-navy-400 uppercase tracking-wider">Joined</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-navy-500 dark:text-navy-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100 dark:divide-navy-800">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-navy-50 dark:hover:bg-navy-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-navy-500 to-navy-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-navy-900 dark:text-white">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-navy-600 dark:text-navy-300">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${roleColors[u.role]}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-navy-500 dark:text-navy-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => { setEditUser(u); setModalOpen(true); }}
                            className="p-2 rounded-lg text-navy-600 dark:text-navy-400 hover:bg-navy-100 dark:hover:bg-navy-700 transition-colors">
                            <HiOutlinePencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteConfirm(u)}
                            className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        </div>
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

      {/* User Modal */}
      <UserModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditUser(null); }}
        onSave={editUser ? handleUpdateUser : handleCreateUser}
        user={editUser}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This will also delete all their identity requests.`}
        confirmText="Delete"
        danger
      />
    </div>
  );
};

export default UserManagement;
