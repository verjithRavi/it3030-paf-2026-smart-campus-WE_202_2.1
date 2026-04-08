import { useEffect, useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import Navbar from '../components/Navbar';
import Spinner from '../components/ui/Spinner';
import PageHeader from '../components/ui/PageHeader';
import { INPUT_CLASS, PRIMARY_BTN } from '../constants/theme';
import { getCurrentUser, updateCurrentUserProfile } from '../api/authApi';

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    name: '',
    phoneNumber: '',
    department: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setMessage('');

      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setForm({
          name: currentUser.name || '',
          phoneNumber: currentUser.phoneNumber || '',
          department: currentUser.department || '',
        });
      } catch {
        setMessage('Unable to load your profile right now.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const updatedUser = await updateCurrentUserProfile({
        name: form.name,
        phoneNumber: form.phoneNumber || null,
        department: form.department || null,
      });

      setUser(updatedUser);
      setForm({
        name: updatedUser.name || '',
        phoneNumber: updatedUser.phoneNumber || '',
        department: updatedUser.department || '',
      });
      setMessage('Profile updated successfully.');
    } catch {
      setMessage('Unable to update your profile right now.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        {user?.role === 'ADMIN' && <AdminSidebar />}
        <div className="flex flex-1 flex-col">
          <Navbar />
          <div className="flex min-h-[calc(100vh-61px)] items-center justify-center">
            <Spinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {user?.role === 'ADMIN' && <AdminSidebar />}
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="max-w-4xl flex-1 px-6 py-6">
          <PageHeader
            title="Edit profile"
            subtitle="Update your personal account details."
          />

          <section className="rounded-2xl border border-gray-100 bg-white p-5">
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              <input
                type="text"
                placeholder="Full name"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className={INPUT_CLASS}
              />
              <input
                type="text"
                placeholder="Phone number"
                value={form.phoneNumber}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, phoneNumber: e.target.value }))
                }
                className={INPUT_CLASS}
              />
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="Department"
                  value={form.department}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, department: e.target.value }))
                  }
                  className={INPUT_CLASS}
                />
              </div>

              {message && (
                <div className="md:col-span-2">
                  <p
                    className={`text-sm ${
                      message.includes('successfully')
                        ? 'text-[#0F6E56]'
                        : 'text-[#A32D2D]'
                    }`}
                  >
                    {message}
                  </p>
                </div>
              )}

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className={`${PRIMARY_BTN} flex w-auto items-center justify-center gap-2 px-5`}
                >
                  {saving ? <Spinner size="sm" /> : 'Save profile'}
                </button>
              </div>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}

export default ProfilePage;
