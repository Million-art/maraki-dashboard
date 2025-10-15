import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { createQuiz } from '../../store/slices/quizzesSlice';
import { closeModal as closeUIModal } from '../../store/slices/uiSlice';
import { addNotification } from '../../store/slices/uiSlice';
import Modal from '../ui/Modal';
import QuizForm from '../forms/QuizForm';

const CreateQuizModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.quizzes);
  const { modals } = useAppSelector((state) => state.ui);

  const handleSubmit = async (data: any) => {
    try {
      await dispatch(createQuiz(data)).unwrap();
      dispatch(closeUIModal('createQuiz'));
      dispatch(addNotification({
        type: 'success',
        title: 'Success',
        message: 'Quiz created successfully',
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
    dispatch(closeUIModal('createQuiz'));
  };

  return (
    <Modal
      isOpen={modals.createQuiz}
      onClose={handleCancel}
      title="Create New Quiz"
      size="xl"
    >
      <QuizForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
        mode="create"
      />
    </Modal>
  );
};

export default CreateQuizModal;
