

export default function MainLayout( page ) {
    return <>
        <div className="flex flex-col md:flex-row w-full items-center px-8 py-2 bg-header-bg text-header-tx">
            <a href="" className="grow-0 w-full md:w-1/3">
                <h4 className="text-xl md:text-2xl underline">Associazione Alumni Scuola Galileiana</h4>
            </a>
            <span className="grow"></span>
            <span className="separator"></span>
            <span className="grow"></span>
            <div className="grow-0 w-full md:w-1/3 self-stretch bg-no-repeat bg-contain bg-right flex flex-row-reverse items-center gap-4">
                <img src={process.env.MIX_ASSET_URL + "/assets/logo_contrast.svg"} className="h-full max-h-[3rem]" />
                <h4 className="text-lg md:text-xl underline italic">Portale soci</h4>
            </div>
        </div>
        {page}
    </>
}