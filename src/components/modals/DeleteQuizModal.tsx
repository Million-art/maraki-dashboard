import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { deleteQuiz } from '../../store/slices/quizzesSlice';
import { closeModal as closeUIModal } from '../../store/slices/uiSlice';
import { addNotification } from '../../store/slices/uiSlice';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { AlertTriangle } from 'lucide-react';

const DeleteQuizModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { selectedQuiz, isLoading } = useAppSelector((state) => state.quizzes);
  const { modals } = useAppSelector((state) => state.ui);

  const handleDelete = async () => {
    if (!selectedQuiz) return;

    try {
      await dispatch(deleteQuiz(selectedQuiz.id)).unwrap();
      dispatch(closeUIModal('deleteConfirm'));
      dispatch(addNotification({
        type: 'success',
        title: 'Success',
        message: 'Quiz deleted successfully',
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

  if (!selectedQuiz) return null;

  return (
    <Modal
      isOpen={modals.deleteConfirm}
      onClose={handleCancel}
      title="Delete Quiz"
      size="sm"
    >
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Are you sure you want to delete this quiz?
            </h3>
            <p className="text-sm text-gray-500">
              This action cannot be undone. This will permanently delete the quiz and all its questions.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900">Quiz Details:</h4>
          <p className="text-sm text-gray-600">Title: {selectedQuiz.title}</p>
          <p className="text-sm text-gray-600">Difficulty: {selectedQuiz.difficulty}</p>
          <p className="text-sm text-gray-600">Questions: {selectedQuiz.totalQuestions}</p>
          <p className="text-sm text-gray-600">Duration: {selectedQuiz.duration} minutes</p>
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
            Delete Quiz
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteQuizModal;
