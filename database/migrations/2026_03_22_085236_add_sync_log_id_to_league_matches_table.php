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
        Schema::table('league_matches', function (Blueprint $table) {
            $table->foreignId('sync_log_id')->nullable()->after('league_account_id')->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('league_matches', function (Blueprint $table) {
            $table->dropConstrainedForeignId('sync_log_id');
        });
    }
};
