import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";

const Tax = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token"); // Token fetched from localStorage
        if (!token) {
          console.log("No token found in localStorage");
          return;
        }
    
        const res = await axios.get(`${backendUrl}/api/admin/tax-summary`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(res.data);
    
        setOrders(res.data.result);
        
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <p className="p-4">Loading orders...</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Order List</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm text-left">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-2">Order ID</th>
              <th className="p-2">Buyer Name</th>
              <th className="p-2">Total Amount</th>
              <th className="p-2">Total Tax</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.order_id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{order.order_id}</td>
                  <td className="p-2">{order.buyer_name}</td>
                  <td className="p-2">Rs. {Number(order.total_amount).toFixed(2)}</td>
                  <td className="p-2">Rs. {Number(order.total_tax).toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-4 text-center">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Tax;
