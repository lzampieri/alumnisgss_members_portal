import { enqueueSnackbar } from "notistack";
import { noninertiaPostRequest } from "../Utils";

export function autosave(refToData, refToLastSavedData, reimbursementId) {
    if (!refToData.current) return;
    const data_ready = JSON.stringify(refToData.current);

    if (data_ready == refToLastSavedData.current) return;

    refToLastSavedData.current = data_ready;

    console.log("Autosaving...");

    noninertiaPostRequest('reimbursements.autosave', refToData.current, 
        () => {}, { reimbursement: reimbursementId })
        .then(() => enqueueSnackbar("Bozza salvata",
            {
                autoHideDuration: 1000,
                variant: 'info',
                anchorOrigin: { vertical: 'bottom', horizontal: 'right' }
            }
        ))
        .catch((e) => {
            console.log(e)
            enqueueSnackbar("Errore nel salvataggio della bozza",
            {
                autoHideDuration: 1000,
                variant: 'error',
                anchorOrigin: { vertical: 'bottom', horizontal: 'right' }
            }
        )});
}