import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { usePage } from '@inertiajs/inertia-react'

export default function Access() {

    let user = usePage().props.user;

    if (user)
        return (
            <div className="w-full flex flex-col flex-wrap justify-center items-center px-14 py-8 gap-2">
                <span className="text-primary-main">
                    Accesso eseguito come {user.email}
                </span>
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

    return (
        <div className="w-full flex flex-col flex-wrap justify-center items-center gap-14 px-14 py-8">
            <a className="
                border-4 border-primary-main rounded-3xl
                text-primary-main bg-primary-contrast
                hover:text-primary-contrast hover:bg-primary-main
                min-w-[35vh]
                flex flex-col items-center justify-center text-3xl gap-4
                no-underline
                p-4
                "
                href={route('auth.login.google')}
                key={'login'}>
                Accesso
            </a>
        </div>
    )
}