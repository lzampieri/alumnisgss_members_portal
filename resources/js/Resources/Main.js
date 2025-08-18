import { Head, Link, usePage } from "@inertiajs/react";
import ResponsiveDrawer from "../Layout/ResponsiveDrawer";
import BlocksViewer from "../Blocks/BlocksViewer";
import { Fragment, useState } from "react";
import BlocksEditor from "../Blocks/BlocksEditor";
import ResourceDetails from "./ResourceDetails";
import Create from "./Create";
import computeResourceLink from "./computeResourceLink";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";

function ResLink({res, selected, isChild = false, isParent = false}) {
    return <Link
        className="drawer-item"
        aria-selected={selected}
        href={computeResourceLink(res)}
        as="div"
    >
        <div className= {"flex flex-row gap-2 " + ( isChild ? " ml-2" : "" )} >
            <div>{isChild > 0 && <FontAwesomeIcon icon={solid('chevron-right')} />}</div>
            <div>{isParent > 0 && <FontAwesomeIcon icon={solid('chevron-left')} />}</div>
            <div className="flex-grow">{res.title}</div>
            <div>{res.children_count > 0 && <FontAwesomeIcon icon={solid('folder-tree')} />}</div>
        </div>
    </Link>

}

export default function Main() {
    const resources = usePage().props.resources
    const resource = usePage().props.resource


    console.log(resource);

    return (
        <div className="main-container-drawer">
            <Head title={resource ? resource.title : "Risorse"} />
            <ResponsiveDrawer buttonTitle={resource ? resource.title : "Risorse"} initiallyOpen={!resource}>
                <ResponsiveDrawer.Drawer>
                    {resource?.pluckedParent && <ResLink res={resource.pluckedParent} selected={resource?.id == resource.pluckedParent.id} key={resource.pluckedParent.id} isParent />}
                    {resources.map(res => <Fragment key={res.id}>
                        <ResLink res={res} selected={resource?.id == res.id} key={res.id} />
                        { resource?.id == res.id && resource.visibleChildren.map(child => <ResLink res={child} selected={resource?.id == child.id} key={child.id} isChild />) }
                    </Fragment>
                    )}
                    {resources.length == 0 &&
                        <div
                            className="drawer-item-passive">
                            Nessuna risorsa visibile coi correnti permessi.
                        </div>
                    }
                    {usePage().props.canCreate > 0 &&
                        <Create />
                    }
                </ResponsiveDrawer.Drawer>
                {resource && <ResourceDetails resource={resource} />}
            </ResponsiveDrawer>
        </div>
    );
}