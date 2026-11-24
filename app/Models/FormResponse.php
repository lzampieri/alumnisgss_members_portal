<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FormResponse extends Model
{
    protected $fillable = [
        'data',
        'form_email_to'
    ];

    public function resource()
    {
        return $this->belongsTo(Resource::class);
    }

    public function sender()
    {
        return $this->belongsTo(Person::class);
    }

    public function toHtml()
    {
        $this->load('resource');
        if( !$this->resource )
            return "<b>Impossibile recuperare la risposta</b>";

        $message = "<b>Inviato il:</b>\n";
        $message .= date('d/m/Y H:i') . "\n\n";

        $data = json_decode($this->data, true);

        foreach (json_decode($this->resource['content'], true) as $field) {
            if (array_key_exists("title", $field)) {
                $message .= "<b>" . $field['title'] . "</b>\n";
                if(array_key_exists($field["id"],$data) )
                    $message .= $data[$field["id"]] . "\n\n";
                else
                    $message .= "-\n\n";
            }
        }        

        return $message;
    }
}
