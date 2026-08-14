<?php

namespace App\Http\Controllers;

use App\Models\Email;
use Illuminate\Support\Facades\Mail;

class MailerController extends Controller
{
    static function getAddresses(array $identities) {
        $emails = [];
        foreach( $identities as $identity) {
            if( $identity ) {
                if( $identity instanceof Email )
                    $emails[] = $identity->address;
                else {
                    $emails = array_merge($emails, $identity->primaryEmails()); # Todo test!!
                }
            }
        }
        return array_unique(array_values($emails));
    }

    static function sendEmail(array $identities, string $subject, string $message, ?string $replyTo = 'webmaster@alumniscuolagalileiana.it' )
    {
        $emails = self::getAddresses($identities);
        
        Mail::send([], [], function (\Illuminate\Mail\Message $msg) use ($emails, $subject, $message, $replyTo) {
            $msg->to($emails);
            $msg->replyTo( $replyTo );
            $msg->subject( $subject);
            $msg->html( nl2br( $message ) );
        });
        LogController::log( LogEvents::MAIL_SENT, NULL, $subject, [$emails, $message]);
    }
}
