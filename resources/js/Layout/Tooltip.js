import { useEffect, useRef, useState } from "react";
import usePortal from 'react-useportal';
// import { useTooltip } from "../Libs/UseTooltip";

export default function Tooltip({ content, children }) {
    const { openPortal, closePortal, isOpen, Portal } = usePortal({ programmaticallyOpen: true })
    const [top, setTop] = useState(0)
    const [left, setLeft] = useState(0)
    const ref = useRef()

    const openAndMovePortal = () => {
        let rect = ref.current.getBoundingClientRect();
        setTop( rect['top'] )
        setLeft( rect['left'] )
        openPortal();
    }

    return <div onMouseEnter={openAndMovePortal} onMouseLeave={closePortal} ref={ref}>
        {children}
        { isOpen && 
            <Portal>
                <div className="bg-gray-100 rounded border border-black absolute p-2" style={{ top: top + 'px', left: left + 'px' }}>
                    {content}
                </div>
            </Portal>
        }
    </div>
}