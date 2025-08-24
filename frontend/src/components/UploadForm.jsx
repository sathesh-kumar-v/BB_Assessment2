import { useState } from 'react'
import { uploadDocument, listDocuments } from '../services/documentService'

export default function UploadForm({ setDocuments }) {
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a file')
      return
    }
    const formData = new FormData()
    formData.append('file', file)

    try {
      await uploadDocument(formData)
      const res = await listDocuments()
      setDocuments(res?.docs || [])
      setFile(null)
      setError('')
    } catch (err) {
      setError('Upload failed')
    }
  }

  return (
    <form onSubmit={handleUpload} className="flex flex-col gap-2 mb-4">
      {error && <p className="text-red-500">{error}</p>}
      <input type="file" onChange={handleFileChange} />
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
        Upload
      </button>
    </form>
  )
}
