import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { Children } from "react";
import { isValidElement } from "react";

function ResponsiveDrawerDrawer({ children }) {
    return <>
        {children}
    </>
}

function ResponsiveDrawer({ children, buttonTitle }) {
    const [isOpen, setIsOpen] = useState(true);
    let mainContent = [], drawerContent = [];

    Children.forEach(children, (child) => {
        if (!isValidElement(child)) return;
        if( child.type === ResponsiveDrawerDrawer ) {
            drawerContent.push( child );
        } else {
            mainContent.push( child );
        }
      });
    
    return <>
        <div
            className={
                "fixed overflow-hidden z-10 bg-halfblack inset-0 transform ease-in-out " +
                (isOpen
                ? " transition-opacity opacity-100 duration-500 translate-x-0"
                : " transition-all duration-500 opacity-0 -translate-x-full") +
                " md:relative md:inset-auto md:transform-none md:opacity-100 md:w-1/4 md:h-auto"
            }
            onClick={() => setIsOpen(false)}
            >
                <div className={
                    "w-4/5 min-h-screen left-0 absolute shadow-xl delay-400 duration-500 ease-in-out transition-all transform " +
                    (isOpen ? " translate-x-0 " : " -translate-x-full ") +
                    " md:w-full md:min-h-0 md:sticky md:transform-none " +
                    " bg-white p-4"
                    } onClick={(e) => {e.stopPropagation()}}>
                    { drawerContent }
                </div>
        </div>
        <button className="button md:hidden" onClick={() => setIsOpen(true)}>
            <FontAwesomeIcon icon={solid('bars')} />
            { buttonTitle }
        </button>     
        { mainContent }
    </>
}

ResponsiveDrawer.Drawer = ResponsiveDrawerDrawer;

export default ResponsiveDrawer;