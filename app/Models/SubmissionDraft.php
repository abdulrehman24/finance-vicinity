<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubmissionDraft extends Model
{
    protected $fillable = [
        'user_email','producer_in_charge','producer_id','bill_to','document_type','receipt_type','project_code','total_amount','status','accepted_by_producer','accepted_by_finance','producer_rejection_reason','finance_rejection_reason','invoice_number','amount_rows','files','combined_invoice_pdf','current_step'
    ];
    protected $casts = [
        'amount_rows' => 'array',
        'files' => 'array',
    ];
}
