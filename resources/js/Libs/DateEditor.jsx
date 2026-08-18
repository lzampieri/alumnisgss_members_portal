import { useState } from "react";
import DatePicker from "tailwind-datepicker-react";

export class NurDate {
    static monthNames = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];

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
        return this.yearString() + '-' + this.monthString() + '-' + this.dayString();
    }

    toNiceString() {
        return this.dayString() + '/' + this.monthString() + '/' + this.yearString();
    }

    toJSON() {
        return this.toString();
    }

    toLiteral() {
        return this.day() + " " + this.monthName() + " " + this.year();
    }

    year() {
        return this.date.getFullYear();
    }

    month() {
        return this.date.getMonth() + 1;
    }

    day() {
        return this.date.getDate();
    }

    yearString() {
        return this.year().toString();
    }

    monthString() {
        return this.month().toString().padStart(2, '0');
    }

    dayString() {
        return this.day().toString().padStart(2, '0');
    }

    monthName() {
        return NurDate.monthNames[this.date.getMonth()];
    }
};

export function NurDatePicker({ value, onChange, classNames }) {
    const [open, setOpen] = useState(false);
    return <DatePicker
        value={value.date}
        classNames={classNames} options={{ defaultDate: value.date, language: 'it', theme: { input: '!text-black' } }}
        onChange={(date) => onChange(new NurDate(date))} show={open} setShow={setOpen} />

}