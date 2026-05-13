<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('operational_hours', function (Blueprint $table) {
            $table->id();
            $table->foreignId('field_id')->constrained('fields')->onDelete('cascade');
            $table->tinyInteger('day_of_week'); // 0=Sunday, 1=Monday, ..., 6=Saturday
            $table->time('open_time');
            $table->time('close_time');
            $table->boolean('is_open')->default(true);
            $table->timestamps();

            $table->unique(['field_id', 'day_of_week']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('operational_hours');
    }
};
