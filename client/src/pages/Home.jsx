import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import PostCard from "../components/PostCard";
import CreatePost from "../components/CreatePost";

const Home = () => {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    const res = await axiosInstance.get("/api/v1/posts");
    setPosts(res.data.data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const addPost = (post) => setPosts([post, ...posts]);
  const deletePost = (id) => setPosts(posts.filter((p) => p._id !== id));
  const updatePost = (updated) =>
    setPosts(posts.map((p) => (p._id === updated._id ? updated : p)));

  return (
    <div className="bg-gray-50 min-h-screen py-6">
      <div className="max-w-2xl mx-auto px-4 space-y-6">
        {/* CREATE POST */}
        <CreatePost onPostCreated={addPost} />

        {/* POSTS */}
        {posts.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">No posts yet 😢</div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onDelete={deletePost}
              onUpdate={updatePost}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Home;
