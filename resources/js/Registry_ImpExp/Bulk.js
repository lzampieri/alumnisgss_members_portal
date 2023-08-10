import { useForm } from "@inertiajs/react";
import { AlumnusStatus } from "../Utils";
import Select from 'react-select';
import { useState } from "react";
import Backdrop from "../Layout/Backdrop";

export default function Bulk() {
    const { data, setData, post, processing, errors } = useForm({
        content: ''
    })
    const [lineCount, setLineCount] = useState(0);
    const [wrongLines, setWrongLines] = useState([]);

    const submit = (e) => {
        e.preventDefault();
        let lines = data.content.split(/\r\n|\r|\n/);
        let tempWrongLines = [];
        lines.forEach((line, i) => {
            if (line.length == 0) return;
            let sections = line.split(',')
            if (sections.length != 4)
                tempWrongLines.push(i)
            if (!(/^\d+$/.test(sections[2])))
                tempWrongLines.push(i)
            if (!Object.keys(AlumnusStatus.status).includes(sections[3]))
                tempWrongLines.push(i)
        });
        setWrongLines(tempWrongLines);

        if (tempWrongLines.length == 0)
            post(route('registry.bulk.import'));
    }

    const textAreaManager = (e) => {
        let value = e.target.value.replaceAll('@', '\n')
        setData('content', value);
        setLineCount(value.split(/\r\n|\r|\n/).length)
    }

    return (
        <form className="flex flex-col w-full md:w-3/5" onSubmit={submit}>
            <h3>Inserimento in massa</h3>
            <label>Cognome,Nome,Coorte,Stato</label>
            <label>
                Legenda stati:
                {Object.keys(AlumnusStatus.status).map(i => <><b>{i}</b> {AlumnusStatus.status[i].label} - </>)}
            </label>
            <div
                className="textarea-container flex flex-row">
                <div className="flex flex-col justify-start items-end px-2 text-gray-400">
                    {[...Array(lineCount + 1).keys()].map((i) =>
                        <span key={i}>
                            {wrongLines.includes(i) ? <span className="text-error">⬤</span> : ""}
                            {i + 1}
                        </span>)}
                </div>
                <textarea
                    className="textarea-reset grow"
                    rows={5 + lineCount}
                    value={data.content} onChange={textAreaManager} />
            </div>
            <label className="error">{errors.surname}</label>
            <input type="button" className="button mt-4 sticky bottom-0" onClick={submit} value="Aggiungi" />
            <Backdrop open={processing} />
        </form>
    );
}