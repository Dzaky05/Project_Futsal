<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

// Jalur ini lebih bebas (tanpa CSRF)
Route::post('/register', function (Request $request) {
    return User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => Hash::make($request->password),
    ]);
});

Route::post('/login', function (Request $request) {
    $user = User::where('email', $request->email)->first();
    if ($user && Hash::check($request->password, $user->password)) {
        return response()->json($user);
    }
    return response()->json(['message' => 'Gagal'], 401);
});