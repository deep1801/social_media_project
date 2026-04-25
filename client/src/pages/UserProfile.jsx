import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { Mail, Calendar, Users as UsersIcon, UserPlus, UserMinus, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const { user } = useAuth();

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const res = await axiosInstance.get(`/api/v1/users/${id}`);
      setProfileUser(res.data.data);
    } catch (err) {
      console.error('Failed to load user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      await axiosInstance.put(`/api/v1/users/${id}/follow`);
      fetchUser();
    } catch (err) {
      console.error('Failed to follow user:', err);
      alert(err.response?.data?.error || 'Failed to follow user');
    }
  };

  const handleUnfollow = async () => {
    try {
      await axiosInstance.put(`/api/v1/users/${id}/unfollow`);
      fetchUser();
    } catch (err) {
      console.error('Failed to unfollow user:', err);
      alert(err.response?.data?.error || 'Failed to unfollow user');
    }
  };

  const isFollowing = () => {
    return profileUser?.followers?.some((follower) => follower._id === user._id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card text-center py-12">
          <p className="text-gray-500">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="card">
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold mb-4">
            {profileUser.name?.charAt(0).toUpperCase()}
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{profileUser.name}</h1>
          
          <div className="flex items-center space-x-2 text-gray-600 mb-4">
            <Mail size={18} />
            <span>{profileUser.email}</span>
          </div>

          {profileUser.bio && (
            <p className="text-gray-700 max-w-2xl mb-6">{profileUser.bio}</p>
          )}

          {user._id.toString() !== profileUser._id.toString() ? (
            <div className="flex items-center space-x-3 mb-6">
              <Link
                to={`/messages/${profileUser._id}`}
                className="flex items-center space-x-2 btn-secondary"
              >
                <MessageCircle size={18} />
                <span>Message</span>
              </Link>

              {isFollowing() ? (
                <button
                  onClick={handleUnfollow}
                  className="flex items-center space-x-2 btn-secondary"
                >
                  <UserMinus size={18} />
                  <span>Unfollow</span>
                </button>
              ) : (
                <button
                  onClick={handleFollow}
                  className="flex items-center space-x-2 btn-primary"
                >
                  <UserPlus size={18} />
                  <span>Follow</span>
                </button>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 mb-6">This is your profile</p>
          )}

          <div className="flex items-center space-x-8 mt-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-gray-600">
                <UsersIcon size={18} />
                <span className="text-2xl font-bold text-gray-900">
                  {profileUser.followers?.length || 0}
                </span>
              </div>
              <p className="text-sm text-gray-600">Followers</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-gray-600">
                <UsersIcon size={18} />
                <span className="text-2xl font-bold text-gray-900">
                  {profileUser.following?.length || 0}
                </span>
              </div>
              <p className="text-sm text-gray-600">Following</p>
            </div>
          </div>

          {profileUser.createdAt && (
            <div className="flex items-center space-x-2 text-gray-500 text-sm mt-6">
              <Calendar size={16} />
              <span>Joined {new Date(profileUser.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long' 
              })}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
