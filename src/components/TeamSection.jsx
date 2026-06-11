// src/components/TeamSection.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import ImageUpload from './ImageUpload';

// Default team data
const defaultTeamMembers = [
  {
    id: 1,
    name: "Joshua Mohamed Katibi Yaffa",
    role: "Lead Developer & Project Manager",
    bio: "Full-stack developer specializing in healthcare systems. Leads the technical architecture and ensures seamless integration of all modules.",
    icon: "👨‍💻",
    color: "from-cyan-600 to-blue-600",
    image: null
  },
  {
    id: 2,
    name: "Alhaji Tanu Jalloh",
    role: "Backend Developer & Database Architect",
    bio: "Expert in API development and database design. Responsible for the robust backend infrastructure and data management.",
    icon: "🔧",
    color: "from-blue-600 to-indigo-600",
    image: null
  },
  {
    id: 3,
    name: "Asyisha J Bockarie",
    role: "Frontend Developer & UI/UX Designer",
    bio: "Creates beautiful and intuitive user interfaces. Ensures exceptional user experience across all platforms.",
    icon: "🎨",
    color: "from-purple-600 to-pink-600",
    image: null
  }
];

const TeamSection = () => {
  const { user, hasRole } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);
  const [editingMember, setEditingMember] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadTeamMembers();
    setIsAdmin(hasRole('admin'));
  }, []);

  const loadTeamMembers = () => {
    // Load from localStorage or use default
    const savedTeam = localStorage.getItem('teamMembers');
    if (savedTeam) {
      setTeamMembers(JSON.parse(savedTeam));
    } else {
      setTeamMembers(defaultTeamMembers);
    }
  };

  const saveTeamMembers = (members) => {
    localStorage.setItem('teamMembers', JSON.stringify(members));
    setTeamMembers(members);
  };

  const handleEditMember = (member) => {
    setEditingMember({ ...member });
    setShowEditModal(true);
  };

  const handleImageUpload = (imageUrl) => {
    setEditingMember({ ...editingMember, image: imageUrl });
  };

  const handleSaveMember = () => {
    const updatedMembers = teamMembers.map(m => 
      m.id === editingMember.id ? editingMember : m
    );
    saveTeamMembers(updatedMembers);
    setShowEditModal(false);
    toast.success('Team member updated successfully!');
  };

  const handleResetToDefault = () => {
    if (window.confirm('Reset all team member images to default?')) {
      saveTeamMembers(defaultTeamMembers);
      toast.success('Team members reset to default!');
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block bg-cyan-100 rounded-full px-4 py-1 mb-4">
            <span className="text-sm font-semibold text-cyan-700">The Team Behind This Project</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Meet Our Dedicated Team
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Passionate developers and healthcare enthusiasts committed to improving healthcare access in Sierra Leone
          </p>
          
          {/* Admin Controls */}
          {isAdmin && (
            <div className="mt-4">
              <button
                onClick={handleResetToDefault}
                className="text-sm text-gray-500 hover:text-cyan-600 underline"
              >
                Reset to Default Images
              </button>
            </div>
          )}
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {teamMembers.map((member) => (
            <div 
              key={member.id} 
              className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-2 duration-300 group"
            >
              <div className={`bg-gradient-to-r ${member.color} p-6 text-white text-center relative`}>
                {/* Profile Image */}
                <div className="relative inline-block">
                  {member.image ? (
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg mx-auto"
                    />
                  ) : (
                    <div className="w-28 h-28 bg-white bg-opacity-30 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-5xl">{member.icon}</span>
                    </div>
                  )}
                  
                  {/* Edit Button for Admin */}
                  {isAdmin && (
                    <button
                      onClick={() => handleEditMember(member)}
                      className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition"
                    >
                      <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  )}
                </div>
                
                <h3 className="text-xl font-bold mt-4">{member.name}</h3>
                <p className="text-sm opacity-90 mt-1">{member.role}</p>
              </div>
              <div className="p-6">
                <p className="text-gray-600 text-sm leading-relaxed">
                  {member.bio}
                </p>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-center space-x-3">
                    <a href="#" className="text-gray-400 hover:text-cyan-600 transition">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.682-.103-.253-.447-1.27.098-2.646 0 0 .84-.269 2.75 1.025.8-.223 1.65-.334 2.5-.334.85 0 1.7.111 2.5.334 1.91-1.294 2.75-1.025 2.75-1.025.545 1.376.201 2.393.099 2.646.64.698 1.03 1.591 1.03 2.682 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                      </svg>
                    </a>
                    <a href="#" className="text-gray-400 hover:text-cyan-600 transition">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.162 5.656a8.384 8.384 0 0 1-2.402.658 4.196 4.196 0 0 0 1.84-2.318c-.808.48-1.704.83-2.657 1.017a4.182 4.182 0 0 0-7.124 3.814 11.874 11.874 0 0 1-8.62-4.37 4.168 4.168 0 0 0-.566 2.103c0 1.45.738 2.731 1.86 3.48a4.168 4.168 0 0 1-1.894-.523v.052a4.185 4.185 0 0 0 3.355 4.101 4.21 4.21 0 0 1-1.89.072 4.185 4.185 0 0 0 3.906 2.904 8.393 8.393 0 0 1-6.19 1.732 11.848 11.848 0 0 0 6.408 1.88c7.693 0 11.9-6.373 11.9-11.9 0-.18-.004-.362-.012-.54a8.497 8.497 0 0 0 2.086-2.164z"/>
                      </svg>
                    </a>
                    <a href="#" className="text-gray-400 hover:text-cyan-600 transition">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Edit Team Member</h2>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                <ImageUpload 
                  currentImage={editingMember.image}
                  onImageUpload={handleImageUpload}
                  label="Team Member Photo"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={editingMember.name}
                  onChange={(e) => setEditingMember({...editingMember, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <input
                  type="text"
                  value={editingMember.role}
                  onChange={(e) => setEditingMember({...editingMember, role: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  rows="3"
                  value={editingMember.bio}
                  onChange={(e) => setEditingMember({...editingMember, bio: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMember}
                  className="flex-1 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default TeamSection;