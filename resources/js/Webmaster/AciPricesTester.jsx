import { Head, Link, usePage } from "@inertiajs/react";
import { NurDate, NurDatePicker } from "../Libs/DateEditor";
import { useState } from "react";

export default function AciPricesTester() {
    const [date, setDate] = useState(new NurDate(usePage().props.forDate));

    const data = usePage().props.data;

    return (
        <div className="main-container">
            <Head title="Verifica prezzi ACI" />
            <span>
                Requested: { new NurDate( usePage().props.forDate ).toNiceString() }
            </span>
            <span>
                Requested (server): { data.forDate }
            </span>
            <span>
                Found: { data.realDate}
            </span>
            {
                Object.keys(data.prices).map(p => <div key={p}>{p}: {data.prices[p]}</div>)
            }
            <span>
                Last update: { new NurDate( data.updated ).toNiceString() }
            </span>
            <div className="w-full flex flex-row">
                <NurDatePicker
                    value={date}
                    onChange={(val) => setDate(val)} />
                <Link className="button" href={route('webmaster.AciPricesTester', { date: date.toString() })}>Verifica</Link>
            </div>
        </div>
    );
}