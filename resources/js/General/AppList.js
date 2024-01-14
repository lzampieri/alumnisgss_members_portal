import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link, usePage } from '@inertiajs/react'
import RegisteredApps from './RegisteredApps'

export default function AppList() {

    const apps = usePage().props.apps;
    let classes = "border-4 border-primary-main rounded-3xl \
                    text-primary-main bg-primary-contrast \
                    hover:text-primary-contrast hover:bg-primary-main \
                    aspect-square min-h-[35vh] \
                    flex flex-col items-center justify-center text-3xl gap-4 \
                    no-underline";

    return (
        <div className="w-full flex flex-row flex-wrap justify-center items-center gap-14 px-14 py-8">
            {RegisteredApps.map(app => {
                if (apps.includes(app.id)) {
                    if (app.href) return (
                        <a className={classes} href={app.url} key={app.name}>
                            <FontAwesomeIcon icon={app.icon} className="text-5xl" />
                            {app.name}
                        </a>
                    ); else return (
                        <Link className={classes} href={app.url} key={app.name}>
                            <FontAwesomeIcon icon={app.icon} className="text-5xl" />
                            {app.name}
                        </Link>
                    )
                }
            })}
        </div>
    )
}