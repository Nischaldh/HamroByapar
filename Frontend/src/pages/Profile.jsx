import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext';
import MyProfile from '../components/MyProfile'
import AddProducts from "../components/AddProducts";
import Taxation from "../components/Taxation";
import SellerOrders from "../components/SellerOrders";
import MyProducts from '../components/MyProducts';


const Profile = () => {
  const { userRole, userName, userEmail, setUserName, setUserEmail } = useContext(ShopContext);
  const [selectedTab, setSelectedTab] = useState("Profile");

  const tabClasses = (tabName) =>
    `flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-1 cursor-pointer ${selectedTab === tabName ? "bg-gray-200 text-white" : "hover:bg-gray-200"
    }`;

  return (
    <div className='w-full flex border-t-2'>

      {/* ----------Left Sidebar---------- */}
      <div className='w-[18%] min-h-screen border-r-2'>
        <div className='flex flex-col gap-4 pt-6 pl-[20%] text-[15px]'>
          <div className={tabClasses("Profile")} onClick={() => setSelectedTab("Profile")}>
            <img className='w-5 h-5' src={assets.profile} alt="Profile Icon" />
            <p className='hidden md:block'>Profile</p>
          </div>

          {userRole === "seller" && (
            <>
             <div className={tabClasses("MyProducts")} onClick={() => setSelectedTab("MyProducts")}>
                <img className='w-5 h-5' src={assets.add} alt="Add Products Icon" />
                <p className='hidden md:block'>My Products</p>
              </div>

              <div className={tabClasses("AddProducts")} onClick={() => setSelectedTab("AddProducts")}>
                <img className='w-5 h-5' src={assets.add} alt="Add Products Icon" />
                <p className='hidden md:block'>Add Products</p>
              </div>

              <div className={tabClasses("Taxation")} onClick={() => setSelectedTab("Taxation")}>
                <img className='w-5 h-5' src={assets.tax} alt="Tax Icon" />
                <p className='hidden md:block'>Tax</p>
              </div>
              <div className={tabClasses("Orders")} onClick={() => setSelectedTab("Orders")}>
                <img className='w-5 h-5' src={assets.order_icon} alt="Orders Icon" />
                <p className='hidden md:block'>Orders</p>
              </div>
            </>
          )}

        </div>
      </div>

      {/* ----------Right Content Area---------- */}
      <div className='w-[70%] mx-auto ml-[max(5vw, 25px)] my-8 text-gray-600 text-base'>
        {selectedTab === "Profile" && <MyProfile />}
        {selectedTab === "MyProducts" && userRole === "seller" && <MyProducts />}
        {selectedTab === "AddProducts" && userRole === "seller" && <AddProducts />}
        {selectedTab === "Taxation" && userRole === "seller" && <Taxation />}
        {selectedTab === "Orders" && userRole === "seller" && <SellerOrders />}
      </div>

    </div>
  )
}

export default Profile;
