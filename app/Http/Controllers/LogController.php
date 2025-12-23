<?php

namespace App\Http\Controllers;

use App\Http\Controllers\LogEvents;
use App\Models\ADetail;
use App\Models\ADetailsType;
use App\Models\Alumnus;
use App\Models\Document;
use App\Models\DynamicPermission;
use App\Models\External;
use App\Models\File;
use App\Models\Email;
use App\Models\Permalink;
use App\Models\Permission;
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
            Alumnus::class, Document::class, DynamicPermission::class,
            External::class, Email::class, Ratification::class,
            Resource::class, Permission::class, Role::class, ADetail::class, ADetailsType::class,
            File::class, Stamp::class, Ticket::class, TicketComment::class ],
        LogEvents::RESTORED => [
            Alumnus::class, Document::class, DynamicPermission::class,
            External::class, Email::class, Ratification::class,
            Resource::class, Permission::class, Role::class, ADetail::class, ADetailsType::class,
            File::class, Stamp::class, Ticket::class, TicketComment::class ],
        LogEvents::UPDATE => [
            Alumnus::class, Document::class, DynamicPermission::class,
            External::class, Email::class, Ratification::class,
            Resource::class, Permission::class, Role::class, ADetail::class, ADetailsType::class,
            File::class, Stamp::class, Ticket::class, TicketComment::class ],
        LogEvents::DELETE => [
            Alumnus::class, Document::class, DynamicPermission::class,
            External::class, Email::class, Ratification::class,
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

        LogEvents::RESOURCE_VIA_MAGICLINK => True,
        LogEvents::FILE_VIA_MAGICLINK => True,
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

    public static function log( string $event, Model $item = NULL, string $field = '', $oldValue = NULL, $newValue = NULL ) {
        if( self::shouldILogToDB( $event, $item ) ) {
            LogControllerDB::echo( $event, $item, $field, $oldValue, $newValue );
        } else {
            LogControllerFile::debug( $event, [ 'item' => $item, 'field' => $field, 'oldValue' => $oldValue, 'newValue' => $newValue ] );
        }
    }

    public static function error( string $event, $params ) {
        LogControllerFile::error( $event, $params );
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
        if ($object instanceof Alumnus)
            return "(" . $object->id . ") " . $object->surname . " "  . $object->name . " (" . $object->coorte . ") [" . $object->status . "]";
        if ($object instanceof External)
            return "(" . $object->id . ") " . $object->surname . " "  . $object->name . " [" . $object->note . "]";
        if ($object instanceof Email)
            return $object->address;
        if ($object instanceof Permission)
            return $object->name;
        if ($object instanceof Role)
            return $object->name;
        if ($object instanceof Ratification)
            return "Ratification of " . $object->alumnus->surnameAndName() . " to " . $object->required_state;
        if ($object instanceof ADetailsType)
            return "ADetail type " . $object->name . " (" . $object->type . ")";
        if ($object instanceof ADetail)
            return "ADetail for " . $object->identity->surnameAndName() . ": " . $object->aDetailsType->name . " => " . json_encode($object->value);
        if ($object instanceof Document)
            return $object->identifier . " (" . $object->protocol . ", " . $object->date . ")";
        if ($object instanceof DynamicPermission)
            return $object->type . " of " . $object->role->name . " for " . Log::stringify($object->permissable);
        if ($object instanceof Resource)
            return "Resource " . $object->title . ": " . json_encode($object->content);
        if ($object instanceof Permalink)
            return "Permalink " . $object->id . " to " . $object->linkable_type . " #" . $object->linkable_id;
        if ($object instanceof File)
            return "File " . $object->handle . " [sha256:" . $object->sha256 . "] belonging to " . Log::stringify($object->parent);
        if ($object instanceof Stamp)
            return "Stamp of " . $object->date . " from " . $object->clockin . " to " . $object->clockout . " ( " . $object->ip . " ) for " . Log::stringify($object->employee);
        if ($object instanceof Ticket)
            return "Ticket #" . $object->id . " opened by " . Log::stringify($object->author) . " - currently  " . $object->status . " - " . json_encode( $object->instance->jsonStrinfigy() );
        if ($object instanceof TicketComment)
            return "Comment on ticket #" . $object->ticket->id . " from " . Log::stringify($object->author) . ":  " . $object->content;
        return $object;
    }
}
