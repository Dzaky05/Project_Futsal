<?php

namespace App\Http\Controllers;

use App\Models\Field;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FieldController extends Controller
{
    public function index()
    {
        $fields = Field::where('is_active', true)
            ->with('operationalHours')
            ->get();

        return response()->json($fields);
    }

    public function all()
    {
        $fields = Field::with('operationalHours')->get();
        return response()->json($fields);
    }

    public function show($id)
    {
        $field = Field::with('operationalHours')->findOrFail($id);
        return response()->json($field);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price_per_hour' => 'required|numeric|min:0',
            'facilities' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $field = Field::create($request->only([
            'name', 'description', 'price_per_hour', 'facilities', 'is_active'
        ]));

        return response()->json([
            'message' => 'Lapangan berhasil ditambahkan!',
            'field' => $field,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $field = Field::findOrFail($id);

        $request->validate([
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'price_per_hour' => 'numeric|min:0',
            'facilities' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $field->update($request->only([
            'name', 'description', 'price_per_hour', 'facilities', 'is_active'
        ]));

        return response()->json([
            'message' => 'Lapangan berhasil diperbarui!',
            'field' => $field,
        ]);
    }

    public function uploadImage(Request $request, $id)
    {
        $field = Field::findOrFail($id);

        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        // Delete old image if exists
        if ($field->image) {
            Storage::disk('public')->delete($field->image);
        }

        $path = $request->file('image')->store('fields', 'public');
        $field->update(['image' => $path]);

        return response()->json([
            'message' => 'Gambar lapangan berhasil diupload!',
            'image_url' => Storage::url($path),
            'field' => $field,
        ]);
    }

    public function destroy($id)
    {
        $field = Field::findOrFail($id);

        if ($field->image) {
            Storage::disk('public')->delete($field->image);
        }

        $field->delete();

        return response()->json([
            'message' => 'Lapangan berhasil dihapus!',
        ]);
    }
}
