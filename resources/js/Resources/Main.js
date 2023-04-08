import { Link, usePage } from "@inertiajs/inertia-react";
import ResponsiveDrawer from "../Layout/ResponsiveDrawer";
import BlocksViewer from "../Blocks/BlocksViewer";
import { useState } from "react";
import BlocksEditor from "../Blocks/BlocksEditor";
import ResourceDetails from "./ResourceDetails";
import Create from "./Create";

export default function Main() {
    const resources = usePage().props.resources
    const resource = usePage().props.resource

    return (
        <div className="main-container-drawer">
            <ResponsiveDrawer buttonTitle={resource ? resource.title : "Risorse"} initiallyOpen={!resource}>
                <ResponsiveDrawer.Drawer>
                    {resources.map(res =>
                        <Link
                            className="drawer-item"
                            aria-selected={resource?.id == res.id}
                            href={route('resources', { 'resource': res.id })}
                            as="div"
                            key={res.id}
                        >
                            {res.title}
                        </Link>
                    )}
                    {usePage().props.hidden > 0 &&
                        <div
                            className="drawer-item-passive">
                            {usePage().props.hidden} {usePage().props.hidden == 1 ? 'risorsa nascosta' : 'risorse nascoste'} con i correnti permessi.
                        </div>
                    }
                    {usePage().props.canCreate > 0 &&
                        <Create />
                    }
                </ResponsiveDrawer.Drawer>
                {resource && <ResourceDetails resource={resource} /> }
            </ResponsiveDrawer>
        </div>
    );
}