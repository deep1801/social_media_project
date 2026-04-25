import { useAuth } from '../context/AuthContext';
import { Mail, Calendar, Users } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="card">
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold mb-4">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
          
          <div className="flex items-center space-x-2 text-gray-600 mb-4">
            <Mail size={18} />
            <span>{user.email}</span>
          </div>

          {user.bio && (
            <p className="text-gray-700 max-w-2xl mb-6">{user.bio}</p>
          )}

          <div className="flex items-center space-x-8 mt-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-gray-600">
                <Users size={18} />
                <span className="text-2xl font-bold text-gray-900">
                  {user.followers?.length || 0}
                </span>
              </div>
              <p className="text-sm text-gray-600">Followers</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-gray-600">
                <Users size={18} />
                <span className="text-2xl font-bold text-gray-900">
                  {user.following?.length || 0}
                </span>
              </div>
              <p className="text-sm text-gray-600">Following</p>
            </div>
          </div>

          {user.createdAt && (
            <div className="flex items-center space-x-2 text-gray-500 text-sm mt-6">
              <Calendar size={16} />
              <span>Joined {new Date(user.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long' 
              })}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Posts</h2>
        <div className="card text-center py-12">
          <p className="text-gray-500">Your posts will appear here</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
