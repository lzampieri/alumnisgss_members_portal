import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { useState } from "react";
import Timesheet from "../../Libs/Timesheet/Timesheet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DatePicker from "tailwind-datepicker-react";
import ReactSwitch from "react-switch";


export default class Timeline {
    static title = "Linea temporale"
    static icon = solid('chart-gantt')
    static dateOptions = { year: 'numeric', month: '2-digit', day: '2-digit' }
    static stillAlive = new Date("3000/01/01")

    static getDefaultData() {
        return {
            data: [
                { from: new Date("2020/02/01"), to: new Date("2022/08/06"), label: "Primo" },
                { from: new Date("2022/06/02"), to: new Date("2022/08/05"), label: "Secondo" },
                { from: new Date("2023/09/03"), to: this.stillAlive, label: "Terzo" }
            ],
            onlyYears: false
        }
    }

    static mainElementEditable = ({ item, setItemValue }) => {
        const update = (id, field, newValue) => {
            let newData = item.data.slice();
            newData[id][field] = newValue;
            setItemValue('data', newData);
        }

        const addRow = () => {
            setItemValue('data', [ ...item.data, { id: item.data.length, from: new Date(), to: new Date(), label: "" } ] );
        }

        return <div className="w-full flex flex-col">
            <h2 className="font-bold text-primary-main text-xl">Timeline</h2>
            <label className="unspaced">Inserisci data di inizio, data di fine e nome. Le righe vuote verranno ignorate. Qualsiasi data futura verrà interpretata come <i>ancora in carica</i>.</label>
            <label className="error">Bug noto: può essere che la timeline generata quando si clicca <i>salva</i> non sia correttamente dimensionata. Ricaricare la pagina (F5) per rigenerarla.</label>
            <label className="unspaced">
                <ReactSwitch
                    height={14} width={28} className="px-1"
                    checked={item.onlyYears} onChange={(newState) => setItemValue('onlyYears', newState)}
                    />
                Mostra solo l'anno
            </label>
            {item.data.map((line, id) =>
                <Timeline.formLine
                    content = {line}
                    key = {id}
                    id = {id}
                    update = { ( field, value ) => update( id, field, value ) }
                    />
            )}
            <div className="w-full flex flex-row justify-center">
                <FontAwesomeIcon icon={solid('circle-plus')} className="icon-button" onClick={addRow} />
            </div>
        </div>
    }

    static formLine({content, id, update}) {
        const [fdatePickerOpen, setFDatePickerOpen] = useState(false)
        const [tdatePickerOpen, setTDatePickerOpen] = useState(false)

        return <div className="w-full flex flex-row" key={id}>
            <DatePicker
                options={{
                    defaultDate: content.from,
                    language: 'it',
                    theme: { input: '!text-black' } }}
                onChange={(date) => update('from', date)}
                show={fdatePickerOpen}
                setShow={setFDatePickerOpen}
                />
            <DatePicker
                options={{
                    defaultDate: content.to,
                    language: 'it',
                    theme: { input: '!text-black' } }}
                onChange={(date) => update('to', date)}
                show={tdatePickerOpen}
                setShow={setTDatePickerOpen}
                />
            <input
                type="text"
                className="grow"
                value={content.label}
                onChange={(e) => update('label', e.target.value)}
                placeholder="Nome"
            />
        </div>
    }

    static mainElementReadOnly = ({ item }) => {
        return <div>
            <Timesheet data={item.data} limitToToday={true} />
            <div className="m-3 p-1 border-l-2 border-primary-main">
                {item.data.map((i, id) => <div key={id}>
                    <FontAwesomeIcon icon={solid('circle-user')} className="icon" />
                    { this.parseDate( i.from, item.onlyYears ) } - { this.parseDate( i.to, item.onlyYears ) }: <b>{i.label}</b>
                </div>)}
            </div>
        </div>
    }

    static parseDate(date, onlyYears) {
        if( date < new Date() ) {
            if( onlyYears )
                return date.getFullYear()
            return date.toLocaleDateString( 'it-IT', this.dateOptions )
        }
        return 'oggi';
    }

    static preProcess(item) {
        return {
            data: item.data.map(i => {
                return {
                    from: new Date(i.from),
                    to: new Date(i.to),
                    label: i.label,
                }
            }),
            onlyYears: Boolean( parseInt( item.onlyYears ) )
        }
    }

    static postProcess(item) {
        let today = new Date( (new Date()).toLocaleDateString() ); // Beginning of today
        return {
            data: item.data.filter( i => i.label.length > 0 ).map(i => {
                return {
                    from: i.from.toString(),
                    to: ( i.to >= today ) ? this.stillAlive.toString() : i.to.toString(),
                    label: i.label
                }
            }),
            onlyYears: item.onlyYears ? '1' : '0'
        }
    }
}