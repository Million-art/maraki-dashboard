import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { updateQuiz } from '../../store/slices/quizzesSlice';
import { closeModal as closeUIModal } from '../../store/slices/uiSlice';
import { addNotification } from '../../store/slices/uiSlice';
import Modal from '../ui/Modal';
import QuizForm from '../forms/QuizForm';

const EditQuizModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { selectedQuiz, isLoading } = useAppSelector((state) => state.quizzes);
  const { modals } = useAppSelector((state) => state.ui);

  const handleSubmit = async (data: any) => {
    if (!selectedQuiz) return;

    try {
      await dispatch(updateQuiz({ id: selectedQuiz.id, quizData: data })).unwrap();
      dispatch(closeUIModal('editQuiz'));
      dispatch(addNotification({
        type: 'success',
        title: 'Success',
        message: 'Quiz updated successfully',
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
    dispatch(closeUIModal('editQuiz'));
  };

  if (!selectedQuiz) return null;

  return (
    <Modal
      isOpen={modals.editQuiz}
      onClose={handleCancel}
      title="Edit Quiz"
      size="xl"
    >
      <QuizForm
        initialData={{
          title: selectedQuiz.title,
          description: selectedQuiz.description,
          duration: selectedQuiz.duration,
          totalQuestions: selectedQuiz.totalQuestions,
          passingScore: selectedQuiz.passingScore,
          category: selectedQuiz.category,
          difficulty: selectedQuiz.difficulty,
          questions: selectedQuiz.questions,
        }}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
        mode="edit"
      />
    </Modal>
  );
};

export default EditQuizModal;
