import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { updateMaterial } from '../../store/slices/materialsSlice';
import { closeModal as closeUIModal } from '../../store/slices/uiSlice';
import { addNotification } from '../../store/slices/uiSlice';
import { getErrorMessage } from '../../lib/utils';
import Modal from '../ui/Modal';
import MaterialForm from '../forms/MaterialForm';

const EditMaterialModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { selectedMaterial, isLoading } = useAppSelector((state) => state.materials);
  const { modals } = useAppSelector((state) => state.ui);

  const handleSubmit = async (data: any) => {
    if (!selectedMaterial) return;

    try {
      await dispatch(updateMaterial({ id: selectedMaterial.id, materialData: data })).unwrap();
      dispatch(closeUIModal('editMaterial'));
      dispatch(addNotification({
        type: 'success',
        title: 'Success',
        message: 'Material updated successfully',
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: getErrorMessage(error),
      }));
    }
  };

  const handleCancel = () => {
    dispatch(closeUIModal('editMaterial'));
  };

  if (!selectedMaterial) return null;

  return (
    <Modal
      isOpen={modals.editMaterial}
      onClose={handleCancel}
      title="Edit Material"
      size="lg"
    >
      <MaterialForm
        initialData={{
          title: selectedMaterial.title,
          description: selectedMaterial.description,
          type: selectedMaterial.type,
          url: selectedMaterial.url,
          filePath: selectedMaterial.filePath,
          fileName: selectedMaterial.fileName,
          fileSize: selectedMaterial.fileSize,
          mimeType: selectedMaterial.mimeType,
          category: selectedMaterial.category,
          difficulty: selectedMaterial.difficulty,
        }}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
        mode="edit"
      />
    </Modal>
  );
};

export default EditMaterialModal;
