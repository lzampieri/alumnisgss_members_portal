<?php

namespace App\Http\Controllers;

use App\Models\AwsSession;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AwsSessionController extends Controller
{
    public function list()
    {
        $this->authorize('viewAny', AwsSession::class);

        return Inertia::render(
            'AwsSessions/List',
            [
                'sessions' => AwsSession::orderBy('starttime')->get()->groupBy(['month', 'day']),
                'count' => AwsSession::count()
            ]
        );
    }

    public function start(int $id)
    {
        $this->authorize('create', AwsSession::class);

        // Check for irregularities
        $lastSession = AwsSession::where(['aws_ref' => $id, 'ip' => request()->ip()])->latest()->first();
        if ($lastSession && is_null($lastSession->endtime)) {
            LogController::error('Starting a session with another one in progress!', ['oldSession' => $lastSession]);
            # Todo add email to webmaster
        }

        $newSession = AwsSession::create([
            'aws_ref' => $id,
            'ip' => request()->ip(),
            'starttime' => now()
        ]);
        return response('');
    }

    public function end(int $id)
    {
        $this->authorize('create', AwsSession::class);

        // Check for last session
        $lastSession = AwsSession::where(['aws_ref' => $id, 'ip' => request()->ip()])->latest()->first();
        if ($lastSession && is_null($lastSession->endtime)) {
            $lastSession->endtime = now();
            $lastSession->save();
        } else {
            LogController::error('Ending a non-existing session', ['aws_id' => $id, 'ip' => request()->ip()]);
            # Todo add email to webmaster
        }

        return response('');
    }
}
