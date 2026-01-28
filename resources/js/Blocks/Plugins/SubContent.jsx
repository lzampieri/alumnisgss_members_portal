

import { Link, usePage } from "@inertiajs/react";
import computeResourceLink from "../../Resources/computeResourceLink";
import { faChevronRight, faFolderTree } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default class SubContent {
    static title = "Indice"
    static icon = faFolderTree

    static getDefaultData() {
        return {}
    }

    static mainElementEditable = () => {
        const resource = usePage().props.resource

        return <div className="w-full flex flex-col gap-2 my-2 items-start">
            <span>In questa sezione verrà mostrato l'indice di tutte le sottosezioni <b>visibili all'utente corrente</b> all'interno di questa sezione.</span>
            {resource.visibleChildren.map(child => <Link className="button flex flex-row items-center" href={computeResourceLink(child)} key={child.id}>
                <FontAwesomeIcon icon={faChevronRight} className="mr-2" />
                <span>{child.title}</span>
            </Link>)}
        </div>
    }

    static mainElementReadOnly = () => {
        const resource = usePage().props.resource

        return <div className="w-full flex flex-col gap-2 my-2 items-start">
            {resource.visibleChildren.map(child => <Link className="button flex flex-row items-center" href={computeResourceLink(child)} key={child.id}>
                <FontAwesomeIcon icon={faChevronRight} className="mr-2" />
                <span>{child.title}</span>
            </Link>)}
        </div>
    }

}