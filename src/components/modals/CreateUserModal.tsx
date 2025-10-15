import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { createUser } from '../../store/slices/usersSlice';
import { closeModal as closeUIModal } from '../../store/slices/uiSlice';
import { addNotification } from '../../store/slices/uiSlice';
import Modal from '../ui/Modal';
import UserForm from '../forms/UserForm';
import type { CreateUserFormData } from '../../lib/validations';

const CreateUserModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.users);
  const { modals } = useAppSelector((state) => state.ui);

  const handleSubmit = async (data: CreateUserFormData) => {
    try {
      await dispatch(createUser(data)).unwrap();
      dispatch(closeUIModal('createUser'));
      dispatch(addNotification({
        type: 'success',
        title: 'Success',
        message: 'User created successfully',
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: error as string,
      }));
    }
  };

  const handleCancel = () => {
    dispatch(closeUIModal('createUser'));
  };

  return (
    <Modal
      isOpen={modals.createUser}
      onClose={handleCancel}
      title="Create New User"
      size="md"
    >
      <UserForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
        mode="create"
      />
    </Modal>
  );
};

export default CreateUserModal;
