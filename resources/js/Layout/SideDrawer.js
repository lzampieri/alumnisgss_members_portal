import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { Children } from "react";
import { isValidElement } from "react";

export function SideDrawerRight({ children, isOpen, setIsOpen }) {
    return <div
        className={
            "fixed overflow-hidden z-10 bg-halfblack inset-0 transform ease-in-out " +
            (isOpen
                ? " transition-opacity opacity-100 duration-500 translate-x-0"
                : " transition-all duration-500 opacity-0 -translate-x-full")
        }
        onClick={() => setIsOpen(false)}
    >
        <div className={
            "w-4/5 md:w-1/4 min-h-screen left-0 absolute shadow-xl delay-400 duration-500 ease-in-out transition-all transform " +
            (isOpen ? " translate-x-0 " : " -translate-x-full ") +
            "bg-white p-4"
        }>
            {children}
        </div>
    </div>
}

export function SideDrawerLeft({ children, isOpen, setIsOpen }) {
    return <div
        className={
            "fixed overflow-hidden z-10 bg-halfblack inset-0 transform ease-in-out " +
            (isOpen
                ? " transition-opacity opacity-100 duration-500 translate-x-0"
                : " transition-all duration-500 opacity-0 translate-x-full")
        }
        onClick={() => setIsOpen(false)}
    >
        <div className={
            "w-4/5 md:w-1/4 min-h-screen right-0 absolute shadow-xl delay-400 duration-500 ease-in-out transition-all transform " +
            (isOpen ? " translate-x-0 " : " translate-x-full ") +
            "bg-white p-4"
        } onClick={(e) => { e.stopPropagation() }}>
            {children}
        </div>
    </div>
}