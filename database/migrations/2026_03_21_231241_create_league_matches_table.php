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
        Schema::create('league_matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('league_account_id')->constrained()->cascadeOnDelete();
            $table->string('match_id');
            $table->json('data');
            $table->json('rank_snapshot')->nullable();
            $table->boolean('is_win')->nullable();
            $table->boolean('is_finished')->default(false);
            $table->datetime('game_start_at')->nullable();
            $table->datetime('game_end_at')->nullable();
            $table->timestamps();

            $table->unique(['league_account_id', 'match_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('league_matches');
    }
};
