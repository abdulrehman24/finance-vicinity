<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Producer;
use Yajra\DataTables\Facades\DataTables;

class ProducerController extends Controller
{
    public function list(Request $request)
    {
        $items = Producer::query()->where('status', 'active')->orderBy('email')->get(['id','email','status']);
        return response()->json(['success' => true, 'items' => $items]);
    }

    public function data(Request $request)
    {
        $query = Producer::query();
        $val = (string) ($request->input('search.value') ?? '');
        if ($val !== '') {
            $query->where(function($q) use ($val){
                $q->where('email', 'like', "%$val%")
                  ->orWhere('status', 'like', "%$val%")
                  ->orWhere('id', 'like', "%$val%");
            });
        }
        return DataTables::eloquent($query)
            ->editColumn('created_at', function($row){
                return $row->created_at ? $row->created_at->format('d M Y, h:i A') : '';
            })
            ->toJson();
    }

    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:producers,email',
            'status' => 'required|string'
        ]);
        $item = Producer::create([
            'email' => $request->input('email'),
            'status' => $request->input('status')
        ]);
        return response()->json(['success' => true, 'item' => $item]);
    }

    public function update(Request $request, Producer $producer)
    {
        $request->validate([
            'email' => 'required|email|unique:producers,email,' . $producer->id,
            'status' => 'required|string'
        ]);
        $producer->email = $request->input('email');
        $producer->status = $request->input('status');
        $producer->save();
        return response()->json(['success' => true]);
    }

    public function destroy(Request $request, Producer $producer)
    {
        $producer->delete();
        return response()->json(['success' => true]);
    }
}
