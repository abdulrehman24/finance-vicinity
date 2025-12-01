<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Company;
use Yajra\DataTables\Facades\DataTables;

class CompanyController extends Controller
{
    public function list(Request $request)
    {
        $items = Company::query()->where('status', 'active')->orderBy('name')->get(['id','name','status']);
        return response()->json(['success' => true, 'items' => $items]);
    }

    public function data(Request $request)
    {
        $query = Company::query();
        $val = (string) ($request->input('search.value') ?? '');
        if ($val !== '') {
            $query->where(function($q) use ($val){
                $q->where('name', 'like', "%$val%")
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
            'name' => 'required|string|unique:companies,name',
            'status' => 'required|string'
        ]);
        $item = Company::create([
            'name' => $request->input('name'),
            'status' => $request->input('status')
        ]);
        return response()->json(['success' => true, 'item' => $item]);
    }

    public function update(Request $request, Company $company)
    {
        $request->validate([
            'name' => 'required|string|unique:companies,name,' . $company->id,
            'status' => 'required|string'
        ]);
        $company->name = $request->input('name');
        $company->status = $request->input('status');
        $company->save();
        return response()->json(['success' => true]);
    }

    public function destroy(Request $request, Company $company)
    {
        $company->delete();
        return response()->json(['success' => true]);
    }
}

