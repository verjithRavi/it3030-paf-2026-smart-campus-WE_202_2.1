import { useEffect, useMemo, useState } from 'react';
import AppShell from '../components/AppShell';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import Spinner from '../components/ui/Spinner';
import {
  getAllUsers,
  updateApprovalStatus,
  updateUserRole,
} from '../api/authApi';
import { timeAgo } from '../utils/time';

const TABS = ['ALL', 'STUDENTS', 'LECTURERS', 'TECHNICIANS'];

function PendingApprovalsPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllUsers();
      const pendingUsers = data.filter(
        (user) =>
          user.approvalStatus === 'PENDING' &&
          (
            user.requestedUserType !== null ||
            user.userType !== null ||
            user.role === 'TECHNICIAN'
          )
      );
      setUsers(pendingUsers);
    } catch {
      setUsers([]);
      setError('Unable to load pending approvals right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(timeout);
  }, [toast]);

  const filteredUsers = useMemo(() => {
    if (activeTab === 'ALL') return users;
    if (activeTab === 'STUDENTS') {
      return users.filter(
        (user) =>
          user.requestedUserType === 'STUDENT' || user.userType === 'STUDENT'
      );
    }
    if (activeTab === 'LECTURERS') {
      return users.filter(
        (user) =>
          user.requestedUserType === 'LECTURER' || user.userType === 'LECTURER'
      );
    }
    return users.filter(
      (user) => user.role === 'TECHNICIAN' && user.approvalStatus === 'PENDING'
    );
  }, [activeTab, users]);

  const counts = {
    ALL: users.length,
    STUDENTS: users.filter(
      (user) =>
        user.requestedUserType === 'STUDENT' || user.userType === 'STUDENT'
    ).length,
    LECTURERS: users.filter(
      (user) =>
        user.requestedUserType === 'LECTURER' || user.userType === 'LECTURER'
    ).length,
    TECHNICIANS: users.filter(
      (user) => user.role === 'TECHNICIAN' && user.approvalStatus === 'PENDING'
    ).length,
  };

  const handleApprove = async (user) => {
    try {
      const approvedUserType = user.requestedUserType || user.userType;

      if (approvedUserType) {
        await updateUserRole(user.id, {
          role: 'USER',
          userType: approvedUserType,
          approvalStatus: 'APPROVED',
        });
      } else {
        await updateApprovalStatus(user.id, { approvalStatus: 'APPROVED' });
      }

      await fetchUsers();
      setToast('Approval updated successfully.');
    } catch {
      setError('Unable to approve this request right now.');
    }
  };

  const handleReject = async (user) => {
    try {
      await updateApprovalStatus(user.id, {
        approvalStatus: 'REJECTED',
        reason: rejectReason,
      });
      await fetchUsers();
      setRejectingId(null);
      setRejectReason('');
      setToast('Request rejected successfully.');
    } catch {
      setError('Unable to reject this request right now.');
    }
  };

  const getAvatarColor = (user) => {
    if ((user.requestedUserType || user.userType) === 'LECTURER') return 'purple';
    if ((user.requestedUserType || user.userType) === 'STUDENT') return 'blue';
    if (user.role === 'TECHNICIAN') return 'amber';
    return 'green';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3F7F5]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <AppShell user={{ role: 'ADMIN' }} contentClassName="w-full max-w-[1200px] px-6 py-6">
          <PageHeader
            title="Pending approvals"
            subtitle="Review and manage user access requests."
          />

          {toast && (
            <div className="mb-4 rounded-2xl border border-[#1D9E75] bg-[#E1F5EE] px-4 py-3 text-sm text-[#0F6E56]">
              {toast}
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-2xl border border-[#E24B4A] bg-[#FCEBEB] px-4 py-3 text-sm text-[#A32D2D]">
              {error}
            </div>
          )}

          <div className="mb-5 flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={
                  activeTab === tab
                    ? 'rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm'
                    : 'rounded-full px-4 py-2 text-sm text-gray-400 transition hover:text-gray-600'
                }
              >
                {tab} ({counts[tab]})
              </button>
            ))}
          </div>

          <div className="overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
            <div className="grid grid-cols-4 border-b border-gray-100 bg-gray-50 px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">
              <span>User</span>
              <span>Requested role</span>
              <span>Registered</span>
              <span>Actions</span>
            </div>

            {filteredUsers.length === 0 ? (
              <EmptyState
                title="No pending approvals"
                subtitle="All requests have been reviewed."
              />
            ) : (
              filteredUsers.map((user) => (
                <div key={user.id} className="border-b border-gray-50 last:border-0">
                  <div className="grid grid-cols-4 items-center gap-4 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} color={getAvatarColor(user)} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>

                    <div>
                      <Badge
                        status={user.requestedUserType || user.userType || user.role}
                        label={user.requestedUserType || user.userType || user.role}
                      />
                    </div>

                    <div className="text-xs text-gray-400">
                      {timeAgo(user.createdAt)}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(user)}
                        className="rounded-full border border-[#1D9E75] bg-[#E1F5EE] px-3 py-1.5 text-xs text-[#0F6E56] transition hover:bg-[#1D9E75] hover:text-white"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setRejectingId(user.id);
                          setRejectReason('');
                        }}
                        className="rounded-full border border-[#E24B4A] bg-[#FCEBEB] px-3 py-1.5 text-xs text-[#A32D2D] transition hover:bg-[#E24B4A] hover:text-white"
                      >
                        Reject
                      </button>
                    </div>
                  </div>

                  {rejectingId === user.id && (
                    <div className="flex items-center gap-3 border-b border-gray-100 bg-[#FFFBF5] px-5 py-3">
                      <input
                        placeholder="Reason for rejection..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="flex-1 rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                      />
                      <button
                        onClick={() => handleReject(user)}
                        className="rounded-full bg-[#E24B4A] px-4 py-2 text-sm text-white"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => {
                          setRejectingId(null);
                          setRejectReason('');
                        }}
                        className="rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
    </AppShell>
  );
}

export default PendingApprovalsPage;
