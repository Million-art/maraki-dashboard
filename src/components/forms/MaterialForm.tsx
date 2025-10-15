import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload } from 'lucide-react';
import { createMaterialSchema, updateMaterialSchema, type CreateMaterialFormData, type UpdateMaterialFormData } from '../../lib/validations';
import { getErrorMessage } from '../../lib/utils';
import { materialsApi } from '../../services/api';
import { useAppDispatch } from '../../store';
import { addNotification } from '../../store/slices/uiSlice';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface MaterialFormProps {
  initialData?: Partial<CreateMaterialFormData>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

const MaterialForm: React.FC<MaterialFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  mode,
}) => {
  const dispatch = useAppDispatch();
  const schema = mode === 'create' ? createMaterialSchema : updateMaterialSchema;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateMaterialFormData | UpdateMaterialFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData,
  });

  const materialType = watch('type');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && materialType && materialType !== 'link') {
      setSelectedFile(file);
      setUploadedFile(null); // Reset uploaded file
      setUploading(true);
      setUploadProgress(0);
      
      // Clear previous form values
      setValue('fileName', '');
      setValue('fileSize', 0);
      setValue('mimeType', '');
      setValue('filePath', '');
      
      try {
        // Upload file to Cloudinary automatically
        const uploadResult = await materialsApi.uploadFile(file, materialType);
        
        // Set form values with Cloudinary response
        setValue('fileName', uploadResult.original_filename);
        setValue('fileSize', uploadResult.bytes);
        setValue('mimeType', uploadResult.format);
        setValue('filePath', uploadResult.secure_url);
        
        setUploadedFile(uploadResult);
        setUploadProgress(100);
      } catch (error:any) {
        dispatch(addNotification({
          type: 'error',
          title: 'Upload Failed',
          message: `File upload failed: ${error.message || 'Unknown error'}`
        }));
        setSelectedFile(null);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadedFile(null);
    setValue('fileName', '');
    setValue('fileSize', 0);
    setValue('mimeType', '');
    setValue('filePath', '');
  };


  const handleFormSubmit = (data: any) => {
    
    // Validate that file is uploaded for non-link types
    if (data.type !== 'link' && (!uploadedFile || !data.filePath || !data.fileName)) {
      dispatch(addNotification({
        type: 'warning',
        title: 'File Required',
        message: 'Please upload a file before submitting the form.'
      }));
      return;
    }
    
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Material Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Material Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Title"
            {...register('title')}
            error={errors.title?.message}
            placeholder="Enter material title"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              {...register('type')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Select type</option>
              <option value="pdf">PDF Document</option>
              <option value="video">Video</option>
              <option value="image">Image</option>
              <option value="document">Document</option>
              <option value="link">Link</option>
              <option value="presentation">Presentation</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{getErrorMessage(errors.type.message)}</p>
            )}
          </div>
        </div>

        <Input
          label="Description"
          {...register('description')}
          error={errors.description?.message}
          placeholder="Enter material description (optional)"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty
            </label>
            <select
              {...register('difficulty')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Select difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            {errors.difficulty && (
              <p className="mt-1 text-sm text-red-600">{getErrorMessage(errors.difficulty.message)}</p>
            )}
          </div>

          <Input
            label="Category"
            {...register('category')}
            error={errors.category?.message}
            placeholder="Enter category (optional)"
          />
        </div>

        {/* URL for link type materials */}
        {materialType === 'link' && (
          <Input
            label="URL"
            type="url"
            {...register('url')}
            error={errors.url?.message}
            placeholder="https://example.com"
          />
        )}

        {/* File upload for other types */}
        {materialType && materialType !== 'link' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File Upload
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                      accept={
                        materialType === 'pdf' ? '.pdf' :
                        materialType === 'video' ? 'video/*' :
                        materialType === 'image' ? 'image/*' :
                        materialType === 'document' ? '.doc,.docx,.txt' :
                        materialType === 'presentation' ? '.ppt,.pptx' :
                        '*'
                      }
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  {materialType === 'pdf' && 'PDF files only'}
                  {materialType === 'video' && 'Video files (MP4, AVI, etc.)'}
                  {materialType === 'image' && 'Image files (JPG, PNG, etc.)'}
                  {materialType === 'document' && 'Document files (DOC, DOCX, TXT)'}
                  {materialType === 'presentation' && 'Presentation files (PPT, PPTX)'}
                </p>
                
                {/* Upload Progress */}
                {uploading && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-900">📤 Uploading: {selectedFile?.name}</p>
                        <p className="text-xs text-blue-600">
                          Size: {selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(2) : 0} MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleRemoveFile}
                        disabled={uploading}
                      >
                        Cancel
                      </Button>
                    </div>
                    
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Uploaded File Status */}
                {uploadedFile && !uploading && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-900">✅ Uploaded: {uploadedFile.original_filename}</p>
                        <p className="text-xs text-green-600">Ready for submission</p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleRemoveFile}
                      >
                        Change File
                      </Button>
                    </div>
                  </div>
                )}
                
                {materialType && (materialType as string) !== 'link' && !selectedFile && !uploadedFile && !uploading && (
                  <p className="text-sm text-amber-600 mt-2">
                    ⚠️ Please select a file to continue
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={isLoading}
          disabled={uploading || (materialType && materialType !== 'link' && !uploadedFile)}
        >
          {mode === 'create' ? 'Create Material' : 'Update Material'}
        </Button>
      </div>
    </form>
  );
};

export default MaterialForm;
