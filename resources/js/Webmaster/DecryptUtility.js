import { useState } from "react";
import Dialog from "../Layout/Dialog";
import { usePage } from "@inertiajs/react";


export default function DecryptUtility() {

    return (
        <div className="main-container">
            <h3>Utility per decriptazione AES.</h3>
            <form target="_blank" action={route('webmaster.decryptUtility')} method="POST" className="w-full flex flex-col justify-start" enctype="multipart/form-data">
                <label>File da decriptare</label>
                <input type="file" name="file" />
                <label>Chiave</label>
                <input type="text" name="key" />
                <input type="hidden" name="_token" value={usePage().props._token} />
                <input type="submit" value="Decripta" className="button" />
            </form>
        </div>
    );
}