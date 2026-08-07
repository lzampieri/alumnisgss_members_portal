import { faHeartCrack, faPersonDigging } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "@inertiajs/react";

export default function Maintenance() {
    return <div className="py-24">
        <div className="flex flex-col justify-center">
            <span className="w-full text-center">
                <FontAwesomeIcon icon={faPersonDigging} className="text-6xl text-primary-main rounded-2xl p-8 " />
            </span>
            <div className="w-full text-center py-8">
                <b>Temporaneamente non disponibile per manutenzione</b>
            </div>
            <div className="self-center button">
                <FontAwesomeIcon icon={faHeartCrack} />
            </div>
            <div className="w-full text-center py-8 text-sm"><a href={route('auth.login.google')}>Login</a> - <a href={route('auth.logout')}>Logout</a></div>
        </div>
    </div>
}