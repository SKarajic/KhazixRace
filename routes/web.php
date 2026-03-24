<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\StreamerController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');
Route::get('/streamers/{streamer}', [StreamerController::class, 'show'])->name('streamers.show');
