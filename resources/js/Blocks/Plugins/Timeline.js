import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { useState } from "react";
import Timesheet from "../../Libs/Timesheet/Timesheet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DatePicker from "tailwind-datepicker-react";


export default class Timeline {
    static title = "Linea temporale"
    static icon = solid('chart-gantt')

    static getDefaultData() {
        return {
            data: [
                { from: new Date("2020/02/01"), to: new Date("2022/08/06"), label: "Primo" },
                { from: new Date("2022/06/02"), to: new Date("2022/08/05"), label: "Secondo" },
                { from: new Date("2023/09/03"), to: new Date("2024/11/04"), label: "Terzo" }
            ]
        }
    }

    static mainElementEditable = ({ item, setItemValue }) => {
        // const [lines,setLines] = useState( 5 );
        // const onChange = (e) => {
        //     setItemValue('content',e.target.value)
        //     setLines(e.target.value.split(/\r\n|\r|\n/).length + 5);
        // }
        const update = (id, field, newValue) => {
            let newData = item.data.slice();
            newData[id][field] = newValue;
            setItemValue('data', newData);
        }

        const [fromDatePickerOpen, setFromDatePickerOpen] = useState(false);
        const [toDatePickerOpen, setToDatePickerOpen] = useState(false);

        return <div className="w-full flex flex-col">
            <h2 className="font-bold text-primary-main text-xl">Timeline</h2>
            {item.data.map((line, id) => <div className="w-full flex flex-row" key={id}>
                <DatePicker
                    options={{ defaultDate: line.from, maxDate: new Date(), language: 'it', theme: { input: '!text-black' } }}
                    onChange={(date) => update(id, 'from', date)}
                    show={fromDatePickerOpen}
                    setShow={setFromDatePickerOpen}
                    />
                <DatePicker
                    options={{ defaultDate: line.to  , maxDate: new Date(), language: 'it', theme: { input: '!text-black' } }}
                    onChange={(date) => update(id, 'to', date)}
                    show={toDatePickerOpen}
                    setShow={setToDatePickerOpen}
                    />
                <input
                    type="text"
                    className="grow"
                    value={line.label}
                    onChange={(e) => update(id, 'label', e.target.value)}
                    placeholder="Nome"
                />
            </div>)}
        </div>
    }

    static mainElementReadOnly = ({ item }) => {
        return <div>
            <Timesheet data={item.data} />
            <div className="m-3 p-1 border-l-2 border-primary-main">
                {item.data.map((i, id) => <div key={id}>
                    <FontAwesomeIcon icon={solid('circle-user')} className="icon" />
                    {i.from.toLocaleDateString()} - {i.to.toLocaleDateString()}: <b>{i.label}</b>
                </div>)}
            </div>
        </div>
    }

    static preProcess(item) {
        return {
            data: item.data.map(i => {
                return {
                    from: new Date(i.from),
                    to: new Date(i.to),
                    label: i.label
                }
            })
        }
    }

    static postProcess(item) {
        return {
            data: item.data.map(i => {
                return {
                    from: i.from.toString(),
                    to: i.to.toString(),
                    label: i.label
                }
            })
        }
    }
}