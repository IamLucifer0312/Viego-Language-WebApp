'use client'
import React, { useState } from "react"
import Link from "next/link";
import Favorite from "@/components/Favorite";
import History from "./History";
import NavBar from "@/components/NavBar";
import { usePathname, useRouter } from "next/navigation";
import ToggleSwitch from "@/components/ToggleSwitch";
import { useAuth } from "@/context/AuthContext";

function Header() {
    const { removeAuth, member } = useAuth();
    const [isOpenHistory, setIsOpenHistory] = useState(false);
    const [isOpenFavorite, setIsOpenFavorite] = useState(false);
    const [isOpenProfile, setIsOpenProfile] = useState(false);
    const [isOpenSetting, setIsOpenSetting] = useState(false);
    const [isOpenMenu, setIsOpenMenu] = useState(false)

    const [isEnglish, setIsEnglish] = useState(true);
    const router = useRouter()

    const toggleLanguage = () => {
        setIsEnglish(!isEnglish);
        // Add logic to switch language here (e.g., using i18next)
    };

    const handleToggleState = (setState, state) => {
        setIsOpenHistory(false);
        setIsOpenFavorite(false);
        setIsOpenSetting(false);
        setIsOpenProfile(false);
        setState(!state);
    }

    return (
        <>
            <div className='bg-pink text-center h-18 border-b-1 border-white flex flex-row items-center justify-center'>
                {/*menu icon*/}
                <div className={`basis-1/3 items-start justify-start h-full w-4 left-0 pr-5`}>
                    <div className={`block h-full justify-start items-start w-16 left-0 hover:bg-orange ${isOpenMenu ? 'bg-orange' : ' '} `}>
                        <div
                            onClick={() => setIsOpenMenu(!isOpenMenu)}
                            className={`md:hidden flex px-5 items-start justify-start `}
                        >
                            <img src='/Menu.svg' alt={'Menu'} className={'h-16 w-10'} />
                        </div>
                    </div>
                </div>

                {/*app logo*/}
                <div className='basis-1/3 flex items-center justify-center'>
                    <Link href="/home">
                        <img src='/vietgo_logo.svg' alt={'vietgo-logo'} className={'h-16 w-16 min-h-12 min-w-8'} />
                    </Link>
                </div>
                {/*right panel*/}
                <div className='basis-1/3 flex items-center justify-end'>
                    <div className='flex items-center justify-end pr-5 md:mx-2 h-full'>
                        <button
                            onClick={() => handleToggleState(setIsOpenHistory, isOpenHistory)}
                            className={`hover:bg-orange md:px-5 px-1 ${isOpenHistory ? 'bg-orange' : ''}`}>
                            <img src='/History.svg' alt="History Icon" className='h-16 w-10 min-h-10 min-w-6' />
                        </button>
                        {/* Conditionally render History */}

                        <button
                            onClick={() => handleToggleState(setIsOpenFavorite, isOpenFavorite)}
                            className={`hover:bg-orange md:px-5 px-1 ${isOpenFavorite ? 'bg-orange' : ''}`}>
                            <img src='/Bookmark_black.svg' alt="Favorite Icon" className='h-16 w-10 min-h-10 min-w-6' />
                        </button>
                        {/* Conditionally render Favorite */}

                        <button
                            onClick={() => handleToggleState(setIsOpenSetting, isOpenSetting)}
                            className={`hover:bg-orange md:px-5 px-1 ${isOpenSetting ? 'bg-orange' : ''}`}>
                            <img src='/Setting_fill.svg' alt="Setting Icon" className='h-16 w-10 min-h-10 min-w-6' />
                        </button>
                        {/*Drop down to show current setting*/}
                        {isOpenSetting && (
                            <div
                                className="z-10 grid grid-cols-1 absolute top-14 right-0 mt-2 w-48 bg-pink shadow-lg border border-white divide-y divide-white"
                            >
                                <ul className="py-1">
                                    <li>
                                        <div className="flex items-center px-5 py-2 hover:bg-orange">
                                            <ToggleSwitch isChecked={isEnglish} onChange={toggleLanguage} />
                                            <span className={'px-5'}>{isEnglish ? 'ENG' : 'VIE'}</span>
                                        </div>
                                    </li>
                                    <span className="absolute left-0 border-t border-black w-full"></span>
                                    <li>
                                        Change Voice Speed:
                                    </li>
                                </ul>
                            </div>
                        )}
                        <button
                            onClick={() => handleToggleState(setIsOpenProfile, isOpenProfile)}
                            className={`hover:bg-orange md:px-2 px-1 ${isOpenProfile ? 'bg-orange' : ''}`}>
                            <img src='/User_circle.svg' alt="User" className='h-16 w-10 min-h-10 min-w-6' />
                        </button>
                        {/* Dropdown Menu */}
                        {isOpenProfile && (
                            <div
                                className="z-10 grid grid-cols-1 absolute top-14 right-0 mt-2 w-48 bg-pink shadow-lg border border-white divide-y divide-white"
                            >
                                <ul className="py-1">
                                    <li>
                                        <button
                                            className="block px-5 py-2 text-black hover:bg-orange w-full text-left "
                                            onClick={() => router.push(`/profile/${member.id}`)}
                                        >
                                            View Profile
                                        </button>
                                    </li>
                                    <span className="absolute left-0 border-t border-black w-full"></span>
                                    <li>
                                        <button
                                            className="block px-5 py-2 text-black hover:bg-orange w-full text-left"
                                            onClick={() => removeAuth()}
                                        >
                                            Logout
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {isOpenHistory && (<History />)}
            {isOpenFavorite && <Favorite />}
            {isOpenMenu && <NavBar isOpen={isOpenMenu} setIsOpen={setIsOpenMenu} />}


        </>
    )
}

export default Header