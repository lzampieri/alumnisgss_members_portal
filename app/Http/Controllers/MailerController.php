<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Mail;

class MailerController extends Controller
{
    static function sendEmail(array $identities, string $subject, string $message)
    {
        
        $emails = [];
        foreach( $identities as $identity) {
            if( $identity )
                foreach( $identity->loginMethods as $lm) {
                    if( $lm->driver == 'google' )
                        $emails[] = $lm->credential;
                }
        }
        $emails = array_unique(array_values($emails));

        Mail::send([], [], function (\Illuminate\Mail\Message $msg) use ($emails, $subject, $message) {
            $msg->to($emails);
            $msg->replyTo('webmaster@alumniscuolagalileiana.it');
            $msg->subject($subject);
            $msg->setBody( nl2br( $message ), 'text/html');
        });
        LogController::log( LogEvents::MAIL_SENT, NULL, $subject, [$emails, $message]);
    }
}
