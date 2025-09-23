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
import Drawer from "./Drawer";

export default function Main() {
    const resource = usePage().props.resource

    return (
        <div className="main-container-drawer">
            <Head title={resource ? resource.title : "Risorse"} />
            <Drawer>
                {resource && <ResourceDetails resource={resource} />}
            </Drawer>
        </div>
    );
}