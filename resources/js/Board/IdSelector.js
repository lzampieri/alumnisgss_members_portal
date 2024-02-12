import { useEffect, useState } from 'react';
import Select from 'react-select';
import Datepicker from "tailwind-datepicker-react"

export default function IdSelector({ onChange, prevIdf }) {
    const [progr, setProgr] = useState('');
    const [year, setYear] = useState(new Date().getFullYear());
    const [other, setOther] = useState(prevIdf || '');
    const [date, setDate] = useState(new Date());

    const [datePickerOpen, setDatePickerOpen] = useState(false);

    const options = [
        { value: 'Decreto', label: 'Decreto', yearAndProgr: true, parser: (progr, year, date, other) => 'Decreto ' + progr + '/' + year },
        { value: 'Verbale CdA', label: 'Verbale CdA', date: true, parser: (progr, year, date, other) => 'Verbale Consiglio di Amministrazione ' + date.toLocaleDateString('it-IT', { year: 'numeric', month: '2-digit', day: '2-digit' }) },
        { value: 'Verbale Assemblea dei Soci', label: 'Verbale Assemblea dei Soci', date: true, parser: (progr, year, date, other) => 'Verbale Assemblea dei Soci ' + date.toLocaleDateString('it-IT', { year: 'numeric', month: '2-digit', day: '2-digit' }) },
        { value: 'Altro', label: 'Altro', other: true, parser: (progr, year, date, other) => other },
    ]

    const [selected, setSelected] = useState(prevIdf ? options[3] : options[0]);

    useEffect(() => onChange(selected.parser(progr, year, date, other)), [progr, year, date, other, selected]);

    return (
        <div className="w-full flex flex-row flex-wrap gap-2 items-center">
            <Select className="w-full md:w-1/3" value={selected} options={options} onChange={setSelected} />
            {selected.yearAndProgr && <>
                <input className='grow' type='text' placeholder='Progressivo' value={progr} onChange={(e) => setProgr(e.target.value)} />
                <span>/</span>
                <input className='grow' type='number' value={year} onChange={(e) => setYear(e.target.value)} min={2000} max={new Date().getFullYear()} />
            </>}
            {selected.date && <>
                <Datepicker classNames='w-full md:w-auto grow' options={{ maxDate: new Date(), language: 'it', theme: { input: '!text-black' } }} onChange={setDate} show={datePickerOpen} setShow={setDatePickerOpen} />
            </>}
            {selected.other && <>
                <input className='grow' type='text' placeholder='Identificativo' value={other} onChange={(e) => setOther(e.target.value)} />
            </>}
        </div>
    )
}