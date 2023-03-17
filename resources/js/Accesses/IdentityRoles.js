import { Inertia } from "@inertiajs/inertia";
import { postRequest } from "../Utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { usePage } from "@inertiajs/inertia-react";
import { enqueueSnackbar } from "notistack";

function userRoleAdd(id, type, role, setProcessing) {
    postRequest(
        'identity.edit_roles',
        { type: type, id: id, role: role, action: 'add' },
        setProcessing
    );
}

function userRoleRemove(id, type, role, setProcessing) {
    postRequest(
        'identity.edit_roles',
        { type: type, id: id, role: role, action: 'remove' },
        setProcessing
    );
}

export default function IdentityRoles({ identity, type, setProcessing }) {
    const editableRoles = usePage().props.editableRoles
    const editableRolesNames = editableRoles.map( role => role.name )
    const identityRolesNames = identity.roles.map( role => role.name )

    return <>
        {
            identity.roles.map(role =>
                <div className="chip" key={role.name}>
                    { role.common_name }
                    {editableRolesNames.indexOf(role.name) > -1 ?
                        <FontAwesomeIcon icon={solid('xmark')} className="ml-1 px-1 hover:text-white hover:bg-gray-700 rounded-full" onClick={() => userRoleRemove(identity.id, type, role.name, setProcessing)} />
                        : ""}
                </div>
            )
        }
        <div className="icon-button dropdown-parent group" >
            <FontAwesomeIcon icon={solid('plus')}/>
            <div className="dropdown-content-flex flex-col gap-2">
                {editableRoles.map(role => (
                    identityRolesNames.indexOf(role.name) > -1 ? "" :
                        <div
                            className="chip cursor-pointer"
                            key={role.name}
                            onClick={() => userRoleAdd(identity.id, type, role.name, setProcessing)} >
                                { role.common_name }
                        </div>
                ))}
            </div>
        </div >
    </>
}