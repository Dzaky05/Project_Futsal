<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        \Illuminate\Support\Facades\DB::table('operational_hours')->truncate();

        Schema::table('operational_hours', function (Blueprint $table) {
            // Drop foreign key first to allow index deletion
            $table->dropForeign(['field_id']);
            
            // Drop old unique constraint and column
            $table->dropUnique(['field_id', 'day_of_week']);
            $table->dropColumn('day_of_week');

            // Add new column and unique constraint
            $table->date('date')->after('field_id');
            $table->unique(['field_id', 'date']);
            
            // Re-add foreign key
            $table->foreign('field_id')->references('id')->on('fields')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('operational_hours', function (Blueprint $table) {
            // Revert changes
            $table->dropUnique(['field_id', 'date']);
            $table->dropColumn('date');
            
            $table->tinyInteger('day_of_week')->after('field_id');
            $table->unique(['field_id', 'day_of_week']);
        });
    }
};
