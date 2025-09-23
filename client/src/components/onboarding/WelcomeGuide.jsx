import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosInstance';
import { toast } from 'react-toastify';

export default function WelcomeGuide({ onComplete, onSkip }) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState('welcome');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Simple check - if this component is rendered, show it
    setIsVisible(true);
  }, []);

  const handleStartTutorial = async () => {
    setIsLoading(true);
    try {
      // Mark welcome as shown
      await axios.post('/insights/onboarding/welcome');
      
      // Start with navigation overview
      setCurrentStep('navigation');
      
      toast.success('Let\'s start your Memory Farm journey!');
    } catch (error) {
      console.error('Error starting tutorial:', error);
      toast.error('Failed to start tutorial');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipTutorial = async () => {
    setIsLoading(true);
    try {
      await axios.post('/insights/onboarding/skip', { skipType: 'tutorial' });
      setIsVisible(false);
      if (onSkip) onSkip();
      toast.info('Tutorial skipped. You can access help anytime!');
    } catch (error) {
      console.error('Error skipping tutorial:', error);
      toast.error('Failed to skip tutorial');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigationStep = async (stepName, nextAction) => {
    try {
      await axios.post('/insights/onboarding/step', { stepName });
      
      if (nextAction === 'new-memory') {
        setIsVisible(false);
        navigate('/new');
        if (onComplete) onComplete('navigation-complete');
      } else if (nextAction === 'next-step') {
        setCurrentStep(nextAction);
      }
    } catch (error) {
      console.error('Error completing step:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          {currentStep === 'welcome' && (
            <WelcomeStep
              onStart={handleStartTutorial}
              onSkip={handleSkipTutorial}
              isLoading={isLoading}
            />
          )}
          
          {currentStep === 'navigation' && (
            <NavigationSteps
              onStepComplete={handleNavigationStep}
              isLoading={isLoading}
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function WelcomeStep({ onStart, onSkip, isLoading }) {
  return (
    <div className="p-8 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="text-6xl mb-4"
      >
        🌸
      </motion.div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Welcome to Memory Farm!
      </h2>
      
      <p className="text-gray-600 mb-6 leading-relaxed">
        Let's take a quick tour and create your first memory together. 
        I'll show you around and help you get started on your journey of 
        capturing precious moments.
      </p>
      
      <div className="space-y-3">
        <button
          onClick={onStart}
          disabled={isLoading}
          className="w-full bg-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Starting...
            </span>
          ) : (
            '✨ Start Your Journey'
          )}
        </button>
        
        <button
          onClick={onSkip}
          disabled={isLoading}
          className="w-full text-gray-500 py-2 px-4 rounded-lg hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          Skip Tutorial
        </button>
      </div>
      
      <p className="text-xs text-gray-400 mt-4">
        💡 You can always access help later from the FAQ button
      </p>
    </div>
  );
}

function NavigationSteps({ onStepComplete, isLoading }) {
  const [currentNavStep, setCurrentNavStep] = useState(0);
  
  const navSteps = [
    {
      stepName: 'discover_explained',
      icon: '🌍',
      title: 'Discover Community',
      description: 'Explore public memories shared by our community. Get inspired by others\' stories and emotions.',
      highlight: 'Find beautiful stories from around the world!'
    },
    {
      stepName: 'mood_tracker_explained',
      icon: '📊',
      title: 'Mood Tracker',
      description: 'View your emotional journey over time. See patterns, trends, and insights about your feelings.',
      highlight: 'Track your emotional growth and patterns!'
    }
  ];

  const currentStep = navSteps[currentNavStep];

  const handleNext = async () => {
    await onStepComplete(currentStep.stepName);
    
    if (currentNavStep < navSteps.length - 1) {
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
        {navSteps.map((_, index) => (
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
          ) : currentNavStep === navSteps.length - 1 ? (
            'Create First Memory ✨'
          ) : (
            'Next →'
          )}
        </button>
      </div>
      
      <p className="text-xs text-gray-400 text-center mt-4">
        Step {currentNavStep + 1} of {navSteps.length}
      </p>
    </div>
  );
}