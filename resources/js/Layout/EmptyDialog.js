import { createPortal } from "react-dom";

export default function EmptyDialog({ open, onClose, children }) {

    return <span>
        {open && createPortal(<div className="fixed inset-0 flex justify-center items-center z-40" onClick={(e) => { e.stopPropagation() }}>
            <div className="absolute w-full h-full bg-halfblack z-40" onClick={(e) => { e.preventDefault(); onClose(); }} />
            <div className="max-w-full md:max-w-[33%] md:w-[33%] border rounded-xl bg-white z-50 flex flex-col items-stretch p-8" onClick={() => { }}>
                {children}
            </div>
        </div>, document.body ) }
    </span>
}