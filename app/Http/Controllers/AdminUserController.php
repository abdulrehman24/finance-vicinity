<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function data(Request $request)
    {
        $draw = (int) ($request->input('draw', 1));
        $start = (int) ($request->input('start', 0));
        $length = (int) ($request->input('length', 10));
        $search = (string) ($request->input('search.value', ''));

        $q = User::query()->where('role', 'admin');
        $recordsTotal = (int) (clone $q)->count();
        if ($search !== '') {
            $q->where(function($qq) use ($search) {
                $qq->where('email', 'like', "%$search%")
                   ->orWhere('name', 'like', "%$search%");
            });
        }
        $recordsFiltered = (int) (clone $q)->count();
        $rows = $q->orderBy('id', 'desc')->skip($start)->take($length)->get(['id','name','email','role','created_at']);

        $data = $rows->map(function($u){
            return [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'created_at' => $u->created_at->toDateTimeString(),
            ];
        });

        return response()->json([
            'draw' => $draw,
            'recordsTotal' => $recordsTotal,
            'recordsFiltered' => $recordsFiltered,
            'data' => $data,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate(['email' => ['required','email']]);
        $email = (string) $request->input('email');
        $name = (string) $request->input('name', '');
        $user = User::firstOrCreate(['email' => $email], [
            'name' => $name !== '' ? $name : explode('@', $email)[0],
            'password' => '',
            'role' => 'admin',
        ]);
        if ($user->role !== 'admin') {
            $user->role = 'admin';
            $user->save();
        }
        return response()->json(['success' => true, 'id' => $user->id]);
    }

    public function destroy(User $user)
    {
        if ($user->role !== 'admin') {
            return response()->json(['success' => true]);
        }
        $user->role = 'user';
        $user->save();
        return response()->json(['success' => true]);
    }
}

