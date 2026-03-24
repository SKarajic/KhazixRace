<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('league_matches', function (Blueprint $table) {
            $table->dropColumn('rank_snapshot');
            $table->string('tier')->nullable()->after('data');
            $table->string('rank')->nullable()->after('tier');
            $table->unsignedInteger('points')->nullable()->after('rank');
        });
    }

    public function down(): void
    {
        Schema::table('league_matches', function (Blueprint $table) {
            $table->dropColumn(['tier', 'rank', 'points']);
            $table->json('rank_snapshot')->nullable();
        });
    }
};
