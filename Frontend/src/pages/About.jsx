import React from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets.js";

const About = () => {
    return (
        <div>
            <div className="text-2xl text-center pt-8 border-t">
                <Title text1={"ABOUT"} text2={"US"} />
            </div>
            <div className="my-10 flex flex-col md:flex-row gap-16">
                <img src={assets.about} className="w-full md:max-w-[700px]" />
                <div className="flex flex-col justify-center gap-6 md:w-2/4 text-gray-600">
                    <h2 className="text-2xl font-semibold">Introduction</h2>
                    <p>
                        HamroByapar is a digital marketplace designed to connect buyers and sellers while ensuring transparent tax management. We aim to simplify commerce and promote efficient tax compliance.
                    </p>
                    <h2 className="text-2xl font-semibold">Our Mission & Vision</h2>

                    <p>
                        <strong>Mission:</strong> To create a seamless and transparent marketplace for businesses and consumers.
                    </p>
                    <p>
                        <strong>Vision:</strong> To be a trusted platform that promotes efficient transactions and tax compliance.
                    </p>
                    <h2 className="text-2xl font-semibold">How It Works</h2>
                    <p>
                        At HamroByapar, there are three main roles:
                    </p>
                    <ul className="list-disc pl-6">
                        <li><strong>Buyers:</strong> Browse and purchase items easily.</li>
                        <li><strong>Sellers:</strong> List items and manage sales.</li>
                        <li><strong>Government (Admin):</strong> Oversee tax compliance and user management.</li>
                    </ul>

                </div>
            </div>
            <div className="text-xl py-4">
                <Title text1={"WHY"} text2={"CHOOSE US"} />

            </div>
            <div className="flex flex-col md:flex-row text-sm mb-20">
                <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
                    <b>Secure transactions</b>
                    <p className="text-gray-600">We provide secure transactions</p>

                </div>
                <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
                    <b>Easy tax compliance</b>
                    <p className="text-gray-600">With our platform you can easily file taxes.</p>
                </div>
                <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
                    <b>Trusted by businesses</b>
                    <p className="text-gray-600">We are trusted by business around the world.</p>

                </div>
                <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
                    <b>User-friendly interface</b>
                    <p className="text-gray-600">We have easy User Interface for simplicity</p>

                </div>
            </div>

        </div>
    );
};

export default About;
