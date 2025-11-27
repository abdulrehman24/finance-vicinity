import React from 'react'
import AppLayout from '../Layouts/AppLayout'
import { Link, router } from '@inertiajs/react'
import { useDropzone } from 'react-dropzone'
import { FiUpload, FiAlertCircle, FiCheckCircle, FiFileText, FiImage, FiEdit2, FiX, FiCheck, FiPlus } from 'react-icons/fi'
import axios from 'axios'

export default function DocumentUpload() {
  const [uploadedFiles, setUploadedFiles] = React.useState([])
  const [selectedDocType, setSelectedDocType] = React.useState('')
  const [editingFileId, setEditingFileId] = React.useState(null)
  const currentType = typeof window !== 'undefined' ? localStorage.getItem('current_document_type') || 'invoice' : 'invoice'

  function inferTypeFromName(name) {
    const n = name.toLowerCase()
    if (n.includes('quotation') || n.includes('quote') || n.includes('agreement') || n.includes('talent')) return 'quotation'
    if (n.includes('invoice')) return 'invoice'
    if (n.includes('receipt')) return 'receipt'
    return selectedDocType || currentType
  }

  const onDrop = React.useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      assignedType: inferTypeFromName(file.name),
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    }))
    setUploadedFiles(prev => {
      const merged = [...prev, ...newFiles]
      persistUploads(merged)
      try {
        const form = new FormData()
        newFiles.forEach(f => {
          form.append('files[]', f.file)
          form.append('assignedTypes[]', f.assignedType)
        })
        axios.post('/drafts/files', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      } catch(e){}
      return merged
    })
  }, [selectedDocType, currentType])

  React.useEffect(() => {
    (async () => {
      try {
        const resp = await axios.get('/drafts/me')
        const d = resp.data?.draft
        if (d && d.current_step >= 2 && Array.isArray(d.files)) {
          const existing = d.files.map(f => ({
            id: Date.now() + Math.random(),
            file: { type: f.type },
            name: f.name,
            size: f.size,
            type: f.type,
            assignedType: f.assignedType,
            preview: null,
          }))
          setUploadedFiles(existing)
        }
      } catch(e) {}
    })()
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'], 'application/pdf': ['.pdf'] },
    maxSize: 10 * 1024 * 1024,
  })

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  function removeFile(id) {
    setUploadedFiles(prev => {
      const filtered = prev.filter(f => f.id !== id)
      persistUploads(filtered)
      try { axios.post('/drafts/files', { files: filtered.map(f => ({ name: f.name, size: f.size, type: f.type, assignedType: f.assignedType })) }) } catch(e){}
      return filtered
    })
  }

  function getRequiredDocuments() {
    switch (currentType) {
      case 'invoice':
        return [
          { name: 'Invoice Document', type: 'invoice', required: true },
        ]
      case 'tr':
        return [
          { name: 'Talent Release Form', type: 'tr', required: true },
        ]
      case 'receipt':
        return [
          { name: 'Receipt Document', type: 'receipt', required: true },
        ]
      default:
        return [
          { name: 'Document', type: currentType, required: true },
        ]
    }
  }

  function getAllDocumentTypes() {
    const base = [
      { value: 'invoice', label: 'Invoice' },
      { value: 'quotation', label: 'Quotation/Service Agreement/Talent Release Form' },
      { value: 'tr', label: 'Talent Release Form' },
      { value: 'receipt', label: 'Receipt' },
      { value: 'supporting', label: 'Supporting Document' },
      { value: 'po', label: 'Purchase Order' },
      { value: 'agreement', label: 'Service Agreement' },
      { value: 'contract', label: 'Contract' },
      { value: 'correspondence', label: 'Email Correspondence' },
      { value: 'certificate', label: 'Certificate' },
      { value: 'other', label: 'Other Document' },
    ]
    const receipts = [
      { value: 'transportation', label: 'Transportation Receipt' },
      { value: 'meals', label: 'Meals Receipt' },
      { value: 'materials', label: 'Materials Receipt' },
      { value: 'equipment', label: 'Equipment Receipt' },
      { value: 'other', label: 'Other Claims/Receipts' },
    ]
    return currentType === 'receipt' ? [...base, ...receipts] : base
  }

  function getFileIcon(fileType) {
    return fileType.startsWith('image/') ? FiImage : FiFileText
  }

  function areRequirementsMet() {
    const required = getRequiredDocuments().map(d => d.type)
    const uploaded = uploadedFiles.map(f => f.assignedType)
    return required.every(req => uploaded.includes(req))
  }

  function getUploadStatus(docType) {
    return uploadedFiles.some(f => fulfills(docType, f.assignedType))
  }

  function fulfills(requiredType, assignedType) {
    if (requiredType === 'quotation') {
      return ['quotation', 'agreement', 'contract', 'po', 'tr'].includes(assignedType)
    }
    if (requiredType === 'receipt') {
      return ['receipt', 'transportation', 'meals', 'materials', 'equipment', 'other'].includes(assignedType)
    }
    return assignedType === requiredType
  }

  function getDocumentTypeLabel(type) {
    const found = getAllDocumentTypes().find(t => t.value === type)
    return found ? found.label : type
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/finance-dashboard" className="text-vicinity-text/60 hover:text-vicinity-text">← Back to Dashboard</Link>
          <h1 className="text-3xl font-bold text-vicinity-text mt-2">New Submission</h1>
          <p className="text-vicinity-text/60">Submit your documents for approval</p>
        </div>
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            {[
              { num: 1, label: 'Details', status: 'done' },
              { num: 2, label: 'Upload', status: 'active' },
              { num: 3, label: 'Verify', status: 'pending' },
              { num: 4, label: 'Review', status: 'pending' },
            ].map((s, idx, arr) => (
              <React.Fragment key={s.num}>
                <div className="flex items-center min-w-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${s.status === 'done' || s.status === 'active' ? 'bg-vicinity-text text-vicinity-bg' : 'bg-vicinity-input text-vicinity-text/50'}`}>{s.num}</div>
                  <span className={`ml-2 text-sm ${s.status === 'done' || s.status === 'active' ? 'text-vicinity-text' : 'text-vicinity-text/50'}`}>{s.label}</span>
                </div>
                {idx < arr.length - 1 && (
                  <div className={`h-0.5 flex-1 ${idx < 1 ? 'bg-vicinity-text' : 'bg-vicinity-input'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="bg-vicinity-card rounded-xl shadow-lg border border-vicinity-text/10 p-8 space-y-6">
          <div className="bg-vicinity-input/30 rounded-lg border border-vicinity-text/10 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                {areRequirementsMet() ? (
                  <FiCheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <FiAlertCircle className="w-4 h-4 text-yellow-300" />
                )}
                <h4 className="font-medium text-vicinity-text">Required Documents</h4>
              </div>
            </div>
            <div className="space-y-2">
              {getRequiredDocuments().map((doc, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-vicinity-text/70">{doc.name}</span>
                  <span className={`flex items-center space-x-1 text-sm ${getUploadStatus(doc.type) ? 'text-green-400' : 'text-yellow-300'}`}>
                    {getUploadStatus(doc.type) ? <FiCheckCircle className="w-3 h-3" /> : <FiAlertCircle className="w-3 h-3" />}
                    <span>{getUploadStatus(doc.type) ? 'Assigned' : 'Required'}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-vicinity-input/20 rounded-lg border border-vicinity-text/10 p-4">
            <div className="flex items-center space-x-2 mb-2">
              <FiPlus className="w-4 h-4 text-vicinity-text/60" />
              <h4 className="font-medium text-vicinity-text">Optional Documents</h4>
            </div>
            <p className="text-sm text-vicinity-text/60">You can also upload supporting documents like receipts, correspondence, certificates, etc.</p>
          </div>

          <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-8 text-center ${isDragActive ? 'border-vicinity-text' : 'border-vicinity-text/30'} cursor-pointer transition-all`}>
            <input {...getInputProps()} />
            <div className="w-16 h-16 bg-vicinity-input rounded-full flex items-center justify-center mx-auto mb-4 border border-vicinity-text/20">
              <FiUpload className="w-8 h-8 text-vicinity-text" />
            </div>
            <h3 className="text-lg font-medium text-vicinity-text">Upload Documents</h3>
            <p className="text-vicinity-text/60">Drag & drop files here, or click to select files</p>
            <p className="text-sm text-vicinity-text/40 mt-2">Supports PDF and images only (max 10MB each)</p>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-vicinity-text">Uploaded Files ({uploadedFiles.length})</h4>
              <div className="space-y-3">
                {uploadedFiles.map((fileItem) => {
                  const Icon = getFileIcon(fileItem.type)
                  return (
                    <div key={fileItem.id} className="border border-vicinity-text/10 rounded-lg p-4 bg-vicinity-input/20">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="flex-shrink-0">
                            {fileItem.preview ? (
                              <img src={fileItem.preview} alt={fileItem.name} className="w-12 h-12 object-cover rounded border border-vicinity-text/20" />
                            ) : (
                              <div className="w-12 h-12 bg-vicinity-bg rounded flex items-center justify-center border border-vicinity-text/20">
                                <Icon className="w-6 h-6 text-vicinity-text" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-vicinity-text truncate max-w-xs">{fileItem.name}</p>
                            <p className="text-xs text-vicinity-text/60 mb-2">{formatFileSize(fileItem.size)}</p>
                            <div className="flex items-center space-x-2">
                              {editingFileId === fileItem.id ? (
                                <select value={fileItem.assignedType} onChange={(e)=>{
                                  const val = e.target.value
                                  setUploadedFiles(prev => {
                                    const updated = prev.map(f => f.id === fileItem.id ? { ...f, assignedType: val } : f)
                                    persistUploads(updated)
                                    try { axios.post('/drafts/files', { files: updated.map(f => ({ name: f.name, size: f.size, type: f.type, assignedType: f.assignedType })) }) } catch(e){}
                                    return updated
                                  })
                                  setEditingFileId(null)
                                }} className="flex-1 px-2 py-1 bg-vicinity-input border border-vicinity-text/20 rounded text-sm text-vicinity-text">
                                  {getAllDocumentTypes().map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                  ))}
                                </select>
                              ) : (
                                <div className="flex items-center space-x-2">
                                  <span className="px-2 py-1 bg-vicinity-text/10 rounded text-xs text-vicinity-text border border-vicinity-text/20">{getDocumentTypeLabel(fileItem.assignedType)}</span>
                                  <button onClick={()=>setEditingFileId(fileItem.id)} className="text-vicinity-text/60 hover:text-vicinity-text p-1"><FiEdit2 className="w-3 h-3" /></button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-3">
                          <div className="text-green-400"><FiCheck className="w-4 h-4" /></div>
                          <button onClick={()=>removeFile(fileItem.id)} className="text-red-400 hover:text-red-300 p-1"><FiX className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {!areRequirementsMet() && uploadedFiles.length > 0 && (
            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-sm text-yellow-200">
                <FiAlertCircle className="w-4 h-4" />
                <span>Please assign all required document types to continue</span>
              </div>
            </div>
          )}

          {uploadedFiles.length > 0 && (
            <div className="bg-vicinity-input/30 rounded-lg border border-vicinity-text/10 p-4">
              <h4 className="font-medium text-vicinity-text mb-3">Document Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Array.from(new Set(uploadedFiles.map(f => f.assignedType))).map(type => {
                  const count = uploadedFiles.filter(f => f.assignedType === type).length
                  const isRequired = getRequiredDocuments().some(doc => doc.type === type)
                  return (
                    <div key={type} className="flex items-center justify-between text-sm">
                      <span className={`text-vicinity-text/70 ${isRequired ? 'font-medium' : ''}`}>{getDocumentTypeLabel(type)}</span>
                      <span className={`px-2 py-1 rounded text-xs ${isRequired ? 'bg-green-900/30 text-green-300' : 'bg-vicinity-text/10 text-vicinity-text/60'}`}>{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <button onClick={()=>router.visit('/submit')} className="px-4 py-3 border border-vicinity-text/20 rounded-lg text-vicinity-text font-medium hover:bg-vicinity-hover/20">Back</button>
            <button disabled={!areRequirementsMet()} onClick={()=>{
              localStorage.setItem('vicinity_uploaded_files', JSON.stringify(uploadedFiles.map(f => ({ name: f.name, size: f.size, type: f.type, assignedType: f.assignedType }))))
              router.visit('/ocr')
            }} className={`bg-vicinity-text text-vicinity-bg py-3 px-4 rounded-lg font-bold hover:bg-white ${!areRequirementsMet() ? 'opacity-50 cursor-not-allowed' : ''}`}>Continue to OCR Verification</button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
  function persistUploads(files) {
    const payload = files.map(f => ({ name: f.name, size: f.size, type: f.type, assignedType: f.assignedType }))
    if (typeof window !== 'undefined') {
      localStorage.setItem('vicinity_uploaded_files', JSON.stringify(payload))
    }
  }
