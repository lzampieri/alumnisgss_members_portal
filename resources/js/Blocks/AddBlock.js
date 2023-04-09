import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { disappearing } from "../Utils";
import RegisteredTools from "./RegisteredTools";
import Title from "./Title";

export default function AddBlock({ alwaysVisible = false, addBlock }) {
    const [menuOpen, setMenuOpen] = useState(false)
    const addRef = useRef(null);

    useEffect(() => {
        if( menuOpen ) {
            const handleClickOutside = (event) => {
                if (addRef.current && !addRef.current.contains(event.target)) {
                    setMenuOpen( false )
                }
            };
            document.addEventListener('click', handleClickOutside, true);
            return () => {
                document.removeEventListener('click', handleClickOutside, true);
            };
        }
    }, [ menuOpen ]);

    const onClick = (k, v) => {
        addBlock({ type: k, ...v.getDefaultData()});
        setMenuOpen( false )
    }

    return <div ref={addRef} className="relative">
        <div className={"button !p-0 aspect-square flex justify-center items-center " + ( alwaysVisible ? "" : "invisible group-hover:visible" )} onClick={() => setMenuOpen(!menuOpen)}>
            <FontAwesomeIcon icon={solid('add')} className="!pr-0" />
        </div>
        <div className={"absolute right-0 border border-black rounded-xl my-2 flex flex-col z-10 " + ( menuOpen ? "visible" : "invisible" )}>
            { Object.entries(RegisteredTools).map( ([k, v]) =>
                <div className="flex flex-row items-center gap-2 drawer-item-noborder" key={k} onClick={() => onClick( k, v )}>
                    <FontAwesomeIcon  icon={ v.icon } className="text-white bg-black rounded p-1 text-sm"/>
                    { v.title }
                </div>
            )}
        </div>
    </div>
}