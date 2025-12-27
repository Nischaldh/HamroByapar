import React from "react";
import { assets } from "../assets/assets";
import {Link} from 'react-router-dom'

const Footer = () => {
    const year = new Date().getFullYear();
  return (
    <div>
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm">
        <div>
          <img src={assets.logo} className="mb-5 w-40" />
          <p className="w-full md:w-2/3 text-gray-600">
          HamroByapar – A trusted platform connecting buyers and sellers while ensuring transparent tax oversight by the government.
          </p>
        </div>
        <div>
            <p className="text-xl font-medium mb-5">COMPANY</p>
            <ul className="flex flex-col gap-1 text-gray-600">
                <Link to="/">
                <li>Home</li>
                </Link>
                <Link to='/about'>
                <li>About Us</li>
                </Link>
                <Link to='contact'>
                <li>Contact</li>
                </Link>
            </ul>
        </div>
        <div>
            <p className="text-xl font-medium mb-5">Get in Touch</p>
            <ul className="flex flex-col gap-1 text-gray-600">
                <li>+977 9812345678</li>
                <li>contact@hamrobyapar.com</li>
                <li>Admin Login</li>

            </ul>
        </div>
      </div>
      <div>
        <hr />
        <p className="py-5 text-sm text-center">
            Copyright {year}@ HamroByapar - All Right Reserved
        </p>
      </div>
    </div>
  );
};

export default Footer;