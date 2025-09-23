import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../../utils/axiosInstance';
import { toast } from 'react-toastify';

export default function FieldTutorial({ isActive, onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [tutorialSteps, setTutorialSteps] = useState([]);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  useEffect(() => {
    if (isActive) {
      loadTutorialSteps();
      setIsVisible(true);
    }
  }, [isActive]);

  const loadTutorialSteps = async () => {
    try {
      const response = await axios.get('/insights/onboarding/tutorial-steps', {
        headers: { 'Cache-Control': 'no-cache' }
      });
      setTutorialSteps(response.data.tutorialSteps.newMemory || []);
    } catch (error) {
      console.error('Error loading tutorial steps:', error);
      // Use corrected fallback tutorial steps with proper selectors
      setTutorialSteps(getCorrectedTutorialSteps());
    }
  };

  const handleStepComplete = async () => {
    const step = tutorialSteps[currentStep];
    if (!step) return;

    try {
      await axios.post('/insights/onboarding/step', 
        { stepName: step.id },
        { headers: { 'Cache-Control': 'no-cache' } }
      );
      
      setCompletedSteps(prev => new Set([...prev, step.id]));

      if (currentStep < tutorialSteps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        // Tutorial completed
        await axios.post('/insights/onboarding/step', 
          { stepName: 'tutorial_completed' },
          { headers: { 'Cache-Control': 'no-cache' } }
        );
        
        setIsVisible(false);
        if (onComplete) onComplete();
        toast.success('Tutorial completed! You\'re all set!');
      }
    } catch (error) {
      console.error('Error completing tutorial step:', error);
    }
  };

  const handleSkip = async () => {
    try {
      await axios.post('/insights/onboarding/skip', 
        { skipType: 'tutorial' },
        { headers: { 'Cache-Control': 'no-cache' } }
      );
      
      setIsVisible(false);
      if (onSkip) onSkip();
      toast.info('Tutorial skipped. Check the FAQ for help anytime!');
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
        className="fixed inset-0 bg-black bg-opacity-30 z-50 pointer-events-none"
      >
        {/* Spotlight effect */}
        <TutorialSpotlight target={currentTutorialStep?.target} />
        
        {/* Tutorial popup */}
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

function TutorialSpotlight({ target }) {
  const [elementRect, setElementRect] = useState(null);

  useEffect(() => {
    if (target) {
      const element = document.querySelector(target);
      if (element) {
        // Scroll element into view
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });
        
        // Wait for scroll to complete, then get position
        setTimeout(() => {
          const rect = element.getBoundingClientRect();
          setElementRect(rect);
        }, 500);
      } else {
        console.warn(`Tutorial target not found: ${target}`);
      }
    }
  }, [target]);

  if (!elementRect) return null;

  const spotlightSize = Math.min(Math.max(elementRect.width + 40, elementRect.height + 40), 200);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `radial-gradient(circle at ${elementRect.left + elementRect.width/2}px ${elementRect.top + elementRect.height/2}px, transparent ${spotlightSize/2}px, rgba(0,0,0,0.6) ${spotlightSize/2 + 20}px)`
      }}
    />
  );
}

function TutorialPopup({ 
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

  const getPopupPosition = () => {
    const element = document.querySelector(step.target);
    if (!element) {
      // If element not found, center on screen
      return { 
        top: '50%', 
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }

    const rect = element.getBoundingClientRect();
    const isMobile = window.innerWidth < 768;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // Responsive popup dimensions
    const popup = { 
      width: isMobile ? Math.min(300, viewportWidth - 30) : 320,
      height: 180
    };
    
    let position = {};
    
    if (isMobile) {
      // Mobile: Smart positioning to keep popup visible
      const spaceAbove = rect.top;
      const spaceBelow = viewportHeight - rect.bottom;
      const margin = 15;
      
      if (spaceBelow >= popup.height + margin) {
        // Position below element
        position = {
          top: Math.min(rect.bottom + margin, viewportHeight - popup.height - margin),
          left: Math.max(margin, Math.min((viewportWidth - popup.width) / 2, viewportWidth - popup.width - margin))
        };
      } else if (spaceAbove >= popup.height + margin) {
        // Position above element
        position = {
          top: Math.max(margin, rect.top - popup.height - margin),
          left: Math.max(margin, Math.min((viewportWidth - popup.width) / 2, viewportWidth - popup.width - margin))
        };
      } else {
        // Center in safe area if neither above nor below fits
        position = {
          top: Math.max(margin, (viewportHeight - popup.height) / 2),
          left: Math.max(margin, (viewportWidth - popup.width) / 2)
        };
      }
    } else {
      // Desktop positioning based on placement
      const margin = 15;
      
      switch (step.placement) {
        case 'bottom':
          position = {
            top: rect.bottom + margin,
            left: Math.max(margin, Math.min(rect.left, viewportWidth - popup.width - margin))
          };
          break;
        case 'top':
          position = {
            top: Math.max(margin, rect.top - popup.height - margin),
            left: Math.max(margin, Math.min(rect.left, viewportWidth - popup.width - margin))
          };
          break;
        case 'right':
          position = {
            top: Math.max(margin, Math.min(rect.top, viewportHeight - popup.height - margin)),
            left: Math.min(rect.right + margin, viewportWidth - popup.width - margin)
          };
          break;
        case 'left':
          position = {
            top: Math.max(margin, Math.min(rect.top, viewportHeight - popup.height - margin)),
            left: Math.max(margin, rect.left - popup.width - margin)
          };
          break;
        default:
          // Default to bottom
          position = {
            top: rect.bottom + margin,
            left: Math.max(margin, Math.min(rect.left, viewportWidth - popup.width - margin))
          };
      }
    }

    return position;
  };

  const isMobile = window.innerWidth < 768;
  const popupWidth = isMobile ? Math.min(300, window.innerWidth - 30) : 320;
  const positionStyle = getPopupPosition();

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

  function TutorialArrow({ placement }) {
    const arrowStyles = {
      bottom: 'absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full',
      top: 'absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full rotate-180',
      right: 'absolute top-1/2 left-0 transform -translate-x-full -translate-y-1/2 -rotate-90',
      left: 'absolute top-1/2 right-0 transform translate-x-full -translate-y-1/2 rotate-90'
    };

    return (
      <div className={arrowStyles[placement] || arrowStyles.bottom}>
        <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white filter drop-shadow-sm" />
      </div>
    );
  }

  // Corrected tutorial steps with proper selectors matching the actual DOM
  function getCorrectedTutorialSteps() {
    return [
      {
        id: 'new_memory_title',
        target: '.memory-title-input',
        title: 'Give Your Memory a Title ✏️',
        content: 'Start with a meaningful title that captures the essence of this moment.',
        placement: 'bottom'
      },
      {
        id: 'emotion_selector',
        target: '.emotion-selector', // Fixed: actual class name from EmotionInput.jsx
        title: 'How Are You Feeling? 🎭',
        content: 'Choose the emotion that best matches this moment.',
        placement: 'right'
      },
      {
        id: 'intensity_slider',
        target: '.intensity-slider', // Fixed: actual class name from MoodBlock.jsx
        title: 'Emotion Intensity 🌡️',
        content: 'How strong is this feeling? Slide to show the intensity.',
        placement: 'bottom'
      },
      {
        id: 'memory_date',
        target: '.memory-date', // Correct: matches NewMemoryLayout.jsx
        title: 'When Did This Happen? 📅',
        content: 'Set when this memory occurred. You can backdate memories too!',
        placement: 'right'
      },
      {
        id: 'color_picker',
        target: '.color-picker', // Correct: matches NewMemoryLayout.jsx
        title: 'Choose Your Memory Color 🎨',
        content: 'Pick a color that represents this memory\'s mood.',
        placement: 'top'
      },
      {
        id: 'block_editor',
        target: '.floating-block-selector', // Fixed: actual class name from FloatingBlockSelector.jsx
        title: 'Add Rich Content ✨',
        content: 'Use + to add images, checklists, or more text blocks.',
        placement: 'left'
      }
    ];
  }