

import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import FileUploadModal from "./FileUploadModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Document, Page } from "react-pdf";
import { useLayoutEffect, useRef, useState } from "react";
import useResizeObserver from '@react-hook/resize-observer';

import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

const useWidth = (target) => {
    const [width, setWidth] = useState(null);

    useLayoutEffect(() => {
        setWidth(target.current.getBoundingClientRect().width)
    }, [target]);

    useResizeObserver(target, (entry) => setWidth(entry.contentRect.width));
    return width;
};


export default class PdfDisplay {
    static title = "Pdf integrato"
    static icon = faFilePdf

    static getDefaultData() {
        return {
            'fileHandle': null,
        }
    }

    static mainElementEditable = ({ item, setItemValue }) => {
        return <div
            className="w-full div-highlighted flex flex-row items-center gap-4 my-2 p-4">
            <FontAwesomeIcon icon={faFilePdf} className="text-6xl" />
            <div className="flex flex-col grow gap-2">
                <FileUploadModal
                    fileHandle={item.fileHandle}
                    setFileHandle={(newHandle) => setItemValue('fileHandle', newHandle)}
                    setFileExt={(newExt) => { }}
                    restrictFormats={['pdf']}
                />
                <div className="italic">Il file selezionato verrà integrato direttamente nella pagina. Salva per vedere l'anteprima. Per includere il file come allegato, usa invece il componente "File".</div>
            </div>
        </div>
    }

    static mainElementReadOnly = ({ item }) => {
        const [numPages, setNumPages] = useState(null);

        function onDocumentLoadSuccess({ numPages }) {
            setNumPages(numPages);
        }

        const wrapperDiv = useRef(null);
        const width = useWidth(wrapperDiv);

        return <div className="w-full" ref={wrapperDiv}>
            <Document
                className="w-full"
                file={route('resources.file', { 'handle': item.fileHandle }) + window.location.search}
                onLoadSuccess={onDocumentLoadSuccess}
            >
                {Array.from(
                    new Array(numPages),
                    (el, index) => (
                        <Page
                            key={`page_${index + 1}`}
                            pageNumber={index + 1}
                            width={width}
                        />
                    ),
                )}
            </Document>
        </div>
    }
}