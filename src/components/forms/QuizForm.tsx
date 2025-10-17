import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, X } from 'lucide-react';
import { createQuizSchema, updateQuizSchema, type CreateQuizFormData, type UpdateQuizFormData } from '../../lib/validations';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface QuizFormProps {
  initialData?: Partial<CreateQuizFormData>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

const QuizForm: React.FC<QuizFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  mode,
}) => {
  const schema = mode === 'create' ? createQuizSchema : updateQuizSchema;
  
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateQuizFormData | UpdateQuizFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...initialData,
      // Remove IDs from questions for new quizzes - backend will generate them
      questions: initialData?.questions?.map((q) => ({
        questionText: q.questionText,
        questionType: q.questionType,
        difficulty: q.difficulty,
        points: q.points,
        orderIndex: q.orderIndex,
        explanation: q.explanation,
        options: q.options?.map((opt) => ({
          optionText: opt.optionText,
          orderIndex: opt.orderIndex,
          isCorrect: opt.isCorrect
        })) || []
      })) || [{ 
        questionText: '', 
        questionType: 'multiple-choice' as const, 
        difficulty: 'easy' as const,
        points: 1,
        orderIndex: 0,
        explanation: '',
        options: [
          {
            optionText: '',
            orderIndex: 0,
            isCorrect: false
          },
          {
            optionText: '',
            orderIndex: 1,
            isCorrect: false
          }
        ]
      }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  const watchedQuestions = watch('questions');

  const addQuestion = () => {
    append({
      questionText: '',
      questionType: 'multiple-choice' as const,
      difficulty: 'easy' as const,
      points: 1,
      orderIndex: fields.length,
      explanation: '',
      options: [
        {
          optionText: '',
          orderIndex: 0,
          isCorrect: false
        },
        {
          optionText: '',
          orderIndex: 1,
          isCorrect: false
        }
      ]
    });
  };

  const handleQuestionTypeChange = (questionIndex: number, newType: 'multiple-choice' | 'true-false') => {
    let newOptions: any[] = [];
    
    switch (newType) {
      case 'multiple-choice':
        newOptions = [
          { optionText: '', orderIndex: 0, isCorrect: false },
          { optionText: '', orderIndex: 1, isCorrect: false }
        ];
        break;
      case 'true-false':
        newOptions = [
          { optionText: 'True', orderIndex: 0, isCorrect: false },
          { optionText: 'False', orderIndex: 1, isCorrect: false }
        ];
        break;
    }
    
    setValue(`questions.${questionIndex}.questionType`, newType);
    setValue(`questions.${questionIndex}.options`, newOptions);
  };

  const addOption = (questionIndex: number) => {
    const currentOptions = watchedQuestions?.[questionIndex]?.options || [];
    const newOptions = [...currentOptions, {
      optionText: '',
      orderIndex: currentOptions.length,
      isCorrect: false
    }];
    setValue(`questions.${questionIndex}.options`, newOptions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const currentOptions = watchedQuestions?.[questionIndex]?.options || [];
    if (currentOptions.length > 1) {
      const newOptions = currentOptions.filter((_, index) => index !== optionIndex);
      // Update orderIndex for remaining options
      const updatedOptions = newOptions.map((option, index) => ({
        ...option,
        orderIndex: index
      }));
      setValue(`questions.${questionIndex}.options`, updatedOptions);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Quiz Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Quiz Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Quiz Title"
            {...register('title')}
            error={errors.title?.message}
            placeholder="Enter quiz title"
          />
          
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
              <p className="mt-1 text-sm text-red-600">{errors.difficulty.message}</p>
            )}
          </div>
        </div>

        <Input
          label="Description"
          {...register('description')}
          error={errors.description?.message}
          placeholder="Enter quiz description (optional)"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Duration (minutes)"
            type="number"
            {...register('durationMinutes', { valueAsNumber: true })}
            error={errors.durationMinutes?.message}
            placeholder="30"
          />
          
          <Input
            label="Total Questions"
            type="number"
            {...register('maxAttempts', { valueAsNumber: true })}
            error={errors.maxAttempts?.message}
            placeholder="10"
          />
          
          <Input
            label="Passing Score (%)"
            type="number"
            {...register('passingScorePercentage', { valueAsNumber: true })}
            error={errors.passingScorePercentage?.message}
            placeholder="70"
          />
        </div>

        <Input
          label="Category"
          {...register('category')}
          error={errors.category?.message}
          placeholder="Enter category (optional)"
        />
      </div>

      {/* Questions Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Questions</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addQuestion}
            icon={<Plus className="h-4 w-4" />}
          >
            Add Question
          </Button>
        </div>

        {fields.map((_, questionIndex) => (
          <div key={questionIndex} className="border border-gray-200 rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-gray-900">Question {questionIndex + 1}</h4>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(questionIndex)}
                  icon={<Trash2 className="h-4 w-4" />}
                >
                  Remove
                </Button>
              )}
            </div>
            
            {/* Hidden input for question ID */}

            <Input
              label="Question Text"
              {...register(`questions.${questionIndex}.questionText`)}
              error={errors.questions?.[questionIndex]?.questionText?.message}
              placeholder="Enter your question"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Type
                </label>
                <select
                  value={watchedQuestions?.[questionIndex]?.questionType || 'multiple-choice'}
                  onChange={(e) => handleQuestionTypeChange(questionIndex, e.target.value as 'multiple-choice' | 'true-false')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="true-false">True/False</option>
                </select>
              </div>

              <Input
                label="Points"
                type="number"
                {...register(`questions.${questionIndex}.points`, { valueAsNumber: true })}
                error={errors.questions?.[questionIndex]?.points?.message}
                placeholder="1"
              />
            </div>

            {/* Options for multiple choice questions */}
            {watchedQuestions?.[questionIndex]?.questionType === 'multiple-choice' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Options</label>
                {watchedQuestions?.[questionIndex]?.options?.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center space-x-2">
                    <Input
                      {...register(`questions.${questionIndex}.options.${optionIndex}.optionText`)}
                      placeholder={`Option ${optionIndex + 1}`}
                      className="flex-1"
                    />
                    <div className="flex items-center space-x-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`question-${questionIndex}-correct`}
                          checked={option.isCorrect || false}
                          onChange={(e) => {
                            if (e.target.checked) {
                              // Set all options to false first
                              const currentOptions = watchedQuestions?.[questionIndex]?.options || [];
                              const updatedOptions = currentOptions.map((opt, idx) => ({
                                ...opt,
                                isCorrect: idx === optionIndex
                              }));
                              setValue(`questions.${questionIndex}.options`, updatedOptions);
                            }
                          }}
                          className="mr-1"
                        />
                        <span className="text-sm">Correct</span>
                      </label>
                      {(watchedQuestions?.[questionIndex]?.options?.length || 0) > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(questionIndex, optionIndex)}
                          icon={<X className="h-4 w-4" />}
                        />
                      )}
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addOption(questionIndex)}
                  icon={<Plus className="h-4 w-4" />}
                >
                  Add Option
                </Button>
              </div>
            )}

            {/* True/False Question */}
            {watchedQuestions?.[questionIndex]?.questionType === 'true-false' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Correct Answer</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={`question-${questionIndex}-true-false`}
                      checked={watchedQuestions?.[questionIndex]?.options?.[0]?.isCorrect === true}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setValue(`questions.${questionIndex}.options`, [
                            { optionText: 'True', orderIndex: 0, isCorrect: true },
                            { optionText: 'False', orderIndex: 1, isCorrect: false }
                          ]);
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium">True</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={`question-${questionIndex}-true-false`}
                      checked={watchedQuestions?.[questionIndex]?.options?.[1]?.isCorrect === true}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setValue(`questions.${questionIndex}.options`, [
                            { optionText: 'True', orderIndex: 0, isCorrect: false },
                            { optionText: 'False', orderIndex: 1, isCorrect: true }
                          ]);
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium">False</span>
                  </label>
                </div>
              </div>
            )}


            <Input
              label="Explanation (optional)"
              {...register(`questions.${questionIndex}.explanation`)}
              error={errors.questions?.[questionIndex]?.explanation?.message}
              placeholder="Explain why this is the correct answer"
            />
          </div>
        ))}
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
        >
          {mode === 'create' ? 'Create Quiz' : 'Update Quiz'}
        </Button>
      </div>
    </form>
  );
};

export default QuizForm;
