import { router } from "@inertiajs/react";
import { postRequest } from "../Utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { usePage } from '@inertiajs/react';
import { enqueueSnackbar } from "notistack";
import { useState } from "react";

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
    const editableRolesNames = editableRoles.map(role => role.name)
    const identityRolesNames = identity.roles.map(role => role.name)

    const [addDrawer, setAddDrawer] = useState(false);

    return <div className="flex flex-row w-full justify-center mt-2 flex-wrap">
        {
            identity.roles.map(role =>
                <div className="chip-v2" key={role.name}>
                    <span className="px-2">{role.common_name}</span>
                    {editableRolesNames.indexOf(role.name) > -1 ?
                        <FontAwesomeIcon icon={solid('xmark')} className="chip-v2-icon" onClick={() => userRoleRemove(identity.id, type, role.name, setProcessing)} />
                        : ""}
                </div>
            )
        }
        <div className="icon-button" onClick={() => setAddDrawer(!addDrawer)}>
            <FontAwesomeIcon icon={addDrawer ? solid('xmark') : solid('plus')}/>
        </div>
        {addDrawer &&
            <div className="flex flex-row w-full my-2 justify-center">
                {editableRoles.map(role => (
                    identityRolesNames.indexOf(role.name) > -1 ? "" :
                        <div
                            className="chip-v2-clear cursor-pointer"
                            key={role.name}
                            onClick={() => userRoleAdd(identity.id, type, role.name, setProcessing)} >
                            <FontAwesomeIcon icon={solid('plus')} className="p-1"/>
                            {role.common_name}
                        </div>
                ))}
            </div>
        }
    </div>
}