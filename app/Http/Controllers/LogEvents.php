<?php

namespace App\Http\Controllers;

class LogEvents {
    const CREATE = 'create';
    const RESTORED = 'restored';
    const UPDATE = 'update';
    const DELETE = 'delete';

    const PERMISSION_GIVEN   = 'permission_given';
    const PERMISSION_REVOKEN = 'permission_revoken';
    const ROLE_GIVEN   = 'role_given';
    const ROLE_REVOKEN = 'role_revoken';

    const DOWNLOADED_SCHEMA = 'downloaded_alumni_schema';
    const DOWNLOADED_DETAILS = 'downloaded_alumni_details';
    const DOWNLOADED_FILE = 'downloaded_file';
    const DOWNLOADED_RATIFICATIONSLIST = 'downloaded_ratifications_list';
    const DOWNLOADED_REPORT = 'downloaded_variations_report';

    const BACKUP_DONE = 'backup_done';

    const LOGIN = 'login';
    const LOGIN_LV2 = 'level 2 login';
    const MAIL_SENT = 'mail_sent';

    const RESOURCE_VIA_MAGICLINK = 'resource_accessed_via_magiclink';
}