import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppShell from '../components/AppShell';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import Spinner from '../components/ui/Spinner';
import { deleteUser, getAllUsers, updateUserStatus } from '../api/authApi';

function UserDirectoryPage() {
  const navigate = useNavigate();
  const { category } = useParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const categoryTitle = {
    students: 'Students',
    lecturers: 'Lecturers',
    technicians: 'Technicians',
  }[category];

  const categoryUserType = {
    students: 'STUDENT',
    lecturers: 'LECTURER',
    technicians: null,
  }[category];

  const categoryRole = category === 'technicians' ? 'TECHNICIAN' : 'USER';

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllUsers();
      const filtered =
        category === 'technicians'
          ? data.filter((user) => user.role === 'TECHNICIAN')
          : data.filter((user) => user.userType === categoryUserType);
      setUsers(filtered);
    } catch {
      setUsers([]);
      setError('Unable to load this directory right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [category]);

  const filtered = useMemo(
    () =>
      users.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      ),
    [search, users]
  );

  const handleToggleStatus = async (user) => {
    try {
      setNotice('');
      await updateUserStatus(user.id, { isActive: !user.isActive });
      fetchUsers();
    } catch {
      setError('Unable to update account status right now.');
    }
  };

  const handleDeleteUser = async (user) => {
    const confirmed = window.confirm(
      `Delete ${user.name}? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');
      await deleteUser(user.id);
      setNotice(`${user.name} was deleted successfully.`);
      fetchUsers();
    } catch {
      setError('Unable to delete this account right now.');
    }
  };

  if (!categoryTitle) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3F7F5]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <AppShell user={{ role: 'ADMIN' }} contentClassName="w-full max-w-[1280px] px-6 py-6">
          <PageHeader
            title={categoryTitle + ' directory'}
            subtitle={'Manage and monitor ' + categoryTitle.toLowerCase() + ' accounts.'}
            action={
              <button
                onClick={() => navigate('/users/' + category + '/create')}
                className="rounded-full bg-[#0F6E56] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#085041]"
              >
                + Add {categoryTitle.slice(0, -1)}
              </button>
            }
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              'Search ' + categoryTitle.toLowerCase() + ' by name or email...'
            }
            className="mb-4 w-72 rounded-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
          />

          <div className="overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
            {notice && (
              <div className="border-b border-gray-100 px-5 py-4 text-sm text-[#0F6E56]">
                {notice}
              </div>
            )}
            {error && (
              <div className="border-b border-gray-100 px-5 py-4 text-sm text-[#A32D2D]">
                {error}
              </div>
            )}
            <div className="grid grid-cols-5 border-b border-gray-100 bg-gray-50 px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">
              <span>Name</span>
              <span>Provider</span>
              <span>Approval</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {users.length === 0 ? (
              <EmptyState
                title={'No ' + categoryTitle.toLowerCase() + ' found'}
                subtitle="Create one using the button above."
              />
            ) : filtered.length === 0 ? (
              <EmptyState title="No results found" />
            ) : (
              filtered.map((user) => (
                <div
                  key={user.id}
                  className="grid grid-cols-5 items-center border-b border-gray-50 px-5 py-3.5 transition last:border-0 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={user.name}
                      color={categoryRole === 'TECHNICIAN' ? 'amber' : 'blue'}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    <span
                      className={`mr-2 inline-block h-2 w-2 rounded-full ${
                        user.authProvider === 'GOOGLE'
                          ? 'bg-[#1D9E75]'
                          : 'bg-gray-300'
                      }`}
                    />
                    {user.authProvider === 'GOOGLE' ? 'Google' : 'Local'}
                  </div>

                  <div>
                    <Badge
                      status={user.approvalStatus}
                      label={user.approvalStatus}
                    />
                  </div>

                  <div>
                    <Badge
                      status={user.isActive ? 'ACTIVE' : 'INACTIVE'}
                      label={user.isActive ? 'Active' : 'Inactive'}
                    />
                  </div>

                  <div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={
                          user.isActive
                            ? 'rounded-full border border-[#E24B4A] bg-[#FCEBEB] px-3 py-1.5 text-xs text-[#A32D2D]'
                            : 'rounded-full border border-[#1D9E75] bg-[#E1F5EE] px-3 py-1.5 text-xs text-[#0F6E56]'
                        }
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="rounded-full border border-[#E24B4A] bg-white px-3 py-1.5 text-xs text-[#A32D2D] transition hover:bg-[#FCEBEB]"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
    </AppShell>
  );
}

export default UserDirectoryPage;
