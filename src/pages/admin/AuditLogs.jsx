import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const AuditLogs = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState('all');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchLogs();
    fetchUsers();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [searchTerm, selectedUser, logs]);

  const fetchLogs = async () => {
    try {
      const response = await API.get('/audit-logs');
      setLogs(response.data);
      setFilteredLogs(response.data);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await API.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];
    
    if (selectedUser !== 'all') {
      filtered = filtered.filter(log => log.user_id === parseInt(selectedUser));
    }
    
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.action.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredLogs(filtered);
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : `User #${userId}`;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2">
        ← Back
      </button>

      <h1 className="text-3xl font-bold mb-6">📜 Audit Logs</h1>
      <p className="text-gray-600 mb-6">Track all system activities and user actions</p>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Actions</label>
            <input
              type="text"
              placeholder="Search by action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by User</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="all">All Users</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex justify-between items-center">
          <p className="text-gray-600">Total Logs: <span className="font-bold text-gray-900">{filteredLogs.length}</span></p>
          <button
            onClick={fetchLogs}
            className="text-cyan-600 hover:text-cyan-800 text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">#{log.id}</td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-700">{log.action}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm text-gray-900">{getUserName(log.user_id)}</p>
                      <p className="text-xs text-gray-500">ID: {log.user_id}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-600">
                      {new Date(log.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredLogs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No audit logs found
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;