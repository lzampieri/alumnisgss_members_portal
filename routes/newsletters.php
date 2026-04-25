<?php

use App\Http\Controllers\FileController;
use App\Http\Controllers\NewsletterController;
use App\Http\Controllers\MailingListController;
use Illuminate\Support\Facades\Route;

Route::prefix('/newsletters')->group( function () {
    Route::get('/', [ NewsletterController::class, 'list' ] )->name('newsletters');
    Route::get('/all', [ NewsletterController::class, 'listAll' ] )->name('newsletters.listAll');

    Route::get('/create', [ NewsletterController::class, 'create' ] )->name('newsletter.create');
    
    Route::get('/edit/{newsletter}', [ NewsletterController::class, 'edit' ] )->name('newsletter.edit');
    Route::post('/edit/{newsletter}', [ NewsletterController::class, 'edit_post' ] );
    Route::post('/uploadAttachments/{newsletter}', [ NewsletterController::class, 'uploadAttachments' ] )->name('newsletter.uploadAttachments');
    Route::get('/attachment/{id}', [ FileController::class, 'fromId' ] )->name('newsletter.attachment');
    
    Route::get('/preview/{newsletter}', [ NewsletterController::class, 'preview' ] )->name('newsletter.preview');
    Route::post('/preview/{newsletter}', [ NewsletterController::class, 'preview_post' ] );

    Route::get('/media/{handle}', [ NewsletterController::class, 'media' ] )->name('newsletter.media');
    Route::post('/media', [ NewsletterController::class, 'upload_img' ] )->name('newsletter.upload_img');
    
    Route::get('/send/{newsletter}', [ NewsletterController::class, 'send' ] )->name('newsletter.send');
    Route::get('/sendSMTP/{newsletter}', [ NewsletterController::class, 'sendSMTP' ] )->name('newsletter.sendSMTP');
    Route::get('/cronjob', [ NewsletterController::class, 'smtpCallback' ] );

    Route::get('/view/{newsletter}', [ NewsletterController::class, 'view' ] )->name('newsletter.view');

    Route::prefix('/mailinglist')->group( function () {
        Route::get('/', [ MailingListController::class, 'list' ] )->name('mailinglist');
        Route::get('/edit/{ml?}', [MailingListController::class, 'edit'])->name('mailinglist.edit');
        Route::post('/edit/{ml?}', [MailingListController::class, 'edit_post']);
        Route::get('/download/{ml?}', [ MailingListController::class, 'download' ] )->name('mailinglist.download');
    });
});