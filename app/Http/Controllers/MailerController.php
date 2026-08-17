<?php

namespace App\Http\Controllers;

use App\Models\Email;
use App\Models\File;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Mail;

class MailerController extends Controller
{
    static function getAddresses(iterable $identities) {
        $emails = [];
        foreach( $identities as $identity) {
            if( $identity ) {
                if( $identity instanceof Email )
                    $emails[] = $identity->address;
                elseif( is_string( $identity ) )
                    $emails[] = $identity;
                else {
                    $emails = array_merge($emails, $identity->primaryEmails());
                }
            }
        }
        return array_unique(array_values($emails));
    }

    static function sendEmail(iterable $identities, string $subject, string $message, ?string $replyTo = 'webmaster@alumniscuolagalileiana.it', ?string $from = 'webmaster@alumniscuolagalileiana.it', iterable $attachments = [], ?string $event = LogEvents::MAIL_SENT): array
    {
        $emails = self::getAddresses($identities);
        if( count($emails) == 0 )
            return [];
        
        Mail::send([], [], function (\Illuminate\Mail\Message $msg) use ($emails, $subject, $message, $from, $replyTo, $attachments) {
            $msg->to($emails);
            $msg->from( $from );
            $msg->replyTo( $replyTo );
            $msg->subject( $subject);
            $msg->html( nl2br( $message ) );
            foreach ($attachments as $att) {
                $msg->attach($att->path());
            }
        });
        LogController::log( $event, NULL, $subject, [$emails, $message]);

        return $emails;
    }
}
