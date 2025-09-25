import { useState } from 'react';
import { motion } from 'framer-motion';
import { NAVIGATION_STEPS } from '../../../constants/welcomeGuideSteps';

/**
 * Navigation steps component showing app features
 */
export default function NavigationSteps({ onStepComplete, isLoading }) {
  const [currentNavStep, setCurrentNavStep] = useState(0);
  
  const currentStep = NAVIGATION_STEPS[currentNavStep];

  const handleNext = async () => {
    await onStepComplete(currentStep.stepName);
    
    if (currentNavStep < NAVIGATION_STEPS.length - 1) {
      setCurrentNavStep(currentNavStep + 1);
    } else {
      // Move to new memory tutorial
      await onStepComplete('navigation_complete', 'new-memory');
    }
  };

  const handlePrevious = () => {
    if (currentNavStep > 0) {
      setCurrentNavStep(currentNavStep - 1);
    }
  };

  return (
    <div className="p-8">
      <div className="text-center mb-6">
        <motion.div
          key={currentStep.icon}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-5xl mb-3"
        >
          {currentStep.icon}
        </motion.div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {currentStep.title}
        </h3>
        
        <p className="text-gray-600 mb-3">
          {currentStep.description}
        </p>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <p className="text-sm text-purple-700 font-medium">
            ✨ {currentStep.highlight}
          </p>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="flex justify-center mb-6">
        {NAVIGATION_STEPS.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full mx-1 transition-colors ${
              index === currentNavStep 
                ? 'bg-purple-600' 
                : index < currentNavStep 
                  ? 'bg-purple-300' 
                  : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-3">
        {currentNavStep > 0 && (
          <button
            onClick={handlePrevious}
            className="flex-1 text-gray-600 py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            ← Previous
          </button>
        )}
        
        <button
          onClick={handleNext}
          disabled={isLoading}
          className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Loading...
            </span>
          ) : currentNavStep === NAVIGATION_STEPS.length - 1 ? (
            'Create First Memory ✨'
          ) : (
            'Next →'
          )}
        </button>
      </div>
      
      <p className="text-xs text-gray-400 text-center mt-4">
        Step {currentNavStep + 1} of {NAVIGATION_STEPS.length}
      </p>
    </div>
  );
}