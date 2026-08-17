import { useState } from "react";
import DatePicker from "tailwind-datepicker-react";

export class NurDate {
    constructor(string_or_year /* undefined for init from now */, month_1based /* undefined for init from string */, day) {
        if( string_or_year == undefined ) {
            this.date = new Date();
        } else if( month_1based == undefined ) {
            this.date = new Date(string_or_year);
        } else {
            this.date = new Date(string_or_year, month_1based - 1, day);
        }
    }

    toString() {
        return this.date.getFullYear() + '-' + (this.date.getMonth() + 1) + '-' + this.date.getDate();
    }

    toJSON() {
        return this.toString();
    }
};

export function NurDatePicker({ value, onChange, classNames }) {
    const [open, setOpen] = useState(false);
    return <DatePicker
        value={value.date}
        classNames={classNames} options={{ defaultDate: value.date, language: 'it', theme: { input: '!text-black' } }}
        onChange={(date) => onChange(new NurDate(date))} show={open} setShow={setOpen} />

}