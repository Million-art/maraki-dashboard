import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { createMaterial } from '../../store/slices/materialsSlice';
import { closeModal as closeUIModal } from '../../store/slices/uiSlice';
import { addNotification } from '../../store/slices/uiSlice';
import { getErrorMessage } from '../../lib/utils';
import Modal from '../ui/Modal';
import MaterialForm from '../forms/MaterialForm';

const CreateMaterialModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.materials);
  const { modals } = useAppSelector((state) => state.ui);

  const handleSubmit = async (data: any) => {
    try {
      await dispatch(createMaterial(data)).unwrap();
      dispatch(closeUIModal('createMaterial'));
      dispatch(addNotification({
        type: 'success',
        title: 'Success',
        message: 'Material created successfully',
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
    dispatch(closeUIModal('createMaterial'));
  };

  return (
    <Modal
      isOpen={modals.createMaterial}
      onClose={handleCancel}
      title="Create New Material"
      size="lg"
    >
      <MaterialForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
        mode="create"
      />
    </Modal>
  );
};

export default CreateMaterialModal;
