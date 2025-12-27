import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";

const ListUsers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const token = localStorage.getItem("token"); // Token fetched from localStorage
        if (!token) {
          console.log("No token found in localStorage");
          return;
        }
    
        const res = await axios.get(`${backendUrl}/api/admin/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(res)
        setSellers(res.data.result);
        
        console.log(sellers)
      } catch (error) {
        console.error("Failed to fetch sellers:", error);
      } finally {
        setLoading(false);
      }
    };
    

    fetchSellers();
  }, []);
  if (loading) return <p className="p-4">Loading sellers...</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Seller List</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm text-left">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Tax Paid</th>
              <th className="p-2">Tax Due</th>
            </tr>
          </thead>
          <tbody>
            {sellers.length > 0 ? (
              sellers.map((seller) => (
                <tr key={seller.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{seller.name}</td>
                  <td className="p-2">{seller.email}</td>
                  <td className="p-2">Rs. {Number(seller.total_tax_paid).toFixed(2)}</td>
                  <td className="p-2">Rs. {Number(seller.tax_due).toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-4 text-center">
                  No sellers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ListUsers
