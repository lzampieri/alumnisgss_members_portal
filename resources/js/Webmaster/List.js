import { useState } from "react";
import Dialog from "../Layout/Dialog";
import { Head, Link } from "@inertiajs/react";


function RequireConfirmLink({ href, children }) {
    const [open, setOpen] = useState(false);

    return <>
        <Dialog
            open={open}
            onClose={() => setOpen(false)}
            onConfirm={() => { setOpen(false); window.location.href = href }}>
            Sei sicuro di voler andare a {children}?
        </Dialog>
        <a href="#" onClick={(e) => { e.preventDefault(); setOpen(true); }}>{children}</a>
    </>
}

export default function List() {

    return (
        <div className="main-container">
            <Head title="Funzioni webmaster" />
            <ul>
                <li><a href={route('log')}>Log</a></li>
                <li><a href={route('webmaster.log.internal')}>Internal log</a></li>
                <li><RequireConfirmLink href={route('webmaster.backup')}>Backup</RequireConfirmLink></li>
                <li><Link href={route('webmaster.decryptUtility')}>Utilità per decriptazione</Link></li>
                <li><RequireConfirmLink href={route('webmaster.migrate')}>Migra</RequireConfirmLink></li>
                <li><RequireConfirmLink href={route('webmaster.remigrate')}>Reset di tutte le migrazioni PERICOLOSO</RequireConfirmLink></li>
                <li><a href={route('webmaster.partremigrate', { count: 1 })}>Reset di tutte le migrazioni a step</a></li>
                <li><a href={route('webmaster.sendTestMail')}>Invia mail di test</a></li>
                <li><RequireConfirmLink href={route('webmaster.enableAllPublic')}>Abilita al login tutti gli alumni con stato pubblico (membri, studenti, preiscritti).</RequireConfirmLink></li>
                <li><a href={route('auth.login_lv2.google')}>Forza accesso con autorizzazioni elevate</a></li>
            </ul>
        </div>
    );
}