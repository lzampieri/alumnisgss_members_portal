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
use App\Models\LoginMethod;
use App\Models\Permalink;
use App\Models\Permission;
use App\Models\Ratification;
use App\Models\Resource;
use App\Models\Role;
use App\Models\Stamp;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class LogType {
    const DB = [
        LogEvents::CREATE => [
            Alumnus::class, Document::class, DynamicPermission::class,
            External::class, LoginMethod::class, Ratification::class,
            Resource::class, Permission::class, Role::class, ADetail::class, ADetailsType::class,
            Permalink::class, File::class, Stamp::class ],
        LogEvents::RESTORED => [
            Alumnus::class, Document::class, DynamicPermission::class,
            External::class, LoginMethod::class, Ratification::class,
            Resource::class, Permission::class, Role::class, ADetail::class, ADetailsType::class,
            Permalink::class, File::class, Stamp::class ],
        LogEvents::UPDATE => [
            Alumnus::class, Document::class, DynamicPermission::class,
            External::class, LoginMethod::class, Ratification::class,
            Resource::class, Permission::class, Role::class, ADetail::class, ADetailsType::class,
            Permalink::class, File::class, Stamp::class ],
        LogEvents::DELETE => [
            Alumnus::class, Document::class, DynamicPermission::class,
            External::class, LoginMethod::class, Ratification::class,
            Resource::class, Permission::class, Role::class, ADetail::class, ADetailsType::class,
            Permalink::class, File::class, Stamp::class ],
        LogEvents::DOWNLOADED_DETAILS => True,
        LogEvents::DOWNLOADED_SCHEMA => True,
        LogEvents::LOGIN => True,
        LogEvents::PERMISSION_GIVEN => True,
        LogEvents::PERMISSION_REVOKEN => True,
        LogEvents::ROLE_GIVEN => True,
        LogEvents::ROLE_REVOKEN => True
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
        if ($object instanceof LoginMethod)
            return $object->credential . " (" . $object->driver . ")";
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
        return $object;
    }
}
