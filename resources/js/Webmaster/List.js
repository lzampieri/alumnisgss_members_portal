import { useState } from "react";
import Dialog from "../Layout/Dialog";


function RequireConfirmLink({ href, children }) {
    const [open, setOpen] = useState(false);

    return <>
        <Dialog
            open={open}
            onClose={() => setOpen(false)}
            onConfirm={() => { setOpen(false); window.location.href = href }}>
            Sei sicuro di voler andare a {children}?
        </Dialog>
        <a href="#" onClick={(e) => {e.preventDefault(); setOpen(true);}}>{children}</a>
    </>
}

export default function List() {

    return (
        <div className="main-container">
            <ul>
                <li><a href={route('log')}>Log</a></li>
                <li><RequireConfirmLink href={route('webmaster.backup')}>Backup</RequireConfirmLink></li>
                <li><RequireConfirmLink href={route('log')}>Log</RequireConfirmLink></li>
            </ul>
        </div>
    );
}