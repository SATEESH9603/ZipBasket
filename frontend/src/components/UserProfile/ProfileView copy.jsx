// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom'; // <-- Add this import
// import './ProfileView.css';

// export default function ProfileView({ user, token, onUpdateProfile, handleLogout }) {
//   const [activeTab, setActiveTab] = useState('personal'); // tabs: personal | security | preferences
//   const [form, setForm] = useState({
//     firstName: user?.firstName || '',
//     lastName: user?.lastName || '',
//     email: user?.email || '',
//     username: user?.username || '',
//     profileImage: user?.profileImage || null,
//   });
//   const [imagePreview, setImagePreview] = useState(user?.profileImage || '');
//   const [loading, setLoading] = useState(false);

//   // Handle input changes
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   // Handle profile image
//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onloadend = () => {
//       setForm((prev) => ({ ...prev, profileImage: reader.result }));
//       setImagePreview(reader.result);
//     };
//     reader.readAsDataURL(file);
//   };

//   // Submit profile updates
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       await onUpdateProfile(form);
//       alert('Profile updated!');
//     } catch (err) {
//       alert('Error: ' + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };
//   const navigate = useNavigate(); // <-- Add this line

//   return (
//     <div className="profile-page">
//       {/* LEFT SIDEBAR */}
//       <aside className="profile-sidebar">
//         <div className="profile-image-wrapper">
//           <img
//             src={imagePreview || '/default-avatar.png'}
//             alt="Profile"
//             className="profile-image"
//           />
//           <label className="upload-label">
//             Change Photo
//             <input type="file" accept="image/*" onChange={handleImageChange} hidden />
//           </label>
//         </div>
//         <div className="quick-actions">
//           <button
//             onClick={() => {
//               handleLogout();       // call logout function from props
//               navigate('/'); // redirect to login page
//             }}>
//             Logout
//           </button>

//           <button onClick={() => navigate('/dashboard')}>Dashboard</button>
//         </div>
//       </aside>

//       {/* MAIN CONTENT */}
//       <main className="profile-main">
//         <h2>Account Settings</h2>

//         {/* TABS */}
//         <div className="profile-tabs">
//           <button
//             className={activeTab === 'personal' ? 'active' : ''}
//             onClick={() => setActiveTab('personal')}
//           >
//             Personal Info
//           </button>
//           <button
//             className={activeTab === 'security' ? 'active' : ''}
//             onClick={() => setActiveTab('security')}
//           >
//             Security
//           </button>
//           <button
//             className={activeTab === 'preferences' ? 'active' : ''}
//             onClick={() => setActiveTab('preferences')}
//           >
//             Preferences
//           </button>
//         </div>

//         {/* TAB CONTENTS */}
//         {activeTab === 'personal' && (
//           <form className="profile-form" onSubmit={handleSubmit}>
//             <div className="name-fields">
//               <div>
//                 <label>First Name</label>
//                 <input
//                   type="text"
//                   name="firstName"
//                   value={form.firstName}
//                   onChange={handleChange}
//                   required
//                 />
//               </div>
//               <div>
//                 <label>Last Name</label>
//                 <input
//                   type="text"
//                   name="lastName"
//                   value={form.lastName}
//                   onChange={handleChange}
//                   required
//                 />
//               </div>
//             </div>

//             <label>Email</label>
//             <input
//               type="email"
//               name="email"
//               value={form.email}
//               onChange={handleChange}
//               required
//             />

//             <label>Username</label>
//             <input type="text" name="username" value={form.username} disabled />

//             <button type="submit" disabled={loading}>
//               {loading ? 'Saving...' : 'Save Changes'}
//             </button>
//           </form>
//         )}

//         {activeTab === 'security' && (
//           <div className="password-section">
//             <h3>Change Password</h3>
//             <button
//               className="update-password-btn"
//               onClick={() => navigate('/reset-password', { state: { token }})}
//             >
//               Reset Password
//             </button>
//           </div>
//         )}

//         {activeTab === 'preferences' && (
//           <div className="preferences-section">
//             <h3>Preferences</h3>
//             <label>
//               <input type="checkbox" /> Enable dark mode
//             </label>
//             <label>
//               <input type="checkbox" /> Receive email notifications
//             </label>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }
