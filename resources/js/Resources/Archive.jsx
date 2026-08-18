import { useState } from "react";
import BlocksEditor from "../Blocks/BlocksEditor";
import BlocksViewer from "../Blocks/BlocksViewer";
import { Head, Link, useForm, usePage } from '@inertiajs/react';


import EmptyDialog from "../Layout/EmptyDialog";
import RolesChips from "../Permissions/RolesChips";
import { postRequest } from "../Utils";
import Backdrop from "../Layout/Backdrop";
import Select from 'react-select';
import ParentSelector from "./ParentSelector";
import computeResourceLink from "./computeResourceLink";
import Drawer from "./Drawer";
import { faArchive, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function ResItem({ res }) {
    return <Link
        className="border border-black rounded-first-last p-2 cursor-pointer bg-white text-black hover:text-primary-contrast hover:bg-primary-main"
        href={computeResourceLink(res)}
        as="div"
    >
        <div className="w-full flex flew-row gap-2">
            {[...Array(res.depth)].map((e, i) => <div key={i}><FontAwesomeIcon icon={faChevronRight} /></div>)}
            {!!res.archived && <div><FontAwesomeIcon icon={faArchive} /></div>}
            <div className="flex-grow">{res.title}</div>
        </div>
        {/* <div className= {"flex flex-row gap-2 " + ( isChild ? " ml-4" : "" )} >
            <div>{isChild > 0 && <FontAwesomeIcon icon={solid('chevron-right')} />}</div>
            <div>{isParent > 0 && <FontAwesomeIcon icon={solid('chevron-legft')} />}</div>
            <div className="flex-grow">{res.title}</div>
            <div>{res.children_count > 0 && <FontAwesomeIcon icon={solid('folder-tree')} />}</div>
        </div> */}
    </Link>

}

export default function Archive() {
    const list = usePage().props.list;

    return <div className="main-container-drawer">
        <Head title="Archivio" />
        <Drawer isArchive={true}>
            <div className="flex flex-col w-full items-start">
                <h3>Archivio</h3>
                <i>L'archivio non è visibile a tutti gli utenti, ma solo a coloro a cui è stato specificatamente concesso.</i>
                <span>È qui riportata la lista completa di tutte le risorse visibili dall'utente corrente. Quelle contrassegnate dal simbolo <FontAwesomeIcon icon={faArchive} /> sono archiviate e generalmente non visibili nel menù laterale.</span>
                <div className="w-full flex flex-col items-stretch">
                    {list.map(res => <ResItem res={res} key={res.id} />)}
                </div>
            </div>
        </Drawer>
    </div>
}