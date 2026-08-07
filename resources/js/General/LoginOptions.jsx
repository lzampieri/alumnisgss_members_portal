import { useRef, useState } from "react";
import { Collapse } from "react-collapse";
import Spinner from "../Layout/Spinner";
import { asyncPostWithResult } from "../Utils";
import { Link, router } from "@inertiajs/react";

const STEPS = {
    LOGIN_OPTIONS: 0,
    LOGIN_SETEMAIL: 1,
    LOGIN_GETOTP: 2
}

export default function LoginOptions() {
    const [step, setStep] = useState(STEPS.LOGIN_OPTIONS);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading,setLoading] = useState(false);
    const [error,setError] = useState('');

    const emailRef = useRef(null);
    const otpRef = useRef(null);

    const askOtp = async () => {
        setLoading(true);

        router.post(
            route('auth.otp.send_otp'),
            { address: email },
            {
                onError: (errors) => {
                    if( errors.address ) {
                        setError(errors.address);
                    } else {
                        setError('C\'è stato un errore inaspettato, accidenti.')
                    }
                },
                onFinish: () => {
                    setLoading(false);
                },
                onSuccess: () => {
                    setError("");
                    setStep(STEPS.LOGIN_GETOTP);
                    otpRef.current.focus();
                }
            }
        )

    }

    const sendOtp = async () => {
        setLoading(true);

        router.post(
            route('auth.otp.validate_otp'),
            { otp: otp },
            {
                onError: (errors) => {
                    if( errors.otp ) {
                        setError(errors.otp);
                    } else {
                        setError('C\'è stato un errore inaspettato, accidenti.')
                    }
                },
                onFinish: () => {
                    setLoading(false);
                }
            }
        )
        
    }

    return <div className="flex flex-col justify-center">
        <Collapse theme={{ collapse: "w-full cpm" }} isOpened={step == STEPS.LOGIN_OPTIONS}>
            <div className="flex flex-col justify-center items-center gap-4">
                <a href={route('auth.login.google')} className="button text-center">
                    Login con google<br />
                    <small>(consigliato)</small>
                </a>
                <button onClick={() => { setStep(STEPS.LOGIN_SETEMAIL); emailRef.current.focus(); }} className="button">
                    Login con indirizzo email
                </button>
            </div>
        </Collapse>
        <Collapse theme={{ collapse: "w-full cpm" }} isOpened={step == STEPS.LOGIN_SETEMAIL}>
            <div className="flex flex-col justify-center items-center gap-4">
                <input ref={emailRef} type="email" placeholder="Indirizzo email" className="w-full text-center" value={email} onChange={(e) => setEmail(e.target.value)} name="email" onKeyDown={(e) => e.key == 'Enter' && askOtp()} />
                { error && (error == "unknown" ? 
                    <label className="error">Indirizzo email sconosciuto. <Link className="underline cursor-pointer" href={route('auth.askaccess_otp')} method="post" as="button" data={{ email: email }}>Registrati</Link></label> :
                    ( error == "not_enabled" ? <label className="error">Questo account non è ancora abilitato al login. Se pensi sia un errore, contattaci.</label> :
                    <label className="error">{error}</label> ))}
                <button onClick={() => askOtp()} className="button" disabled={loading}>
                    {loading ? <Spinner /> : "Invia OTP" }
                </button>
            </div>
        </Collapse>
        <Collapse theme={{ collapse: "w-full cpm" }} isOpened={step == STEPS.LOGIN_GETOTP}>
            <div className="flex flex-col justify-center items-center gap-4">
                <label>Un codice OTP è stato inviato all'indirizzo {email}</label>
                <input ref={otpRef} type="number" placeholder="Codice OTP" className="w-full text-center" value={otp} onChange={(e) => setOtp(e.target.value)} name="OTP"  onKeyDown={(e) => e.key == 'Enter' && sendOtp()} />
                { error && (error == "unknown" ? 
                    <label className="error">Codice OTP non valido</label> :
                    ( error == "expired" ? <label className="error">Codice OTP scaduto, ricarica la pagina per richiederne uno nuovo</label> :
                    ( error == "not_enabled" ? <label className="error">Questo account non è ancora abilitato al login. Se pensi sia un errore, contattaci.</label> :
                    <label className="error">{error}</label> ))) }
                <button onClick={() => sendOtp()} className="button" disabled={loading}>
                    {loading ? <Spinner /> : "Accedi" }
                </button>
            </div>
        </Collapse>
    </div>
}