<?php

// This class is kept only for storing constants useful for alumnus

namespace App\Models;

abstract class Alumnus
{
    // Available status
    const status = [
        'member',
        'student_member',
        'pre_enrolled',
        'not_reached',
        'student_not_reached',
        'student_not_agreed',
        'hasnt_right',
        'dead',
        'not_agreed',
        'honorary'
    ];
    // Public visible status
    const public_status = ['member', 'student_member', 'pre_enrolled'];

    // Status for which entering or exiting required ratification
    const require_ratification = ['member', 'student_member', 'honorary'];

    // Assignable status without ratification
    public static function availableStatus(?Person $person = null)
    {
        // THE PERMISSION bypassRatification HAS BEEN REMOVED
        // if (Auth::user()->can('bypassRatification', Alumnus::class))
        //     $availableStatus = Alumnus::status;
        // else
        //     $availableStatus = array_diff(Alumnus::status, Alumnus::require_ratification);
        // if ($alumnus && $alumnus->id && !in_array($alumnus->status, $availableStatus))
        //     $availableStatus[] = $alumnus->status;
        // return array_values($availableStatus);

        // If the alumnus already exists, and it is stucked in a state that requires ratification, it remains there:
        if ($person && $person->id && $person->is_alumnus && in_array($person->status, Alumnus::require_ratification))
            return [$person->status]; // If the alumnus is stucked in a state that requires ratification, it remains there

        // Else, return all applicable status
        // (externals can also switch to all non-rat-requiring status)
        return array_values(array_diff(Alumnus::status, Alumnus::require_ratification));
    }

    // Labels
    const AlumnusStatusLabels = [
        'member' => 'Socio',
        'student_member' => 'Socio studente',
        'pre_enrolled' => 'Preiscritto',
        'not_reached' => 'Non raggiunto',
        'student_not_reached' => 'Studente non raggiunto',
        'student_not_agreed' => 'Studente rifiutante',
        'hasnt_right' => 'Non avente diritto',
        'dead' => 'Deceduto',
        'not_agreed' => 'Rifiutante',
        'honorary' => 'Socio onorario'
    ];
    // Colors ( for export xlsx )
    const AlumnusStatusColors = [
        'member' => '00CC00',
        'student_member' => '00FF99',
        'pre_enrolled' => '00FFFF',
        'not_reached' => 'FFFF00',
        'student_not_reached' => 'FF9900',
        'student_not_agreed' => 'FF0000',
        'hasnt_right' => 'FF00FF',
        'dead' => '003300',
        'not_agreed' => 'FF0000',
        'honorary' => '00CC00',
    ];
}
