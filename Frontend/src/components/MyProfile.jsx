import React, { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const MyProfile = () => {
  const { userEmail, userName, setUserName, setUserEmail, token, backendUrl } = useContext(ShopContext);
  
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const response = await axios.patch(
        `${backendUrl}/api/user/update`, 
        { newName: userName, newEmail: userEmail, newPassword: password },  // Fix field names
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to update profile.");
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-4 text-center">Profile</h2>
      
      <div className="mb-4">
        <label className="block font-medium">Name</label>
        <input 
          type="text" 
          value={userName} 
          onChange={(e) => setUserName(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium">Email</label>
        <input 
          type="email" 
          value={userEmail} 
          onChange={(e) => setUserEmail(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium">Password</label>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <button 
        className="bg-black text-white px-4 py-2"
        onClick={handleUpdate}
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
};

export default MyProfile;
