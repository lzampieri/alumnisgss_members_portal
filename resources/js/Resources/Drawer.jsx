import { Head, Link, usePage } from "@inertiajs/react";
import ResponsiveDrawer from "../Layout/ResponsiveDrawer";
import BlocksViewer from "../Blocks/BlocksViewer";
import { Fragment, useState } from "react";
import BlocksEditor from "../Blocks/BlocksEditor";
import ResourceDetails from "./ResourceDetails";
import Create from "./Create";
import computeResourceLink from "./computeResourceLink";
import { faBoxArchive, faChevronLeft, faChevronRight, faFolderTree } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";



function ResLink({ res, selected, isChild = false, isParent = false }) {
    return <Link
        className="drawer-item"
        aria-selected={selected}
        href={computeResourceLink(res)}
        as="div"
    >
        <div className={"flex flex-row gap-2 " + (isChild ? " ml-4" : "")} >
            <div>{isChild > 0 && <FontAwesomeIcon icon={faChevronRight} />}</div>
            <div>{isParent > 0 && <FontAwesomeIcon icon={faChevronLeft} />}</div>
            <div className="flex-grow">{res.title}</div>
            <div>{res.children_count > 0 && <FontAwesomeIcon icon={faFolderTree} />}</div>
        </div>
    </Link>

}

function Archive({ selected }) {
    return <Link
        className="drawer-item"
        href={route('resources.archive')}
        aria-selected={selected}
        as="div"
    >
        <div className="flex flex-row gap-2" >
            <div><FontAwesomeIcon icon={faBoxArchive} /></div>
            <div className="flex-grow">Archivio</div>
        </div>
    </Link>

}

export default function Drawer({ children, isArchive = false }) {
    const resources = usePage().props.resources
    const resource = usePage().props.resource

    return (
        <ResponsiveDrawer buttonTitle={resource ? resource.title : (isArchive ? "Archivio" : "Risorse")} initiallyOpen={!resource && !isArchive}>
            <ResponsiveDrawer.Drawer>
                {resource?.pluckedParent && <ResLink res={resource.pluckedParent} selected={resource?.id == resource.pluckedParent.id} key={resource.pluckedParent.id} isParent />}
                {resources.map(res => <Fragment key={res.id}>
                    <ResLink res={res} selected={resource?.id == res.id} key={res.id} />
                    {resource?.id == res.id && resource.visibleChildren.map(child => <ResLink res={child} selected={resource?.id == child.id} key={child.id} isChild />)}
                </Fragment>
                )}
                {resources.length == 0 &&
                    <div
                        className="drawer-item-passive">
                        Nessuna risorsa visibile coi correnti permessi.
                    </div>
                }
                {usePage().props.canSeeArchive > 0 &&
                    <Archive selected={isArchive} />
                }
                {usePage().props.canCreate > 0 &&
                    <Create />
                }
            </ResponsiveDrawer.Drawer>
            {children}
        </ResponsiveDrawer>
    );
}