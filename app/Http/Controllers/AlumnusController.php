<?php

namespace App\Http\Controllers;

use App\Models\ADetailsType;
use App\Models\Alumnus;
use App\Models\Person;
use App\Models\Ratification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AlumnusController extends Controller
{

    // Specific tools for alumnus, like the members list and the members schema

    public function membersList()
    {
        $this->authorize('viewPublicStatus', Person::class);

        $data = Person::where('coorte', '>', 0)
            ->whereIn('status', Alumnus::public_status)
            ->orderBy('coorte')
            ->orderBy('surname')->orderBy('name')
            ->get()
            ->groupBy('coorte');
        $counts = Person::where('coorte', '>', 0)
            ->select('status', DB::raw('COUNT(*) as count'))
            ->whereIn('status', Alumnus::public_status)
            ->groupBy('status')
            ->pluck('count', 'status');

        return Inertia::render('Members/List', ['data' => $data, 'counts' => $counts]);
    }

    public function membersCounters()
    {
        $this->authorize('viewPublicStatus', Person::class);

        $members = Person::where('coorte', '>', 0)->where('status', 'member')->count();
        $students = Person::where('coorte', '>', 0)->where('status', 'student_member')->count();

        return response()->json([
            'members' => $members,
            'student_members' => $students
        ]);
    }

    private function commonRegistryParams()
    {
        return [
            'canImport' => Auth::user()->can('import', Person::class),
        ];
    }

    public function schema()
    {
        $this->authorize('viewAnyAlumnus', Person::class);

        $data = Person::where('coorte', '>', 0)
            ->orderBy('coorte')
            ->orderBy('surname')->orderBy('name')
            ->get()
            ->append('pending_ratifications_count')
            ->groupBy('coorte');

        return Inertia::render(
            'Members/Schema',
            [
                'data' => $data,
            ] + $this->commonRegistryParams()
        );
    }

    public function table()
    {
        $this->authorize('viewAnyAlumnus', Person::class);

        $alumni = Person::where('coorte', '>', 0)
            ->orderBy('coorte')
            ->orderBy('surname')->orderBy('name')
            ->get()
            ->append('a_details_keyd')
            ->append('pending_ratifications_count');
        $adtlist = ADetailsType::allOrdered();

        return Inertia::render(
            'Members/Table',
            [
                'data' => $alumni,
                'adtlist' => $adtlist,
            ] + $this->commonRegistryParams()
        );
    }
}
