import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { updateUser } from '../../store/slices/usersSlice';
import { closeModal as closeUIModal } from '../../store/slices/uiSlice';
import { addNotification } from '../../store/slices/uiSlice';
import Modal from '../ui/Modal';
import UserForm from '../forms/UserForm';
import type { UpdateUserFormData } from '../../lib/validations';

const EditUserModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { selectedUser, isLoading } = useAppSelector((state) => state.users);
  const { modals } = useAppSelector((state) => state.ui);

  const handleSubmit = async (data: UpdateUserFormData) => {
    if (!selectedUser) return;

    try {
      await dispatch(updateUser({ id: selectedUser.id, userData: data })).unwrap();
      dispatch(closeUIModal('editUser'));
      dispatch(addNotification({
        type: 'success',
        title: 'Success',
        message: 'User updated successfully',
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
    dispatch(closeUIModal('editUser'));
  };

  if (!selectedUser) return null;

  return (
    <Modal
      isOpen={modals.editUser}
      onClose={handleCancel}
      title="Edit User"
      size="md"
    >
      <UserForm
        initialData={{
          name: selectedUser.name,
          email: selectedUser.email,
          role: selectedUser.role,
        }}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
        mode="edit"
      />
    </Modal>
  );
};

export default EditUserModal;
