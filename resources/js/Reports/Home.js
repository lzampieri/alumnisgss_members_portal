import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { Link, usePage } from "@inertiajs/react";

export default function Reports() {
    const options = usePage().props.options

    return (
        <div className="main-container">
            <div className="w-full md:w-3/4 flex flex-col items-stretch mt-4">
                {options.map(opt => (
                    <div className="flex flex-row-reverse items-center bg-gray-100 border-gray-400 border py-2 px-4 rounded-first-last" key={opt.name}>
                        {opt.inertia ?
                            <Link href={opt.url}><FontAwesomeIcon icon={solid('right-long')} className="text-4xl !p-4 icon-button" /></Link> :
                            <a href={opt.url}><FontAwesomeIcon icon={solid('right-long')} className="text-4xl !p-4 icon-button" /></a>
                        }
                        <span className="text-xl font-bold grow">{opt.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}