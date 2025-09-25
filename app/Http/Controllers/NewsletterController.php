<?php

namespace App\Http\Controllers;

use App\Models\Newsletter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class NewsletterController extends Controller
{
    public function list()
    {
        if (Auth::user()->can('viewAll', Newsletter::class)) {
            $newsletters = Newsletter::with('owner')->get();
        } else {
            $newsletters = Auth::user()->newsletters()->with('owner')->get();
        }

        return Inertia::render(
            'Newsletter/List',
            [
                'list' => $newsletters,
                'canCreate' => Auth::user()->can('create', Newsletter::class)
            ]
        );
    }

    public function create()
    {
        $this->authorize('create', Newsletter::class);

        $newletter = new Newsletter();
        $newletter->owner()->associate(Auth::user());
        $newletter->save();

        return redirect()->route('newsletter.edit', ['newsletter' => $newletter->id]);
    }

    public function edit(Newsletter $newsletter)
    {
        $this->authorize('edit', $newsletter);

        return Inertia::render(
            'Newsletter/Edit',
            [
                'newsletter' => $newsletter
            ]
        );
    }

    public function edit_post(Newsletter $newsletter, Request $request)
    {
        $this->authorize('edit', $newsletter);

        $validated = $request->validate([
            'subject' => 'required|email',
            'to' => 'required|array',
            'to.*' => 'required|email',
            'body' => 'required'
        ], [
            'to.*.email' => ':input non è un indirizzo email valido '
        ]);

        $newsletter->subject = $validated['subject'];
        $newsletter->to = $validated['to'];
        $newsletter->body = $validated['body'];
        $newsletter->save();

        return redirect()->back()->with('notistack', ['success', 'Bozza salvata']);
    }
}
