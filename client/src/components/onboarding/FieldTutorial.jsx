import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { loadTutorialSteps, completeStep, skipTutorial } from '../../services/tutorialService';
import TutorialSpotlight from './fieldTutorial/TutorialSpotlight';
import TutorialPopup from './fieldTutorial/TutorialPopup';

export default function FieldTutorial({ isActive, onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [tutorialSteps, setTutorialSteps] = useState([]);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    // Update mobile detection on resize
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isActive) {
      loadSteps();
      setIsVisible(true);
    }
  }, [isActive]);

  const loadSteps = async () => {
    try {
      const steps = await loadTutorialSteps();
      setTutorialSteps(steps);
    } catch (error) {
      console.error('Error loading tutorial steps:', error);
    }
  };

  const handleStepComplete = async () => {
    const step = tutorialSteps[currentStep];
    if (!step) return;

    try {
      await completeStep(step.id);
      
      setCompletedSteps(prev => new Set([...prev, step.id]));

      if (currentStep < tutorialSteps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        // Tutorial completed
        await completeStep('tutorial_completed');
        
        setIsVisible(false);
        if (onComplete) onComplete();
        toast.success('🎉 Tutorial completed! You\'re all set!');
      }
    } catch (error) {
      console.error('Error completing tutorial step:', error);
    }
  };

  const handleSkip = async () => {
    try {
      await skipTutorial();
      
      setIsVisible(false);
      if (onSkip) onSkip();
      toast.info('Tutorial skipped. Check the help button (?) anytime!');
    } catch (error) {
      console.error('Error skipping tutorial:', error);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  if (!isVisible || tutorialSteps.length === 0) return null;

  const currentTutorialStep = tutorialSteps[currentStep];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 pointer-events-none ${isMobile ? 'bg-black bg-opacity-40' : 'bg-black bg-opacity-30'}`}
      >
        {/* Spotlight effect (desktop only) */}
        <TutorialSpotlight target={currentTutorialStep?.target} />
        
        {/* Tutorial popup (bottom sheet on mobile, floating on desktop) */}
        <TutorialPopup
          step={currentTutorialStep}
          currentStep={currentStep}
          totalSteps={tutorialSteps.length}
          onNext={handleStepComplete}
          onPrevious={handlePrevious}
          onSkip={handleSkip}
          isFirstStep={currentStep === 0}
          isLastStep={currentStep === tutorialSteps.length - 1}
        />
      </motion.div>
    </AnimatePresence>
  );
}