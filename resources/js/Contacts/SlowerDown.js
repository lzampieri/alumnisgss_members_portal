import { useEffect, useState } from "react";
import { asyncPostWithResult, sleep } from "../Utils";

async function startProcessing(route, list, setDone, setFinish) {
    
    console.log("Starting to batch " + list.length + " requests one by one");

    let index = 0;
    let output = [];

    while( index < list.length ) {
        try {
            output.push(await asyncPostWithResult(route, { item: list[index] }));
        } catch (e) {
            console.log("Getting error! Retrying in 15s...");
            index--;
            await sleep(15000);
        }
        index++;
        setDone(index);

        if( index > 0 ) break;
    }
    setFinish(output);
}

export default function SlowerDown({ route, list, setFinish }) {
    const [done, setDone] = useState(0);

    useEffect(() => { startProcessing(route, list, setDone, setFinish); }, []);


    return <div className="w-full flex flex-col items-center gap-2 m-2 p-2">
                <svg className="animate-spin -ml-1 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {done}/{list.length} and working...
            </div>;
}