import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from '@inertiajs/inertia-react'
import RegisteredApps from './RegisteredApps'

export default function AppList() {

    return (
        <div className="w-full flex flex-row flex-wrap justify-center items-center gap-14 px-14 py-8">
            { RegisteredApps.map ( app => 
                <Link className="
                    border-4 border-primary-main rounded-3xl
                    text-primary-main bg-primary-contrast
                    hover:text-primary-contrast hover:bg-primary-main
                    aspect-square min-h-[35vh]
                    flex flex-col items-center justify-center text-3xl gap-4
                    no-underline
                    "
                    href={ app.url }
                    key={ app.name }>
                    <FontAwesomeIcon icon={ app.icon } className="text-5xl" />
                    { app.name }
                </Link>
             )}
        </div>
    )
}