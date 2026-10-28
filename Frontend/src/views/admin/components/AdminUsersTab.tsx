import React, { useMemo } from 'react';
import { Search, Users, Eye, Trash2 } from 'lucide-react';
import { User, Order } from '../../../types';
import { formatBDT } from '../../../data/bangladeshGeo';

interface Props {
  usersList: User[];
  orders: Order[];
  userSearch: string;
  onUserSearchChange: (val: string) => void;
  onInspectUser: (user: User) => void;
  onDeleteUser: (userId: string, userName: string) => void;
}

export const AdminUsersTab: React.FC<Props> = ({
  usersList,
  orders,
  userSearch,
  onUserSearchChange,
  onInspectUser,
  onDeleteUser,
}) => {
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      if (!userSearch.trim()) return true;
      const q = userSearch.toLowerCase();
      return (
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.includes(q)) ||
        (u.id && u.id.toLowerCase().includes(q))
      );
    });
  }, [usersList, userSearch]);

  return (
    <div className="space-y-4">
      {/* Header and Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-sky-50 text-sky-600 rounded-lg">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Customer Accounts &amp; Sign-Up Directory
              </h3>
              <p className="text-xs text-slate-500">
                View registered users, inspect their sign-up information, and manage or delete customer accounts.
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={userSearch}
            onChange={(e) => onUserSearchChange(e.target.value)}
            placeholder="Search by name, email, phone, or ID..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Auth Method</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Sign-Up Date</th>
                <th className="py-3 px-4">Orders &amp; Spend</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const userOrders = orders.filter((o) => o.userId === u.id);
                  const userSpend = userOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
                  const formattedDate = u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Recent';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-800 font-bold flex items-center justify-center shrink-0 uppercase text-xs">
                            {u.avatarUrl ? (
                              <img src={u.avatarUrl} alt={u.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              u.name?.charAt(0) || 'U'
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate max-w-[200px]">
                              {u.name || 'Anonymous User'}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">
                              ID: {u.id?.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-slate-800 font-semibold block">{u.email || 'No email provided'}</span>
                        <span className="text-slate-500 font-mono text-[11px] block mt-0.5">
                          {u.phone || 'No phone provided'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 capitalize">
                          {u.authProvider || 'Phone OTP'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.role === 'ADMIN'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {u.role || 'CUSTOMER'}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                        {formattedDate}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">
                          {userOrders.length} orders
                        </span>
                        <span className="font-mono text-slate-500 text-[10px]">
                          {formatBDT(userSpend)}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onInspectUser(u)}
                            className="px-2.5 py-1 text-sky-600 hover:bg-sky-50 rounded-md cursor-pointer flex items-center gap-1 font-semibold text-xs border border-sky-200"
                            title="View full sign-up information"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Info</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteUser(u.id, u.name)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer border border-rose-200"
                            title="Delete user account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
