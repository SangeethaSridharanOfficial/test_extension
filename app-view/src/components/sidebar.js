import { useEffect, useState } from 'react';
import '../styles/sidebar.css';

const Sidebar = () => {
    return (
        <div className='sidebar_cont'>
            <div className="image_holder">
                <img className='logo_icon' src="https://ik.imagekit.io/ofb/ofb/dev/OFBLogo_ccxPqKWYrw.png?tr=dpr-2,pr-true,f-auto,w-180" alt="logo"></img>
            </div>
            <div className='content_holder'>
                <span className='content cont1'>Good Day!!</span>
                <span className='content cont2'>Let's start the recording to test the real-life user load</span>
            </div>
        </div>
    )
}

export default Sidebar;