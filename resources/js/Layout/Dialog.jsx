import { faCircleCheck, faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";



export default function Dialog({ open, undoLabel, confirmLabel, onClose, onConfirm, children }) {

    if (!open) return "";

    return <>
        <div className="fixed inset-0 flex justify-center items-center z-20">
            <div className="absolute w-full h-full bg-halfblack z-40" onClick={(e) => { e.preventDefault(); onClose() }} />
            <div className="max-w-full md:max-w-[33%] border rounded-xl bg-white z-50 flex flex-col items-stretch p-8" onClick={() => { }}>
                <div className="text-black pt-4 pb-2 px-4 rounded-t-xl text-center">
                    {children}
                </div>
                <div className="w-full flex flex-row items-stretch gap-2 justify-evenly">
                    <button className="button" onClick={(e) => { e.preventDefault(); onClose() }} >
                        <FontAwesomeIcon icon={faCircleXmark} />
                        {undoLabel || "Annulla"}
                    </button>
                    <button className="button" onClick={(e) => { e.preventDefault(); onConfirm() }} >
                        <FontAwesomeIcon icon={faCircleCheck} />
                        {confirmLabel || "Conferma"}
                    </button>
                </div>
            </div>
        </div>
    </>
}