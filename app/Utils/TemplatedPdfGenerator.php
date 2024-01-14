<?php

namespace App\Utils;

use Illuminate\Support\Facades\Auth;
use setasign\Fpdi\Tcpdf\Fpdi;

class TemplatedPdfGenerator extends Fpdi
{
    private $layout;
    public $fontSize = 12;
    public $lineHeight = 6;
    public $enqueued = "";


    public function __construct()
    {
        parent::__construct();

        $this->setSourceFile(storage_path() . '/app/utils/CartaIntestata.pdf');
        $this->layout = $this->importPage(1);

        parent::setMargins(20, 40, 20, true);
        $this->SetAutoPageBreak(true, 30);

        $this->setFont('Times', '', $this->fontSize);

        $this->setPrintHeader(false);
        $this->setPrintFooter(true);
    }

    public function AddPage($orientation = '', $format = '', $keepmargins = false, $tocpage = false)
    {
        parent::AddPage($orientation, $format, $keepmargins, $tocpage);

        $this->useTemplate($this->layout);
    }

    public function HTMLhere($content, $align = 'J')
    {
        $this->writeHTMLCell(0, 0, null, null, $content, 0, 0, false, true, $align);
        $this->Ln();
    }

    public function spacing($size = 1)
    {
        $this->Ln($this->lineHeight * $size);
    }

    public function HTMLenqueue($content)
    {
        $this->enqueued .= $content;
    }

    public function HTMLflush($align = 'J')
    {
        $this->HTMLhere($this->enqueued, $align);
        $this->enqueued = "";
    }

    public function Footer()
    {
        $this->SetXY(0, -28);
        $this->setFont('Times', '', $this->fontSize * 0.8);
        $this->SetTextColor( 156, 163, 175);
        $this->Cell(0, 7, 'Documento prodotto il ' . date('d/m/Y') . ' tramite il Portale Soci da ' . Auth::user()->identity->surnameAndName(), 0, 0, 'C');
    }
}
