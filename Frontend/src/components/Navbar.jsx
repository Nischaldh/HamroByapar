import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { Link, NavLink } from "react-router-dom";
import { useState } from 'react';
import { ShopContext } from '../context/ShopContext';

const Navbar = () => {

    const [visible, setVisible] = useState(false)

    const {getCartCount, isLoggedIn,setIsLoggedIn, userRole, setUserRole, handleLogout} = useContext(ShopContext)


    return (
        <div className="flex items-center justify-between py-5 font-medium">
            {/* --------LOGO------------ */}
            <Link to='/'>
                <img src={assets.logo} alt="HamroByapar Logo" className="text-xl font-bold w-36" />
            </Link>
            <ul className="hidden sm:flex gap-5 text-sm text-gray-700">
                {/* --------NavBar Links--------- */}
                <NavLink to="/" className="flex flex-col items-center gap-1">
                    <p className="hover:text-gray-500">Home</p>
                    <hr className="w-4/4 border-none h-[1.5px] bg-gray-700 hidden" />
                </NavLink>
                <NavLink to="/products" className="flex flex-col items-center gap-1">
                    <p className="hover:text-gray-500">Products</p>
                    <hr className="w-4/4 border-none h-[1.5px] bg-gray-700 hidden" />
                </NavLink>
                <NavLink to="/about" className="flex flex-col items-center gap-1">
                    <p className="hover:text-gray-500">About Us</p>
                    <hr className="w-4/4 border-none h-[1.5px] bg-gray-700 hidden" />
                </NavLink>
                <NavLink to="/contact" className="flex flex-col items-center gap-1">
                    <p className="hover:text-gray-500">Contact</p>
                    <hr className="w-4/4 border-none h-[1.5px] bg-gray-700 hidden" />
                </NavLink>

            </ul>
            {/* Right Side */}
            <div className='flex items-center gap-6'>
                <Link to='/cart' className='relative'>
                    <img src={assets.cart} alt="Cart" className='w-8 cursor-pointer' />
                    <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]">{getCartCount()}</p>
                </Link>
                {!isLoggedIn ? <NavLink to="/login" className="flex flex-col items-center gap-1">
                    <p className="px-4 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition cursor-pointer">
                        Login
                    </p>

                </NavLink> :
                    (<div className='group relative'>

                        <img src={assets.profile} alt="Profile" className='w-8 cursor-pointer' />
                        {/* ------Drop Down Menu-------- */}
                        <div className="group-hover:block hidden absolute dropdown-menu right-0 pt-4">
                            <div className="flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded">
                                <Link to='/profile'>
                                    <p className="cursor-pointer hover:text-black">My Profile</p>
                                </Link>
                                {userRole==='buyer' ?
                                    <Link to='/orders'>
                                        <p className="cursor-pointer hover:text-black">Orders</p>
                                    </Link>: null
                                }
                                <p className="cursor-pointer hover:text-black" onClick={handleLogout}>
                                    Log Out
                                </p>
                            </div>
                        </div>
                    </div>)}
                <img onClick={() => setVisible(true)} src={assets.menu} className='w-6 mt-1 cursor-pointer sm:hidden' alt="" />

            </div>
            {/* ---------Sidebar Menu for Mobile------ */}
            <div className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${visible ? 'w-full' : 'w-0'}`}>
                <div className="flex flex-col text-gray-600">
                    <div
                        className="flex items-center gap-4 p-3 cursor-pointer"
                        onClick={() => setVisible(false)}
                    >
                        <img src={assets.close} className="h-4 rotate-180" alt="" />
                        <p>Back</p>
                    </div>
                    <NavLink
                        onClick={() => setVisible(false)}
                        className="py-2 pl-6 border"
                        to="/"
                    >
                        Home
                    </NavLink>
                    <NavLink
                        onClick={() => setVisible(false)}
                        className="py-2 pl-6 border"
                        to="/products"
                    >
                        Products
                    </NavLink>
                    <NavLink
                        onClick={() => setVisible(false)}
                        className="py-2 pl-6 border"
                        to="/about"
                    >
                        About
                    </NavLink>
                    <NavLink
                        onClick={() => setVisible(false)}
                        className="py-2 pl-6 border"
                        to="/contact"
                    >
                        Contact
                    </NavLink>
                </div>

            </div>

        </div>
    )
}

export default Navbar
