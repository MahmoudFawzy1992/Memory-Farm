import { motion } from 'framer-motion';
import { calculatePopupPosition } from '../../../utils/popupPositioning';
import TutorialArrow from './TutorialArrow';

/**
 * Tutorial popup component showing step information and navigation
 */
export default function TutorialPopup({ 
  step, 
  currentStep, 
  totalSteps, 
  onNext, 
  onPrevious, 
  onSkip, 
  isFirstStep, 
  isLastStep 
}) {
  if (!step) return null;

  const isMobile = window.innerWidth < 768;
  const popupWidth = isMobile ? Math.min(300, window.innerWidth - 30) : 320;
  const positionStyle = calculatePopupPosition(step.target, step.placement);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="absolute pointer-events-auto z-50"
      style={{
        ...positionStyle,
        width: popupWidth
      }}
    >
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4">
        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-purple-600">
              {currentStep + 1}/{totalSteps}
            </span>
            <button
              onClick={onSkip}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Skip
            </button>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-purple-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <h3 className="font-medium text-gray-900 mb-2 text-sm">
            {step.title}
          </h3>
          <p className="text-gray-600 text-xs leading-relaxed">
            {step.content}
          </p>
        </div>

        {/* Action buttons */}
        <div className={`flex gap-2 ${isMobile ? 'flex-col' : ''}`}>
          {!isFirstStep && (
            <button
              onClick={onPrevious}
              className={`text-gray-600 py-2 px-3 rounded text-xs border border-gray-300 hover:bg-gray-50 transition-colors ${
                isMobile ? 'w-full' : 'flex-1'
              }`}
            >
              ← Back
            </button>
          )}
          
          <button
            onClick={onNext}
            className={`bg-purple-600 text-white py-2 px-3 rounded font-medium hover:bg-purple-700 text-xs transition-colors ${
              isMobile ? 'w-full' : 'flex-1'
            }`}
          >
            {isLastStep ? 'Finish! ✨' : 'Next →'}
          </button>
        </div>
      </div>

      {/* Arrow pointing to target element - only on desktop */}
      {!isMobile && <TutorialArrow placement={step.placement} />}
    </motion.div>
  );
}