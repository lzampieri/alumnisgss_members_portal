import { Link } from '@inertiajs/inertia-react';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import { useEffect } from 'react';

export default function MainLayout( page ) {
    useEffect(() => {
        if (page.props.notistack) {
            enqueueSnackbar( page.props.notistack[1], { variant: page.props.notistack[0] });
        }
    }, [ page.props.notistack ])


    return <SnackbarProvider>
        <div className="flex flex-col md:flex-row w-full items-center px-8 py-2 bg-header-bg text-header-tx">
            <Link href={ route('home') } className="grow-0 w-full md:w-1/3">
                <h4 className="text-xl md:text-2xl underline">Associazione Alumni Scuola Galileiana</h4>
            </Link>
            <span className="grow"></span>
            <span className="separator"></span>
            <span className="grow"></span>
            <div className="grow-0 w-full md:w-1/3 self-stretch bg-no-repeat bg-contain bg-right flex flex-row-reverse items-center gap-4">
                <img src={process.env.MIX_ASSET_URL + "/assets/logo_contrast.svg"} className="h-full max-h-[3rem]" />
                <h4 className="text-lg md:text-xl underline italic">Portale soci</h4>
            </div>
        </div>
        <div className="flex flex-col items-center w-full p-8">
            {page}
        </div>
    </SnackbarProvider>
}