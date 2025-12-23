import { useState } from "react";
import { Collapse } from "react-collapse";
import Spinner from "../Layout/Spinner";
import { asyncPostWithResult } from "../Utils";
import { Link } from "@inertiajs/react";

const STEPS = {
    LOGIN_OPTIONS: 0,
    LOGIN_SETEMAIL: 1,
    LOGIN_GETOTP: 2
}

function errorLabel(error, email) {
    
}

export default function LoginOptions() {
    const [step, setStep] = useState(STEPS.LOGIN_OPTIONS);
    const [email, setEmail] = useState('');
    const [loading,setLoading] = useState(false);
    const [error,setError] = useState('');

    const askOtp = async () => {
        setLoading(true);
        
        const data = await asyncPostWithResult(
            'auth.otp.send_otp',
            { address: email }
        ).catch( e => e.response.data );

        console.log(data)

        if( data.errors ) {
            if( data.errors.address ) {
                setError(data.errors.address);
            }
            else {
                setError("Errore sconosciuto, riprova.");
            }
        }

        setLoading(false);
    }

    return <div className="flex flex-col justify-center">
        <Collapse theme={{ collapse: "w-full cpm" }} isOpened={step == STEPS.LOGIN_OPTIONS}>
            <div className="flex flex-col justify-center items-center gap-4">
                <a href={route('auth.login.google')} className="button text-center">
                    Login con google<br />
                    <small>(consigliato)</small>
                </a>
                <button onClick={() => setStep(STEPS.LOGIN_SETEMAIL)} className="button">
                    Login con indirizzo email
                </button>
            </div>
        </Collapse>
        <Collapse theme={{ collapse: "w-full cpm" }} isOpened={step == STEPS.LOGIN_SETEMAIL}>
            <div className="flex flex-col justify-center items-center gap-4">
                <input type="email" placeholder="Indirizzo email" className="w-full text-center" value={email} onChange={(e) => setEmail(e.target.value)} name="email" />
                { error && (error[0] == "unknown" ? 
                    <label className="error">Indirizzo email sconosciuto. <Link href={route('auth.askaccess')} method="post" as="button" data={{ email: email }}>Registrati</Link></label> :
                    <label className="error">{error}</label> )}
                <button onClick={() => askOtp()} className="button" disabled={loading}>
                    {loading ? <Spinner /> : "Invia OTP" }
                </button>
            </div>
        </Collapse>
    </div>
}