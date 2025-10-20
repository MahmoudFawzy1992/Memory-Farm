import { motion } from 'framer-motion';
import { calculatePopupPosition } from '../../../utils/popupPositioning';
import TutorialArrow from './TutorialArrow';

/**
 * Tutorial popup component showing step information and navigation
 * Mobile: Fixed bottom sheet
 * Desktop: Positioned relative to target element
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
  const positionStyle = calculatePopupPosition(step.target, step.placement);

  return (
      <motion.div
          initial={{ y: isMobile ? 100 : 0, scale: isMobile ? 1 : 0.8, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: isMobile ? 100 : 0, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`pointer-events-auto z-50 ${isMobile ? '' : 'absolute'}`}
          style={{
            ...positionStyle,
            // Force transform to not be overridden on mobile
            ...(isMobile && { transform: 'translateX(-50%)' })
          }}
        >
      <div className={`bg-white rounded-lg shadow-2xl border border-gray-200 ${isMobile ? 'p-5' : 'p-4'}`}>
        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-2">
            <span className={`font-medium text-purple-600 ${isMobile ? 'text-sm' : 'text-xs'}`}>
              Step {currentStep + 1} of {totalSteps}
            </span>
            <button
              onClick={onSkip}
              className={`text-gray-400 hover:text-gray-600 transition-colors ${isMobile ? 'text-sm' : 'text-xs'}`}
            >
              Skip Tutorial
            </button>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div 
              className="bg-purple-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <h3 className={`font-semibold text-gray-900 mb-2 ${isMobile ? 'text-base' : 'text-sm'}`}>
            {step.title}
          </h3>
          <p className={`text-gray-600 leading-relaxed ${isMobile ? 'text-sm' : 'text-xs'}`}>
            {step.content}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {!isFirstStep && (
            <button
              onClick={onPrevious}
              className={`flex-1 text-gray-700 py-2.5 px-4 rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors font-medium ${
                isMobile ? 'text-sm' : 'text-xs'
              }`}
            >
              ← Back
            </button>
          )}
          
          <button
            onClick={onNext}
            className={`${isFirstStep ? 'w-full' : 'flex-1'} bg-purple-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-sm ${
              isMobile ? 'text-sm' : 'text-xs'
            }`}
          >
            {isLastStep ? '✨ Finish Tutorial' : 'Next →'}
          </button>
        </div>
      </div>

      {/* Arrow pointing to target element - DESKTOP ONLY */}
      {!isMobile && <TutorialArrow placement={step.placement} />}
    </motion.div>
  );
}