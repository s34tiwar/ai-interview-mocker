"use client"
import Image from 'next/image'
import { UserButton } from '@clerk/nextjs'
import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
function Header(){

    const path = usePathname();
    const [active, setActive] = useState(path);
    useEffect(() => {
        setActive(path)
    }, [path])
    return(
        <div className='flex p-4 item-center justify-between bg-secondary shadow-emerald-300'>
            <Image src={'/logo.svg'} alt="logo" width={120} height={50}/>

            <ul className='hidden md:flex gap-6'>
                <li className={`hover:text-primary hover:font-bold transition-all cursor-pointer ${path === '/dashboard' ? 'text-primary font-bold' : ''}`}>Dashboard</li>
                <li className={`hover:text-primary hover:font-bold transition-all cursor-pointer ${path === '/questions' ? 'text-primary font-bold' : ''}`}>Questions</li>
                <li className={`hover:text-primary hover:font-bold transition-all cursor-pointer ${path === '/upgrade' ? 'text-primary font-bold' : ''}`}>Upgrade</li>
                <li className={`hover:text-primary hover:font-bold transition-all cursor-pointer ${path === '/how-it-works' ? 'text-primary font-bold' : ''}`}>How it works?</li>
            </ul>
            <UserButton/>
        </div>
    )
}

export default Header