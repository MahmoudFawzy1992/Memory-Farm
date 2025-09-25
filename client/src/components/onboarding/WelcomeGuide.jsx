import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  markWelcomeAsShown, 
  completeNavigationStep, 
  skipWelcomeTutorial 
} from '../../services/welcomeGuideService';
import WelcomeStep from './welcomeGuide/WelcomeStep';
import NavigationSteps from './welcomeGuide/NavigationSteps';

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
      await markWelcomeAsShown();
      
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
      await skipWelcomeTutorial();
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
      await completeNavigationStep(stepName);
      
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