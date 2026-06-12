<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->boolean('is_deposit')->default(false)->after('notes');
            $table->decimal('deposit_amount', 12, 2)->nullable()->after('is_deposit');
            $table->decimal('remaining_amount', 12, 2)->default(0)->after('deposit_amount');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['is_deposit', 'deposit_amount', 'remaining_amount']);
        });
    }
};
