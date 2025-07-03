<?php

namespace App\Http\Controllers;

use App\Models\Alumnus;
use App\Models\External;
use Illuminate\Support\Facades\Mail;

class MailerController extends Controller
{
    static function getAddresses(array $identities) {
        $emails = [];
        foreach( $identities as $identity) {
            if( $identity ) {
                $this_id_emails = [];
                foreach( $identity->emails as $em) {
                    if( $em->primary ) {
                        $this_id_emails = [ $em->address ]; // To the primary if there is a primary, to all elsewhere
                        break;
                    }
                    $this_id_emails[] = $em->address;
                }
                $emails = array_merge($emails, $this_id_emails);
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
            $msg->subject($subject);
            $msg->setBody( nl2br( $message ), 'text/html');
        });
        LogController::log( LogEvents::MAIL_SENT, NULL, $subject, [$emails, $message]);
    }
}
