import EmptyDialog from "../Layout/EmptyDialog"
import LoginOptions from "./LoginOptions"

export default function Login() {
    return <EmptyDialog
        open={true}
        onClose={() => { }}
    >
        <LoginOptions />
    </EmptyDialog>
}