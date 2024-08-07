import { useEffect, useRef, useState } from "react";
import usePortal from 'react-useportal';
// import { useTooltip } from "../Libs/UseTooltip";

export default function BigTooltip({ content, children }) {
    const { openPortal, closePortal, isOpen, Portal } = usePortal({ programmaticallyOpen: true })

    return <div onMouseEnter={openPortal} onMouseLeave={closePortal}>
        {children}
        { isOpen && 
            <Portal>
                <div className="bg-gray-100 rounded border border-black p-2 absolute top-0 left-0 h-full w-1/2">
                    {content}
                </div>
            </Portal>
        }
    </div>
}