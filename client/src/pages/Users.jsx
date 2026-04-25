import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Link } from 'react-router-dom';
import { UserPlus, UserMinus, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get('/api/v1/users');
      // Filter out current user - convert both to string for comparison
      const filteredUsers = res.data.data.filter((u) => {
        const userId = u._id?.toString() || u._id;
        const currentUserId = user._id?.toString() || user._id;
        return userId !== currentUserId;
      });
      console.log('Current user ID:', user._id);
      console.log('Filtered users:', filteredUsers.length, 'out of', res.data.data.length);
      setUsers(filteredUsers);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    try {
      await axiosInstance.put(`/api/v1/users/${userId}/follow`);
      fetchUsers();
    } catch (err) {
      console.error('Failed to follow user:', err);
      alert(err.response?.data?.error || 'Failed to follow user');
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await axiosInstance.put(`/api/v1/users/${userId}/unfollow`);
      fetchUsers();
    } catch (err) {
      console.error('Failed to unfollow user:', err);
      alert(err.response?.data?.error || 'Failed to unfollow user');
    }
  };

  const isFollowing = (targetUser) => {
    return targetUser.followers?.includes(user._id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Discover People</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {users.map((targetUser) => (
          <div key={targetUser._id} className="card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {targetUser.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/user/${targetUser._id}`}
                    className="font-semibold text-lg text-gray-900 hover:text-blue-600 block truncate"
                  >
                    {targetUser.name}
                  </Link>
                  <p className="text-sm text-gray-600">
                    {targetUser.followers?.length || 0} followers
                  </p>
                  {targetUser.bio && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{targetUser.bio}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
                <Link
                  to={`/messages/${targetUser._id}`}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Send Message"
                >
                  <MessageCircle size={20} />
                </Link>

                {targetUser._id.toString() === user._id.toString() ? (
                  <span className="text-sm text-gray-500 px-3 py-2 whitespace-nowrap">You</span>
                ) : isFollowing(targetUser) ? (
                  <button
                    onClick={() => handleUnfollow(targetUser._id)}
                    className="flex items-center space-x-1 px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm whitespace-nowrap"
                  >
                    <UserMinus size={16} />
                    <span>Unfollow</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleFollow(targetUser._id)}
                    className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm whitespace-nowrap"
                  >
                    <UserPlus size={16} />
                    <span>Follow</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {users.length === 0 && (
          <div className="col-span-2 card text-center py-12">
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
