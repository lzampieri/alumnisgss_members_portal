import { useMemo } from 'react';
import BlockParser from './BlockParser';

export default function BlocksViewer({ content, data, setData }) {
    const list = useMemo(() => content?.map(block => BlockParser.preProcess(block)) || [], [content])
    
    return <>
        {list.map(item =>
            <div key={item.id} className="w-full">
                {BlockParser.render(item, null, false, null, data?.[item.id], (val) => setData(item.id, val))}
            </div>
        )}
    </>
}