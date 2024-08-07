import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import AddBlock from "./AddBlock";
import { enqueueSnackbar } from "notistack";

export default function BlockEnvironment({ children, index, addBlockAt, updateOrder, deleteItem }) {
    const [isTrash, setIsTrash] = useState(false)
    const trashRef = useRef(null);

    const clickTrash = () => {
        if (isTrash) deleteItem(index)
        else {
            setIsTrash(true)
            enqueueSnackbar('Clicca di nuovo per eliminare', { variant: 'info' })
        }
    }

    useEffect(() => {
        if (isTrash) {
            const handleClickOutside = (event) => {
                if (trashRef.current && !trashRef.current.contains(event.target)) {
                    setIsTrash(false)
                }
            };
            document.addEventListener('click', handleClickOutside, true);
            return () => {
                document.removeEventListener('click', handleClickOutside, true);
            };
        }
    }, [isTrash]);

    return <div className="w-full flex flex-row gap-2 group">
        <div className="self-start w-6">
            <div className="button !p-0 aspect-square flex justify-center items-center invisible group-hover:visible" onClick={() => updateOrder(index, index - 1)}>
                <FontAwesomeIcon icon={solid('chevron-up')} className="!pr-0" />
            </div>
            <div className={"button !p-0 aspect-square flex justify-center items-center group-hover:visible" + (isTrash ? " visible button-active" : " invisible")} onClick={clickTrash} ref={trashRef}>
                <FontAwesomeIcon icon={solid('trash')} className="!pr-0" />
            </div>
            <div className="button !p-0 aspect-square flex justify-center items-center invisible group-hover:visible" onClick={() => updateOrder(index, index + 1)}>
                <FontAwesomeIcon icon={solid('chevron-down')} className="!pr-0" />
            </div>
        </div>
        <div className="grow">{children}</div>
        <div className="self-end w-6">
            <AddBlock addBlock={(props) => addBlockAt(props, index + 1)} />
        </div>
    </div>
}