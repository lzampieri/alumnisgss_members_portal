import { useEffect, useState } from 'react';
import Select from 'react-select';
import Datepicker from "tailwind-datepicker-react"

export default function IdSelector_Attachment({ onChange }) {
    const [progr,setProgr] = useState('');
    const [label,setLabel] = useState( '' );
    
    const parser = (progr,label) => 'Allegato ' + progr + ': ' + label;
    useEffect( () => onChange( parser(progr,label) ), [progr,label] );

    return (
        <div className="w-full flex flex-row flex-wrap gap-2 items-center">
            <input className='grow' type='text' placeholder='Progressivo' value={progr} onChange={ (e) => setProgr(e.target.value) } />
            <input className='grow-[3]' type='text' placeholder='Titolo' value={label} onChange={ (e) => setLabel(e.target.value) } />
        </div>
    )
}