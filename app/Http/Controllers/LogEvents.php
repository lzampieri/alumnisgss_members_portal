<?php

namespace App\Http\Controllers;

class LogEvents {
    const CREATE = 'create';
    const RESTORED = 'restored';
    const UPDATE = 'update';
    const DELETE = 'delete';

    const DOWNLOADED_SCHEMA = 'downloaded_alumni_schema';
    const DOWNLOADED_DETAILS = 'downloaded_alumni_details';
    const DOWNLOADED_FILE = 'downloaded_file';
    const DOWNLOADED_RATIFICATIONSLIST = 'downloaded_ratifications_list';

    const LOGIN = 'login';
    const MAIL_SENT = 'mail_sent';
}