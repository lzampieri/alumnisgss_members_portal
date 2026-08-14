<?php

namespace App\Http\Controllers;

use App\Http\Controllers\LogEvents;
use App\Models\ADetail;
use App\Models\ADetailsType;
use App\Models\Document;
use App\Models\DynamicPermission;
use App\Models\File;
use App\Models\Email;
use App\Models\Permission;
use App\Models\Person;
use App\Models\MailingList;
use App\Models\Ratification;
use App\Models\Resource;
use App\Models\Role;
use App\Models\Stamp;
use App\Models\Ticket;
use App\Models\TicketComment;
use Illuminate\Database\Eloquent\Model;

class LogType {
    const DB = [
        LogEvents::CREATE => [
            Person::class, Document::class, DynamicPermission::class,
            MailingList::class, Email::class, Ratification::class,
            Resource::class, Permission::class, Role::class, ADetail::class, ADetailsType::class,
            File::class, Stamp::class, Ticket::class, TicketComment::class ],
        LogEvents::RESTORED => [
            Person::class, Document::class, DynamicPermission::class,
            MailingList::class, Email::class, Ratification::class,
            Resource::class, Permission::class, Role::class, ADetail::class, ADetailsType::class,
            File::class, Stamp::class, Ticket::class, TicketComment::class ],
        LogEvents::UPDATE => [
            Person::class, Document::class, DynamicPermission::class,
            MailingList::class, Email::class, Ratification::class,
            Resource::class, Permission::class, Role::class, ADetail::class, ADetailsType::class,
            File::class, Stamp::class, Ticket::class, TicketComment::class ],
        LogEvents::DELETE => [
            Person::class, Document::class, DynamicPermission::class,
            MailingList::class, Email::class, Ratification::class,
            Resource::class, Permission::class, Role::class, ADetail::class, ADetailsType::class,
            File::class, Stamp::class, Ticket::class, TicketComment::class ],
        // NOTE: Permalink::class is not logged into the DB, since it uses as a primary key a string, and therefore
        // it is not compatible with the morphing structure of the "item" column in the DB
        
        LogEvents::PERMISSION_GIVEN => True,
        LogEvents::PERMISSION_REVOKEN => True,
        LogEvents::ROLE_GIVEN => True,
        LogEvents::ROLE_REVOKEN => True,

        LogEvents::DOWNLOADED_SCHEMA => True,
        LogEvents::DOWNLOADED_DETAILS => True,
        LogEvents::DOWNLOADED_FILE => True,
        LogEvents::DOWNLOADED_RATIFICATIONSLIST => True,
        LogEvents::DOWNLOADED_REPORT => True,

        LogEvents::BACKUP_DONE => True,

        LogEvents::LOGIN => True,
        LogEvents::LOGIN_OTP => True,
        LogEvents::LOGIN_LV2 => True,

        LogEvents::MAIL_SENT => True,
        LogEvents::NEWSLETTER_SENT => True,
        LogEvents::NEWSLETTER_TEST_SENT => True,
        LogEvents::NEWSLETTER_SMTP_SENT => True,

        LogEvents::RESOURCE_VIA_MAGICLINK => True,
        LogEvents::FILE_VIA_MAGICLINK => True,

        LogEvents::SETTINGS_CHANGED => True
    ];
}

class LogController extends Controller
{
    private static function shouldILogToDB( string $event, Model $item = NULL ) {
        if( !array_key_exists( $event, LogType::DB ) ) return false;
        if( !is_array( LogType::DB[ $event ] ) ) return boolval( LogType::DB[ $event ] );

        if( !is_object( $item ) ) return false;
        return in_array( get_class( $item ), LogType::DB[ $event ] );
    }

    public static function log( string $event, Model $item = NULL, ?string $field = '', $oldValue = NULL, $newValue = NULL ) {
        if( !$field )
            $field = '';
        if( self::shouldILogToDB( $event, $item ) ) {
            LogControllerDB::echo( $event, $item, $field, $oldValue, $newValue );
        } else {
            LogControllerFile::debug( $event, [ 'item' => $item, 'field' => $field, 'oldValue' => $oldValue, 'newValue' => $newValue ] );
        }
    }

    public static function error( string $event, $params ) {
        LogControllerFile::error( $event, $params );
    }
    
    public static function debug( string $event, $params ) {
        LogControllerFile::debug( $event, $params );
    }
    
    public static function stringify($object)
    {
        if (is_array($object)) {
            $output = "[ ";
            foreach ($object as $key => $value) {
                if (is_numeric($key))
                    $output .= self::stringify($value) . " | ";
                else
                    $output .= $key . " => " . self::stringify($value) . " | ";
            }
            return rtrim(rtrim($output, " "), "|") . "]";
        }
        if( is_null( $object ) )
            return '';
        if( is_object( $object ) )
            if( method_exists( $object, 'logify' ) )
                return $object->logify();
        return $object;
    }
}
