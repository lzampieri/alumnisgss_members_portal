import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


export default function List() {
    return (
        <div className="flex flex-col items-center w-full md:w-3/5">
            <div className="w-full relative mb-4">
                <input type="text" className="w-full text-center" placeholder="Filtra..." />
                <FontAwesomeIcon icon={ solid('magnifying-glass')} className="
                        text-gray-500
                        absolute right-4 text-2xl inset-y-0 my-auto" />
            </div>
            Lista dei membri...
        </div>
    );
}