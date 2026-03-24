<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('race_streamer', function (Blueprint $table) {
            $table->foreignId('race_id')->constrained()->cascadeOnDelete();
            $table->foreignId('streamer_id')->constrained()->cascadeOnDelete();
            $table->primary(['race_id', 'streamer_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('race_streamer');
    }
};
