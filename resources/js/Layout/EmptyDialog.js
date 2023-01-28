
export default function EmptyDialog({ open, onClose, children }) {

    if (!open) return "";

    return <>
        <div className="fixed inset-0 flex justify-center items-center">
            <div className="absolute w-full h-full bg-halfblack z-40" onClick={ (e) => { e.preventDefault(); onClose() } } />
            <div className="max-w-full md:max-w-[33%] border rounded-xl bg-white z-50 flex flex-col items-stretch p-8" onClick={ () => {} }>
                {children}
            </div>
        </div>
    </>
}