<?php

namespace App\Models;

class Alumnus extends Identity
{
    // Available status
    const HasRight = 0;
    const HasntRight = 1;
    const Candidate = 2;
    const Member = 3;
    const Dead = 4;
    const Disallow = 5;
    const StudentMember = 6;
    const StudentNotMember = 7;
    const names = [ 'Avente diritto', 'Non avente diritto', 'Da ratificare', 'Socio', 'Deceduto', 'Rifiuta', 'Studente socio', 'Studente non socio' ];


    protected $fillable = [
        'name',
        'surname',
        'coorte',
        'status'
    ];
}
