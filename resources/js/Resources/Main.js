import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { Link, usePage } from "@inertiajs/inertia-react";
import { Documents } from "../Utils";
import ResponsiveDrawer from "../Layout/ResponsiveDrawer";
import BlocksList from "../Blocks/BlocksList";

function ResourceDetails( resource ) {
    return <div className="flex flex-col w-full items-start">
        <h3>{ resource.title }</h3>
        <div className="text-sm text-gray-400">Visibile da { resource.dynamic_permissions.filter( dp => dp.type == 'view' ).map( dp => dp.role.common_name ).join( ", " )}</div>
        <div className="text-sm text-gray-400">Modificabile da { resource.dynamic_permissions.filter( dp => dp.type == 'edit' ).map( dp => dp.role.common_name ).join( ", " )}</div>
        <BlocksList blocks={ resource.blocks } canEdit={ resource.canEdit } />
    </div>
}

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
                            {usePage().props.hidden} { usePage().props.hidden == 1 ? 'risorsa nascosta' : 'risorse nascoste'} con i correnti permessi.
                        </div>
                    }
                </ResponsiveDrawer.Drawer>
                {resource && ResourceDetails( resource ) }
            </ResponsiveDrawer>
        </div>
    );
}