import EmptyDialog from "../Layout/EmptyDialog";
import { usePage } from '@inertiajs/react'
import { useState } from 'react';
import LoginOptions from "./LoginOptions";

export default function Access() {

    let user = usePage().props.user;

    if (user)
        return (
            <div className="w-full flex flex-col flex-wrap justify-center items-center px-14 py-8 gap-2">
                <span className="text-primary-main">
                    Accesso eseguito come {(user.name || '') + " " + (user.surname || '')}
                </span>
                {usePage().props.user.all_roles?.length > 0 && 
                <span className="text-primary-main">
                    Utente abilitato ai ruoli di: { usePage().props.user.all_roles?.map( r => r.common_name ).join(", ") }
                </span> }
                {usePage().props.lev2_loggedin &&
                    <span className="text-primary-main">
                        Accesso eseguito con autorizzazioni elevate sull'account
                    </span>
                }
                <a className="
                border-4 border-primary-main rounded-3xl
                text-primary-main bg-primary-contrast
                hover:text-primary-contrast hover:bg-primary-main
                flex flex-col items-center justify-center text-xl gap-4
                no-underline
                p-2
                "
                    href={route('auth.logout')}
                    key={'logout'}>
                    Disconnetti
                </a>
            </div>
        )

    const [open, setOpen] = useState(false);

    return (
        <div className="w-full flex flex-col flex-wrap justify-center items-center gap-14 px-14 py-8">
            <button className="
                border-4 border-primary-main rounded-3xl
                text-primary-main bg-primary-contrast
                hover:text-primary-contrast hover:bg-primary-main
                min-w-[35vh]
                flex flex-col items-center justify-center text-3xl gap-4
                no-underline cursor-pointer
                p-4
                "
                onClick={() => setOpen(true)}
            >
                Accesso
            </button>
            <EmptyDialog
                open={open}
                onClose={() => setOpen(false)}
            >
                <LoginOptions />
            </EmptyDialog>
        </div>
    )
}