import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { deleteUser } from '../../store/slices/usersSlice';
import { closeModal as closeUIModal } from '../../store/slices/uiSlice';
import { addNotification } from '../../store/slices/uiSlice';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { AlertTriangle } from 'lucide-react';

const DeleteUserModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { selectedUser, isLoading } = useAppSelector((state) => state.users);
  const { modals } = useAppSelector((state) => state.ui);

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      await dispatch(deleteUser(selectedUser.id)).unwrap();
      dispatch(closeUIModal('deleteConfirm'));
      dispatch(addNotification({
        type: 'success',
        title: 'Success',
        message: 'User deleted successfully',
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
    dispatch(closeUIModal('deleteConfirm'));
  };

  if (!selectedUser) return null;

  return (
    <Modal
      isOpen={modals.deleteConfirm}
      onClose={handleCancel}
      title="Delete User"
      size="sm"
    >
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Are you sure you want to delete this user?
            </h3>
            <p className="text-sm text-gray-500">
              This action cannot be undone. This will permanently delete the user account.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900">User Details:</h4>
          <p className="text-sm text-gray-600">Name: {selectedUser.name}</p>
          <p className="text-sm text-gray-600">Email: {selectedUser.email}</p>
          <p className="text-sm text-gray-600">Role: {selectedUser.role}</p>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            loading={isLoading}
          >
            Delete User
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteUserModal;
